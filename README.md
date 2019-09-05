# Certificate Order - DNS Domain Validation samples
## General
IBM Cloud Certificate Manager lets you order TLS certificates signed by Let’s Encrypt.

When you order a certificate, you have to prove that you own the domains for which you are requesting the certificate for. This repository contains sample code to show you how to prove you own these domains.

The samples demonstrate how to implement an IBM Cloud Function action that receives a domain validation challenge from Certificate Manager, and answer it.

The Cloud Function action receives a notification from Certificate Manager containing a DNS TXT record challenge, and then adds this to the DNS provider where the requested domain is registered. Once the domain validation challenge is answered, the Cloud Function also clears this TXT record from the DNS service.

## Setup
### IBM Cloud Functions action
You can find DNS provider-specific instructions on how to implement an IBM Cloud Function action in the following links.
* [SoftLayer](https://github.com/ibm-cloud-security/certificate-manager-domain-validation-cloud-function-sample/blob/cloudFunction/SoftLayerSample/README.md)
* [Cloudflare](https://github.com/ibm-cloud-security/certificate-manager-domain-validation-cloud-function-sample/blob/cloudFunction/CloudflareSample/README.md)
* [IBM Cloud Internet Services](https://github.com/ibm-cloud-security/certificate-manager-domain-validation-cloud-function-sample/blob/cloudFunction/CisSample/README.md)

### IBM Cloud Certificate Manager
1. Setup a Callback URL [Notification Channel](https://cloud.ibm.com/docs/services/certificate-manager?topic=certificate-manager-configuring-notifications#callback) in your Certificate Manager instance.

   > **Note**: when entering the Callback URL, make sure to use the **Web Action** URL from IBM Cloud Functions -> Endpoints and change the **.json** suffix to **.http**

## Payload structure
 
When ordering a certificate, Certificate Manager will send a request to the cloud function 2 times with the following payload:

1. **Domain Validation Required**
     ```
    {
           instance_crn: 'INSTANCE_CRN',
           certificate_manager_url: 'certificate_manager_url',
           event_type: 'cert_domain_validation_required',
           certificateCRN: 'CERTIFICATE_CRN',
           domain_validation_method: 'dns-01',
           domain: 'example.com',
           challenge: {
               txt_record_name: '_acme-challenge',
               txt_record_val: 'TXT_RECORD_VALUE'
           },
           version: 4
       }
      ```
 2. **Domain Validation Completed**
      ```
     {
            instance_crn: 'INSTANCE_CRN',
            certificate_manager_url: 'certificate_manager_url',
            event_type: 'cert_domain_validation_completed',
            certificateCRN: 'CERTIFICATE_CRN',
            domain_validation_method: 'dns-01',
            domain: 'example.com',
            challenge: {
                txt_record_name: '_acme-challenge',
                txt_record_val: 'TXT_RECORD_VALUE'
            },
            version: 4
        }
       ```
 
## Order certificate
1. [Order a Lets Encrypt certificate](https://cloud.ibm.com/docs/services/certificate-manager?topic=certificate-manager-order-certificates) using the Certificate Manager console
2. Certificate Manger will send a notification to your cloud function with domain validation challenge to prove that you control the domain. Once the challenge is validated, Certificate Manager will send a second notification with Let's Encrypt domain validation challenges
 
   > **Note:** When you [configure the callback channel](https://cloud.ibm.com/docs/services/certificate-manager?topic=certificate-manager-configuring-notifications#callback) in you Certificate Manager instance, make sure to [configure the target URL of the web action with the http extension](https://github.com/apache/incubator-openwhisk/blob/master/docs/apigateway.md#full-control-over-the-http-response) to have full control over the HTTP response code.
3. Wait for the certificate to be issued. When the order is in process, certificate metadata will have an `issuance_info.status:pending` property. Once issued, property will be `issuance_info.status:valid`. If the order fails, property will be `issuance_info.status:failed`

## FAQ
**Q: My order status is in `pending` state for a long time**   
**A:** On slow DNS networks an order may take up to about 20 minutes to complete successfully.

**Q: Which response code should I return from my cloud function to Certificate Manager?**  
**A:** Return code should be **200 OK**.

**Q: For how long will Certificate Manager try to validate the domain?**  
**A:** After sending the domain validation challenge, Certificate Manager will try to validate the domain for up to 10 minutes.

**Q: How do I check the certificate order status, using the Certificate Manager public API?**  
**A:** Use the `Get certificate metadata` API to poll the certificate order status.

**Q: Can I be notified once my order is complete?**  
**A:** You can [configure a notification channel](https://cloud.ibm.com/docs/services/certificate-manager?topic=certificate-manager-configuring-notifications#configuring-notifications) to be notified when a certificate is issued, or if your order failed.

**Q: My order failed. Why?**  
**A:** You can find an error code and message in the certificate metadata, UI, and in the notification you received when your order failed.

**Q: How can I troubleshoot errors in the execution of my cloud function?**  
**A:** You can review the Cloud Function log to find any errors that occurred during execution.

**Q: I'm not receiving certificate order events in my existing Slack notification channel. Why?**  
**A:** Upgrade your Slack notification channel to the latest version in the Certificate Manager `Settings` tab.
 
**Q: The following error is received: "Your Callback URL channel endpoint responded with an error"**  
**A:** Verify that you have used the URL from IBM Cloud Functions -> Endpoints -> **Web Actions** as the value for the Callback URL in Certificate Manager.


