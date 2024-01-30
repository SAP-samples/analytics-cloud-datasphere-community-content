# Community Content for SAP Analytics Cloud and SAP Datasphere

<!--- Register repository https://api.reuse.software/register, then add REUSE badge:
[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/REPO-NAME)](https://api.reuse.software/info/github.com/SAP-samples/REPO-NAME)
-->

## Description
<!-- Please include SEO-friendly description -->
Welcome to our GitHub repository of community content packages for SAP Analytics Cloud (SAC) and SAP Datasphere (DSP). In this repository you can find various SAC and/or DSP content packages: technical samples, demos, best practices or business scenarios. 

The packages each consist of the importable content in so-called .package files – the file format for content in SAC and DSP. In addition, packages may offer demo scripts and other background information as well as sample data files. Each package is self-contained and does not require other packages to work unless indicated otherwise.

Each content package has its own folder on this repository. The folders contain all necessary files and information to install and run a package. 

**Note**: After uploading a .package file, the following warning may be issued instead of a success message:
“Importing may not work for [package-name].package as it was created in an older version of SAP Analytics Cloud/SAP Datasphere”.
This warning can be ignored.


## Requirements
Depending on the content package, an SAP Analytics Cloud tenant and/or an SAP Datasphere tenant are required. The connection between SAP Analytics Cloud and SAP Datasphere must have the technical name "SAPDWC" (description is free). To upload content, the user must have administration privileges.

## Versions and Releases
This repository offers independent content packages. A content package corresponds to a release. The release name follows the package and folder names. The release includes a zip file for convenient download of the content package. 

[Semantic versioning](https://semver.org/) is applied. 

## Download and Installation
Please check the documentation ["Community Content"](https://help.sap.com/docs/SAP_ANALYTICS_CLOUD/42093f14b43c485fbe3adbbe81eff6c8/603e26204ce14bd8b5f9729a8123636f.html) how to download and install community content in general. 

Each folder contains a detailed description of the content package in its README file. Always check for specific installation instructions first.

Navigate to ["Releases"](https://github.com/SAP-samples/analytics-cloud-datasphere-community-content/releases) to download the zip file.

## Known Issues
No known issues.

## How to obtain support
For additional support, [ask a question in SAP Community](https://answers.sap.com/questions/ask.html).

You may also contact the HD&A Content Factory by mail to [sap_analytics_cloud_content](mailto:sap_analytics_cloud_content@sap.com)

## Contributing
For the time being, contributions are limited to SAP projects. If you are a customer, partner or any other 3rd party, and wish to publish your content, please contact the HD&A Content Factory by mail to [sap_analytics_cloud_content](mailto:sap_analytics_cloud_content@sap.com) to learn about more options.

## Terms and Conditions
The content samples offered on this GitHub may be downloaded and installed without additional license fees. Content samples are provided to support an implementation project, to share best practices and to inspire your own content development. It is forbidden to sell these content samples or use them commercially in any way.

Content samples have been tested and reviewed by SAP. However, they come as they are: In case of errors or other problems, SAP is not liable to offer fixes nor any kind of support and maintenance. It is recommended that you test the content first, ideally in a test environment. You can also edit, enhance, copy or otherwise use the content in your own projects. If you do this, potential later updates of the sample content may not be installable without additional effort or not at all.

Content samples do not necessarily follow a naming convention, so please analyze carefully if they can be imported into your destination tenant without overwriting. Overwriting existing content in your destination tenant is not recommended.

Content samples are not necessarily based on specific SAP products and data sources.
Content or sample data may become outdated, and SAP has no obligations to keep the content up-to-date. SAP may at any time without offering alternative packages deprecate content projects.


[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/analytics-cloud-datasphere-community-content)](https://api.reuse.software/info/github.com/SAP-samples/analytics-cloud-datasphere-community-content)

## Where to find more information about Content for SAP Analytics Cloud and SAP Datasphere
Next to Community Content, SAP offers so-called Business Content to be downloaded in-app in SAP Analytics Cloud and SAP Datasphere.
For more details and a complete overview of all content packages offered, please refer to 

* List of all SAP Analytics Cloud content packages [here](https://community.sap.com/topics/cloud-analytics/business-content)
* List of all SAP Datasphere content packages [here](https://community.sap.com/topics/datasphere/business-content)


## License
Copyright (c) 2023 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSE) file.
