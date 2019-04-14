const {promisify} = require('bluebird');
const request = promisify(require('request'));
const jwtVerify = promisify(require('jsonwebtoken').verify);
const jwtDecode = require('jsonwebtoken').decode;

//The CIS instance CRN  TODO use the correct internet service crn.
const cisCrn = 'crn:v1:bluemix:public:internet-svcs:global:a/<YOUR_ACCOUNT_ID>:<YOUR_INSTANCE_ID>';

//The base CIS url.
const baseCisUrl = `https://api.cis.cloud.ibm.com/v1/${encodeURIComponent(cisCrn)}`;

//The certificate manager service API url. TODO use the correct url according to the region of your instance.
const certificateManagerApiUrl = 'https://<YOUR_INSTANCE_REGION>.certificate-manager.cloud.ibm.com';

//The IAM token url to obtain access token for CIS.
const iamTokenUrl = 'https://iam.cloud.ibm.com/identity/token';

/**
 * Get the public key.
 * @param body
 * @returns {Promise<CryptoKey | string>}
 */
async function getPublicKey(body) {

    const keysOptions = {
        method: 'GET',
        url: `${certificateManagerApiUrl}/api/v1/instances/${encodeURIComponent(body.instance_crn)}/notifications/publicKey?keyFormat=pem`,
        headers: {
            'cache-control': 'no-cache'
        }
    };

    const keysResponse = await request(keysOptions);
    if (keysResponse.statusCode === 200)
        return JSON.parse(keysResponse.body).publicKey;
    else {
        console.log(`Demo: Couldn't retrieve public key for instance ${body.instance_crn} . Reason is: ${JSON.stringify(keysResponse.body)}`);
        throw new Error(`Couldn't retrieve public key for instance ${body.instance_crn}`);
    }
}

/**
 * Set the challenge TXT record.
 * @param payload
 * @returns {Promise<void>}
 */
async function setChallenge(payload, iamApiKey) {


    console.info(`Demo: Challenge for '${payload.domain} : ${JSON.stringify(payload.challenge)}`);

    if (!iamApiKey) {
        console.error('Demo: Can\'t set challenge. iamApiKey is missing.');
        throw{
            statusCode: 403,
            message: `Can't set challenge. iamApiKey is missing`
        };
    }


    //Obtain the access token fot CIS.
    const accessToken = await obtainAccessToken(iamApiKey);

    let domain = payload.domain;

    //remove wildcard in case its wildcard certificate.
    domain = domain.replace('*.', '');


    const recordName = payload.challenge.txt_record_name;

    const token = payload.challenge.txt_record_val;

    //Get the the zone id and its status.
    const zone = await getZoneId(domain, accessToken);

    //Add the challenge TXT record.
    const options = {
        uri: `${baseCisUrl}/zones/${zone.id}/dns_records`,
        method: "POST",
        headers: {
            'X-Auth-User-Token': accessToken,
            'Content-Type': 'application/json'
        },
        json: {
            type: 'TXT',
            name: `${recordName}.${domain}`,     //according to acme dns challenge.
            content: token,      //The TXT record value.
            ttl: 120,
        }
    };

    try {
        const res = await request(options);
        if (res.statusCode === 200 && res.body.success) {
            console.log(`Demo: insert TXT record finished successfully`);
        } else if (res.statusCode === 400 && res.body.errors && res.body.errors.length > 0 && res.body.errors[0].message === 'The record already exists.') {
            console.log(`Demo: TXT record already exists - return 200`);
        } else {
            console.log(`Demo: Failed to add TXT record to CIS with statusCode: ${res.statusCode} and body ${JSON.stringify(res.body)}`);
            throw new Error(res.body);
        }

    } catch (err) {
        console.error(`Demo: Add TXT record failed with error: ${typeof err.message === 'string' ? err.message : JSON.stringify(err)}`);
        throw err;
    }
}


/**
 * Get zone id by domain name
 * @returns {Promise<*>}
 * @param domain
 * @param accessToken
 */
const getZoneId = async (domain, accessToken) => {

    console.log(`Demo:  Start get zone for domain ${domain}`);

    const options = {
        uri: `${baseCisUrl}/zones?name=${domain}&status=active&page=1&per_page=1&order=status&direction=desc&match=all`,
        method: "GET",
        headers: {
            'X-Auth-User-Token': accessToken,
            'Content-Type': 'application/json'
        }
    };

    try {
        const res = await request(options);
        const resBody = JSON.parse(res.body);
        if (res.statusCode === 200 && resBody.success) {
            if (resBody.result && resBody.result.length > 0) {
                return {id: resBody.result[0].id, status: resBody.result[0].status};
            } else {
                console.log(`Demo: failed to find zone named ${domain} with error ${JSON.stringify(res.body)}`);
                throw JSON.stringify(res.body);
            }
        } else {
            console.log(`Demo:  Couldn't find zone named ${domain}. Reason: response body is ${JSON.stringify(res.body)}, response code is ${res.statusCode}`);
            throw JSON.stringify(res.body);
        }
    } catch (err) {
        console.error(`Demo:  Couldn't find zone named ${domain}. Reason:${typeof err.message === 'string' ? err.message : JSON.stringify(err)}`);
        throw err;
    }
};


/**
 * Return the dns record id
 * @param domain
 * @param zoneId
 * @param accessToken
 * @returns {Promise<*>}
 */
