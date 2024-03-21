# File Upload Widget - SAC Widget wrapping around Data Import Service API

## File Upload Widget

The purpose of the File upload widget is to make it easier to upload CSV and Excel datasets by importing Fact Data into both public and private versions through the Data Import Service.

It converts data from a file, starts the process of creating an import job step-by-step, validates the data, and finally uses the [Data Import Service (DIS)](https://help.sap.com/docs/SAP_ANALYTICS_CLOUD/14cac91febef464dbb1efce20e3f1613/fe6efb8aba9444c6a3ce21eef02bba62.html) to persist fact data to the SAC model. It was created using UI5 React Web components that blends UI5 library theming with React's state-driven responsiveness.

## Disclaimer

This repository, which hosts Custom Widget Samples intended for use within your Analytical Application or the new Optimized Story Experience, is provided by SAP for testing purposes only and is NOT intended for productive usage.

While we are pleased to share this content with our customers and partners, please note that SAP has no obligation to provide support or maintenance for the samples contained in this repository. Users are solely responsible for their use of these samples.

Furthermore, it is crucial to check and thoroughly read the licenses of the third-party libraries used within our Custom Widgets before usage. By using the samples in this repository, you acknowledge that you understand and agree to abide by all terms and conditions set forth in these licenses.

Please use this repository responsibly and at your own risk.

## Dev Setup

- clone the repositoy (`git clone`)
- `cd file-upload-widget`.
- `npm install` to install dependencies.
- `npm run start` to spin up a local dev server on port 5173.
- upload the `fileUploadWidget-localDev.json` to the widgets section of SAC and import the widget to a story / analytic app.

## Build / Deployment
- `npm install` to install dependencies.
- run the build script
 - to upgrade the PATCH version (0.0.X) `python build-script.py 0`
 - to upgrade the MINOR version (0.X.0) `python build-script.py 1`
 - to upgrade the MAJOR version (X.0.0) `python build-script.py 2`
 - if you do not wish to upgrade the version and ***overwrite the current version*** `python build-script.py 3`
- The script uses the **fileuploadWidgetTemplate.json** file to construct a new widget configuration based on the latest version
- in the `/versions` directory a new zip file and json file will be created with the associated version name
- to use the build Upload the json file in the widgets section of SAC and then upload the zip file when prompted.

## Uselful Blogs
- https://blogs.sap.com/2023/11/03/how-to-upload-data-to-a-public-or-private-planning-version-using-a-file-upload-custom-widget-within-sap-analytics-cloud./
- https://blogs.sap.com/2023/11/29/file-upload-widget-how-to-develop-custom-widgets-with-the-react-framework/
  

