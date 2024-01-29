# SAP Cloud Security Configuration Dashboard

## Content Package Files
SAP_CC_SAC_Security_Configuration.package 

## Last Released:
2024.01

## What´s New
N/A

## Description
SAP cloud customers requiring security recommendations for their cloud services and a central dashboard to visualize the collected results of the security status of these cloud services.
In this content package, we will provide a template for SAP Analytics Cloud with a basic overview of the cloud security compliance. It is also intended that this template can be used as a starting point to develop more comprehensive dashboards based on the demand of each customer.

![SAP_CC_Security_Configuration](SAP_CC_Security_Configuration_Screenshot.png)

## Details
The package includes one story (SAP_CC_Security_Configuration) and one data model (SAP_CC_Security_Configuration). 
The data model receives its data from the customer´s Cloud Application Lifecycle Management via an OData Service connection and from extension content which is stored in a dimension table (SAP_CC_SecConfig_CALMAPI)

The story is based on the data model that includes demo data which needs to be deleted once the connection to Cloud ALM is established and real customer data con be imported into the SAC.

A detailed documentation on how to setup the connectivity between SAC and Cloud ALM is provided. Please refer to the attached SAP_CC_Security_Dashboard_How_To_Guide.pdf

## Connectivity
Setup an OData Service Connection to your Cloud ALM Analytics API like described in the documentation.

## Download/Install Instructions
Please check the documentation [here](https://help.sap.com/docs/SAP_ANALYTICS_CLOUD/42093f14b43c485fbe3adbbe81eff6c8/603e26204ce14bd8b5f9729a8123636f.html).

## More Information
N/A
## Contact
N/A

