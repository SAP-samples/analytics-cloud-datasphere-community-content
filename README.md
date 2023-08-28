# SAP-samples/repository-template
This default template for SAP Samples repositories includes files for README, LICENSE, and .reuse/dep5. All repositories on github.com/SAP-samples will be created based on this template.

# Containing Files

1. The LICENSE file:
In most cases, the license for SAP sample projects is `Apache 2.0`.

2. The .reuse/dep5 file: 
The [Reuse Tool](https://reuse.software/) must be used for your samples project. You can find the .reuse/dep5 in the project initial. Please replace the parts inside the single angle quotation marks < > by the specific information for your repository.

3. The README.md file (this file):
Please edit this file as it is the primary description file for your project. You can find some placeholder titles for sections below.

# Community Content for SAP Analytics Cloud and SAP Datasphere

<!--- Register repository https://api.reuse.software/register, then add REUSE badge:
[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/REPO-NAME)](https://api.reuse.software/info/github.com/SAP-samples/REPO-NAME)
-->

## Description
<!-- Please include SEO-friendly description -->
Download content packages for SAP Analytics Cloud and SAP Datasphere. 
Find technical samples, best practices or business scenarios.
Packages contain data models, visualisations and sample data (if applicable).


## Requirements
Depending on the samples project, an SAP Analytics Cloud tenant and an SAP Datasphere tenant are required. The connection between SAP Analytics Cloud and SAP Datasphere must have the technical name "SAPDWC" (description is free).
To upload content, the user has to have administration privileges.

## Download and Installation
Content is organised in projects. Each project has one folder on this GitHub which is self-contained:
It contains the Content packages and/or CSN files for download.
It contains a detailed description of the content and how to install it. It may also point to additional sources of information if available such as a blog.
It may contain additional assets such as sample data files.

In a nutshell:
Download the CSN and the .package files to your local PC.
Use the SAP Datasphere capabilites to upload and deploy the CSN file.
Upload the .package file into the Content Network of SAP Analytics Cloud following the documentation [here](https://help.sap.com/doc/00f68c2e08b941f081002fd3691d86a7/2023.15/en-US/bf932365c52545ed9fcafd7406b4ee76.html)
.
Use the sample data files to populate the SAP Datasphere data models.

For more details, check the documentation on help.sap.com (provide link) and follow the detailed instruction shared in the readme of each project.
## Known Issues
<!-- You may simply state "No known issues. -->
No known issues.

## How to obtain support
 
For additional support, [ask a question in SAP Community](https://answers.sap.com/questions/ask.html).

You may also contact the HD&A Content Factory by mail to mailto:sap_analytics_cloud_content@sap.com

## Contributing
For the time being, contributions are limited to SAP projects. If you are a customer, partner or any other 3rd party, and wish to publish your content, please contact the HD&A Content Factory to learn about more options.

## Terms and Conditions
The content samples offered on this GitHub may be downloaded and installed without additional license fees. Content samples are provided to support an implementation project, to share best practices and to inspire your own content development. 
It is forbidden to sell these content samples or use them commercially in any way. 

Content samples have been tested and reviewed by SAP. However, they come as they are: In case of errors or other problems, SAP is not liable to offer fixes nor any kind of support, maintenance. It is recommended that you test the content, ideally in a test environment first. You can also edit, enhance, copy or otherwise use the content in your own projects. If you do this, potential updates of the sample content may not be installable without additional effort or not at all.

Content samples do not necessarily follow a naming convention, so please analyse carefully if they can be imported into your destination tenant without overwriting. Overwriting existing content in your destination tenant is not recommended.

Content or sample data may become outdated and SAP has no obligations to keep the content up-to-date. SAP may at any time without offering alternative packages deprecate content projects. 


## License
Copyright (c) 2023 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSE) file.