async function getAcmeChallengeDNSRecordIDs(domain, zoneId, accessToken) {

    const options = {
        uri: `${baseCisUrl}/zones/${zoneId}/dns_records?type=TXT&name=_acme-challenge.${encodeURIComponent(domain)}`,
        method: "GET",
        headers: {
            'X-Auth-User-Token': accessToken,
            'Content-Type': 'application/json'
        }
    };

    try {
        const res = await request(options);
        if (res.statusCode === 200) {
            console.log(`Demo: Get all TXT records finished successfully. Body is: ${JSON.stringify(res.body)}`);
            return JSON.parse(res.body).result.map(r => r.id);
        } else {
            console.log(`Demo: Get all TXT records failed with status code: ${res.statusCode} and body ${JSON.stringify(res.body)}`);
            throw new Error(res.body);
        }

    } catch (err) {
        console.error(`Demo: Get all TXT records failed with error: ${err.message ? err.message : JSON.stringify(err)}`);
        throw err;
    }
}


/**
 * Delete a record for the specified zone.
 * @param zone
 * @param recordId
 * @returns {Promise<void>}
 */
async function deleteRecord(zone, recordId, accessToken) {

    const options = {
        uri: `${baseCisUrl}/zones/${zone.id}/dns_records/${recordId}`,
        method: "DELETE",
        headers: {
            'X-Auth-User-Token': accessToken,
            'Content-Type': 'application/json'
        }
    };

    try {
        const res = await request(options);
        if (res.statusCode === 200) {
            console.log(`Demo: delete TXT record ${recordId} finished successfully. response body is: ${JSON.stringify(res.body)}`);
        } else {
            console.log(`Demo: delete TXT record ${recordId} failed with status code: ${res.statusCode} and body ${JSON.stringify(res.body)}`);
            throw new Error(res.body);
        }

    } catch (err) {
        console.error(`Demo: delete TXT record ${recordId} failed with error: ${err.message ? err.message : JSON.stringify(err)}`);
        throw err;
    }
}


/**
 *
 * @param payload
 * @param iamApiKey
 * @returns {Promise<[]>}
 */
async function removeChallenge(payload, iamApiKey) {

    if (!iamApiKey) {
        console.error(`Demo: Can't remove challenge. iamApiKey is missing.`);
        throw{
            statusCode: 403,
            message: `Can't set challenge. iamApiKey is missing`
        };
    }

    let domain = payload.domain;

    //remove wildcard in case its wildcard certificate.
    domain = domain.replace('*.', '');

    console.log(`Demo: Challenge for domain ${domain} complete. You may remove it.`);

    const accessToken = await obtainAccessToken(iamApiKey);

    const zone = await getZoneId(domain, accessToken);

    //get the dns record.
    const records = await getAcmeChallengeDNSRecordIDs(domain, zone.id, accessToken);

    //Deleting all the acme-challenge TXT records.
    return Promise.all(records.map(record => deleteRecord(zone, record, accessToken)));
}

/**
 *
 * main() will be run when you invoke this action
 *
 * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
 *
 * @return The output of this action, which must be a JSON object.
 *
 */
async function main(params) {
    console.log("Demo: cloud function invoked.");
    try {

        const body = jwtDecode(params.data);

        //Validate against the instance CRN white list -  white list is mandatory for executing the function..
        if (!params.allowedCertificateManagerCRNs || !params.allowedCertificateManagerCRNs[body.instance_crn]) {
            console.error(`Demo: CRN ${body.instance_crn} is not in the white list`);
            return Promise.reject({
                statusCode: 403,
                headers: {'Content-Type': 'application/json'},
                body: {message: 'Unauthorized'},
            });
        }



        const publicKey = await getPublicKey(body);
        const decodedNotification = await jwtVerify(params.data, publicKey);

        //validate the user who trigger the order certificate action.
        validateUser(decodedNotification.userToken);

        console.log(`Demo: message body: ${JSON.stringify(decodedNotification)}`);
        console.log(`Demo: Handling event of type ${decodedNotification.event_type}`);
        switch (decodedNotification.event_type) {
            //Handle other certificate manager event types.
            // .
            // .
            // .
            // .
            //Handling domain validation event types.
            case "cert_domain_validation_required":
                await setChallenge(decodedNotification, params.iamApiKey);
                break;
            case "cert_domain_validation_completed":
                await removeChallenge(decodedNotification, params.iamApiKey);
                break;
        }

    } catch (err) {
        console.log(`Demo: Couldn't send message. Reason:${typeof err.message === 'string' ? err.message : JSON.stringify(err)}`);
        return Promise.reject({
            statusCode: err.statusCode ? err.statusCode : 500,
            headers: {'Content-Type': 'application/json'},
            body: {message: err.message ? err.message : 'Error processing your request'},
        });
    }
    return {
        statusCode: 200,
        headers: {'Content-Type': 'application/json'},
        body: {}
    };

}


/**
 * Validate the user which trigger the order certificate action.
 * @param userToken
 */
const validateUser = (userToken) => {
    console.log(`Demo: Validating  user with token ${userToken}`)
    //TODO Validate the user.
};


/**
 * Obtain access token from IAM
 * @param iamApiKey
 * @returns {Promise<*>}
 */
const obtainAccessToken = async (iamApiKey) => {

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        body: `grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=${iamApiKey}&response_type=cloud_iam`,
        uri: iamTokenUrl
    };

    try {
        const response = await request(options);
        const body = JSON.parse(response.body);
        if (response.statusCode === 200 && body['access_token']) {
            return body['access_token'];
        }
        console.error(`Demo: Couldn't obtain access token. Reason is: status:${response.statusCode} response headers are: ${JSON.stringify(response.headers)} and body: ${JSON.stringify(response.body)}`);
        throw {
            'statusCode': 503,
            'message': 'Error obtaining access token'
        };
    } catch (error) {
        console.error(`Demo: Couldn't obtain access token. Reason is: ${error.message ? error.message : JSON.stringify(error)}`);
        throw {
            'statusCode': 500,
            'message': 'Error obtaining access token'
        };
    }

};