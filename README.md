# Certificate Order - DNS Domain Validation sample
## General
This repository contains sample code for implementing custom domain validation when ordering a TLS certificate from IBM Cloud Certificate Manager for a domain registered in IBM Cloud Internet Services.  

The sample demonstrates how to implement an [IBM Cloud function action](https://cloud.ibm.com/openwhisk) that adds a `DNS TXT` record to an IBM Cloud Internet Services instance domain when a notification containing a `DNS` challenge arrives, and later removes that `TXT` record when a notification about domain validation completion arrives.

## Prerequisites
 
1. An instance of [IBM Cloud Certificate Manager.](https://cloud.ibm.com/docs/services/certificate-manager)
2. An instance of [IBM Cloud Internet Services.](https://cloud.ibm.com/docs/infrastructure/cis) with a configured domain

## Configuration
### IBM Cloud Function action
1. Create a new [IBM Cloud Function action](https://cloud.ibm.com/docs/openwhisk/index.html#openwhisk_start_hello_world)
2. [Bind parameters to the action](https://cloud.ibm.com/docs/openwhisk/parameters.html#default-params-action) 
    1. `iamApiKey` - an API key with `manager` role on the specific domain on CIS for the `Reliability` functional scope.
    
        * Create an API key in your IBM Cloud account -> Manage -> Access (IAM) -> IBM Cloud API keys
    2. `allowedCertificateManagerCRNs`  - a JSON Object containing a list of allowed Certificate Manager instances to invoke this function.
        E.g. `{"CRN1":true,"CRN2":true}` 
        
        * Find your Certificate Manager instance CRN from the Notifications side bar menu -> Settings tab
        * Or from CLI: `ibmcloud resource service-instance [INSTANCE NAME]`, grab the `ID` value.

### IBM Cloud Certificate Manager
1. Setup a Callback URL [Notification Channel](https://cloud.ibm.com/docs/services/certificate-manager?topic=certificate-manager-configuring-notifications#callback) in your Certificate Manager instance.

### Modify and deploy the sample
In **main.js**:
1. Update the `cisCrn` parameter with your CIS instance CRN value
2. Update the `certificateManagerApiUrl` parameter with your Certificate Manager service instance region value. Can be one of: `us-south`, `eu-gb`, `eu-de`, `jp-tok`
3. Deploy the code to your IBM Cloud Function action
 
## Test
1. [Order a Lets Encrypt certificate](https://cloud.ibm.com/docs/services/certificate-manager?topic=certificate-manager-managing-certificates-from-the-dashboard#importing-a-certificate) using the Certificate Manager order form
2. Wait for the certificate to be in "Valid" state





