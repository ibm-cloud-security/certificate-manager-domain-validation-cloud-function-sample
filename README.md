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

## Q&A
**Q: My order status is in `pending` state for a long time** 
**A:** On slow DNS networks an order may take up to about 20 minutes to complete successfully.

**Q: Which response code should be returned from the domain validation cloud function?**  
**A:** Any response code that is not **200** means that the domain validation has failed.

**Q: For how long will `Certificate Manager` try to validate the domain?**  
**A:** After sending the domain validation challenge, Certificate Manager will try to validate the domain for up to 10 minutes.

**Q: How do I check the certificate order status, using the `Certificate Manager` public API?**  
**A:** Use the `Get certificate metadata` API to poll the certificate order status.

**Q: Can I be notified once my order is complete?**  
**A:** You can [configure a Slack notification channel](https://cloud.ibm.com/docs/services/certificate-manager?topic=certificate-manager-configuring-notifications#configuring-notifications) to be notified when an ordered certificate has been issued failed.

**Q: In case of a failure during the order, How can I identify the cause of the failure?**  
**A:** Order failure notification will include an error code and a message.

**Q: How can I troubleshoot errors in the cloud function execution?**  
**A:** You can review the Cloud Function log to review any errors during execution.

