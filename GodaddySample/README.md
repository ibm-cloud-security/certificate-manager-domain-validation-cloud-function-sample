# Certificate Order - DNS Domain Validation sample for GoDaddy
## Prerequisites
 
1. An instance of [IBM Cloud Certificate Manager.](https://cloud.ibm.com/docs/services/certificate-manager)
2. A GoDaddy API key and secret, which can be obtained by following [this guide](https://developer.godaddy.com/getstarted)
    a. Create a production key - not OTE - to be able to make changes to your domain in the GoDaddy production environment
    b. Remember to copy the secret now because it is only shown once
    c. Current developer keys for your GoDaddy account can be found [here](https://developer.godaddy.com/keys)


## Configuration
### IBM Cloud Function action
1. Create a new [IBM Cloud Function action](https://cloud.ibm.com/docs/openwhisk/index.html#openwhisk_start_hello_world)
   
   * In IBM Cloud Functions, select **Actions** from the sidebar
   * Click on **Create**
   * Follow the on-screen instructions
   
2. Deploy the sample
   
   Select **Code** from the sidebar, and paste the contents of the **main.js** file of the sample
 
3. [Bind parameters to the action](https://cloud.ibm.com/docs/openwhisk/parameters.html#default-params-action) 

   Select **Parameters** from the sidebar, and add the following:
   
    1. `allowedCertificateManagerCRNs` - a JSON Object containing a list of Certificate Manager instances that are allowed to invoke this function.
        Apply it in order to protect your cloud function from being invoked by unauthorized clients.  
        E.g. `{"crn:v1:bluemix:public:cloudcerts:us-south:a....":true,"crn:v1:bluemix:public:cloudcerts:eu-de:a...":true}` 
        
        * Find your Certificate Manager instance CRN from the Settings sidebar item
        * Or from CLI: `ibmcloud resource service-instance [INSTANCE NAME]`, grab the `ID` value
       
    2. `godaddyKey` - the GoDaddy API key
 
    3. `godaddySecret` - the GoDaddy API secret
 
4. In the **Endpoints** sidebar, tick the **Enable as Web Action** checkbox
 
