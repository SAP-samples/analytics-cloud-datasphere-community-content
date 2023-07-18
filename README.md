# SAP-samples/repository-template
This default template for SAP Samples repositories includes files for README, LICENSE, and .reuse/dep5. All repositories on github.com/SAP-samples will be created based on this template.

# Containing Files

1. The LICENSE file:
In most cases, the license for SAP sample projects is `Apache 2.0`.

2. The .reuse/dep5 file: 
The [Reuse Tool](https://reuse.software/) must be used for your samples project. You can find the .reuse/dep5 in the project initial. Please replace the parts inside the single angle quotation marks < > by the specific information for your repository.

3. The README.md file (this file):
Please edit this file as it is the primary description file for your project. You can find some placeholder titles for sections below.

# [Title]
<!-- Please include descriptive title -->
Community Content for SAP Analytics Cloud and SAP Datasphere

<!--- Register repository https://api.reuse.software/register, then add REUSE badge:
[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/REPO-NAME)](https://api.reuse.software/info/github.com/SAP-samples/REPO-NAME)
-->

## Description
<!-- Please include SEO-friendly description -->
Download content packages for SAP Analytics Cloud and SAP Datasphere. 
Find technical samples, best practices or business scenarios.
Packages contain data models, visualisations and sample data (if applicable).

## Requirements
Depending on the project, an SAP Analytics Cloud tenant and an SAP Datasphere tenant are required. 
The connection between SAP Analytics Cloud and SAP Datasphere must have the technical name "SAPDWC" (description is free).
To upload content, the user has to have administration privileges.

## Download and Installation
Content is organised in projects. Each project has one folder on this GitHub which is self-contained:
It contains the Content packages and CSN files for download.
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
no known issues

## How to obtain support
[Create an issue](https://github.com/SAP-samples/analytics-cloud-datasphere-community-content/issues) in this repository if you find a bug or have questions about the content.
 
For additional support, [ask a question in SAP Community](https://answers.sap.com/questions/ask.html).

You may also contact the HD&A Content Factory by mail to mailto:sap_analytics_cloud_content@sap.com

## Contributing
If you wish to contribute code, offer fixes or improvements, please send a pull request. Due to legal reasons, contributors will be asked to accept a DCO when they create the first pull request to this project. This happens in an automated fashion during the submission process. SAP uses [the standard DCO text of the Linux Foundation](https://developercertificate.org/).

## License
Copyright (c) 2023 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSE) file.
