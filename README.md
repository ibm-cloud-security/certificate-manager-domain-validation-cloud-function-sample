# Certificate Order - DNS Domain Validation sample
## General
IBM Cloud Certificate Manager lets you order TLS certificates signed by Let’s Encrypt.

When you order a certificate, you have to prove that you own the domains for which you are requesting the certificate for. This repository contains sample code to show you how to prove you own these domains.

The sample demonstrates how to implement an IBM Cloud Function action that receives a domain validation challenge from Certificate Manager, and answers it.

The Cloud Function action receives a notification from Certificate Manager containing a DNS TXT record challenge, and then adds this to the DNS provider where the requested domain is registered. Once the domain validation challenge is answered, the Cloud Function also clears this TXT record from the DNS service.

Instructions how to write Cloud Function if you use  **IBM Cloud Internet Services** as our DNS provider can be found [here] (https://github.com/ibm-cloud-security/certificate-manager-domain-validation-cloud-function-sample/CisSample/README.md).
Instructions how to write Cloud Function if you use  **SoftLayer** as our DNS provider can be found [here] (https://github.com/ibm-cloud-security/certificate-manager-domain-validation-cloud-function-sample/SoftLayerSample/README.md)
