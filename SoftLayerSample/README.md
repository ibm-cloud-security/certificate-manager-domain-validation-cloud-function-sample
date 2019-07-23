# Certificate Order -  DNS Domain Validation sample for SofLayer
## Prerequisites
 
1. An instance of [IBM Cloud Certificate Manager.](https://cloud.ibm.com/docs/services/certificate-manager)
2. Account in SoftLayer

> **Note** Before you can work with DNS records in SoftLayer, make sure to request appropriate access permissions from the account owner.

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
       
    2. `cmRegion` - your Certificate Manager service instance region value. Can be one of: `us-south`, `eu-gb`, `eu-de`, `jp-tok`  
        E.g. `"us-south"`
 
    3. `softLayerUser` - IBM id of an owner of SoftLayer account (it looks like `IBM1234567`)
    
    4. `softLayerApiKey` - apikey of an owner of SoftLayer account
 
         * Create an API key in **SoftLayer -> Account -> Users**, select user, click on **Generate** .
         
  4. In the **Endpoints** sidebar, tick the **Enable as Web Action** checkbox
 
