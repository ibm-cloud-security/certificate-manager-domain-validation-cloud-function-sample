# Domain Validation sample
## General
This repository contains sample code for implementing domain validation.  

The sample demonstrates how to implement an [IBM Cloud function action](https://console.bluemix.net/openwhisk/) that inserts and deletes a `TXT` record to an IBM Cloud Internet Services instance.

## Prerequisites
 
1. Create a new instance of [IBM Cloud Certificate Manager.](https://console.bluemix.net/catalog/services/certificate-manager)
2. Create a new instance of [IBM Cloud Internet Services.](https://www.ibm.com/cloud/cloud-internet-services) 

## Configuration
### IBM Cloud Function action
1. Create a new [IBM Cloud Function action](https://console.bluemix.net/docs/openwhisk/index.html#openwhisk_start_hello_world)
2. [Bind parameters to the action](https://console.bluemix.net/docs/openwhisk/parameters.html#default-params-action) 
    1. `iamApiKey` - API key with `write` permissions for accessing IBM Cloud Internet Services 
    2. `instanceCrnWhiteList`  - JSON Object of the allowed Certificate Manager  instances to invoke this function.
        E.g. `{"CRN1":true,"CRN2":true}` 

### IBM Cloud Certificate Manager
1. [Setup a Callback channel](https://cloud.ibm.com/docs/services/certificate-manager?topic=certificate-manager-configuring-notifications#callback) in your Certificate Manager instance.

### Modify and deploy the sample
In **main.js**:
1. Update `cisCrn` parameter with the CIS CRN value.
2. Update `certificateManagerApiUrl` according to the region of your Certificate Manager service instance. Can be one of `us-south`, `eu-gb`, `eu-de`, `jp-tok`.
3. Deploy the code to your IBM Cloud Function action
 
### Test
1. [Order a certificate](https://cloud.ibm.com/docs/services/certificate-manager?topic=certificate-manager-managing-certificates-from-the-dashboard#importing-a-certificate).
2. Wait for the certificate to be in "Valid" state.





