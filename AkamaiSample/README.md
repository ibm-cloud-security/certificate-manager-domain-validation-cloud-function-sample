# Certificate Order -  DNS Domain Validation sample for Akamai

## Prerequisites

1. An instance of [IBM Cloud Certificate Manager](https://cloud.ibm.com/docs/services/certificate-manager)
2. Account in Akamai

> **Note:** Before you can work with DNS records in Akamai, make sure to request appropriate access permissions from the account owner.

## Configuration

### IBM Cloud Function action

1. Clone the sample code

```bash
git clone https://github.com/ibm-cloud-security/certificate-manager-domain-validation-cloud-function-sample
```

2. Enter the `AkamaiSmaple` directory

```bash
cd AkamaiSample/
```

3. Install the package

```bash
npm install npm install package-lock.json
```

4. Compress the content

```bash
zip -r action.zip *
```

5. Follow this doc to install the CLI and plug-in, https://cloud.ibm.com/docs/openwhisk?topic=openwhisk-cli_install

6. Login IBM cloud

```bash
ibmcloud login --sso
```

7. Create a new namespace

```bash
ibmcloud fn namespace create DNSCertManagerNS
```

8. Target to the new namespace

```bash
ibmcloud fn namespace target DNSCertManagerNS
```

9. Create a cloud function action and upload the sample code

```bash
ibmcloud fn action create AkamaiCertManagerAction action.zip --kind nodejs:12
```

10. [Bind parameters to the action](https://cloud.ibm.com/docs/openwhisk/parameters.html#default-params-action)

   Select **Parameters** from the sidebar, and add the following:

    1. `allowedCertificateManagerCRNs` - a JSON Object containing a list of Certificate Manager instances that are allowed to invoke this function.
        Apply it in order to protect your cloud function from being invoked by unauthorized clients.  
        E.g. `{"crn:v1:bluemix:public:cloudcerts:us-south:a....":true,"crn:v1:bluemix:public:cloudcerts:eu-de:a...":true}`

        * Find your Certificate Manager instance CRN from the Settings sidebar item
        * Or from CLI: `ibmcloud resource service-instance [INSTANCE NAME]`, grab the `ID` value

    2. `cmRegion` - your Certificate Manager service instance region value. Can be one of: `us-south`, `eu-gb`, `eu-de`, `jp-tok`  
        E.g. `"us-south"`

    3. `host` - The Akamai API endpoint hostname. (Get from Akamai client credential)

    4. `client_token` - The client token for Akamai API calling. (Get from Akamai client credential)

    5. `client_secret` - The client secret for Akamai API calling. (Get from Akamai client credential)

    6. `access_token` - The access token for Akamai API calling. (Get from Akamai client credential)

         * Refer to [this guidance](https://developer.akamai.com/api/getting-started#authsetup) to create the Akamai client credential for API calling.
