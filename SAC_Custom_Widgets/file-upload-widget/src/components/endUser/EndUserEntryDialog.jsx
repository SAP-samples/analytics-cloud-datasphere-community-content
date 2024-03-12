import React from "react";
import DataImportServiceApi from "../../api/dataImportService";
import { Bar, Button, Dialog } from "@ui5/webcomponents-react";
import "@ui5/webcomponents-icons/dist/combine";
import "@ui5/webcomponents-icons/dist/decline";
import "@ui5/webcomponents-icons/dist/document-text";
import { createPortal } from "react-dom";
import FileHandler from "../../api/fileHandler";
import MainDialogContents from "./MainDialogContents";
import ImportRunningDialogContents from "./ImportRunningDialogContents";


export function fileIsOfType(file, type) {
  return file.name.substring(file.name.lastIndexOf(".") + 1).toLowerCase() === type.toLowerCase()
}

function EndUserEntryDialog(props) {
  const [runningDialogOpen, setRunningDialogOpen] = React.useState(false);
  const [importNetworkImport, setImportNetworkImport] = React.useState(false);

  const [shouldDisplayVersionDropdown, setShouldDisplayVersionDropdown] = React.useState(false)

  const [file, setFile] = React.useState(undefined);
  const [parsedFileName, setParsedFileName] = React.useState("");
  const [parsedSheetName, setParsedSheetName] = React.useState("");
  const [importData, setImportData] = React.useState([]);
  const [selectedSheetName, setSelectedSheetName] = React.useState("")
  const [sheetNames, setSheetNames] = React.useState([])

  const [version, setVersion] = React.useState("")
  const [availableVersions, setAvailableVersions] = React.useState([])
  const [fileParserRunning, setFileParserRunning] = React.useState(false);

  React.useEffect(() => {
    if (file === undefined) {
      setImportData([]);
      setImportDataValidationCompleted(false);
      setImportValidationErrors([])
      setShouldDisplayVersionDropdown(false)
    }
    if (
      ((file && file.name !== parsedFileName) || (file && selectedSheetName !== parsedSheetName)) &&
      !props.importRunning
      ) {
      setFileParserRunning(true)

      // Reset import state
      setParsedFileName(file.name)
      setParsedSheetName(selectedSheetName)
      setImportData([]);
      setImportDataValidationCompleted(false);
      setImportValidationErrors([])
      setShouldDisplayVersionDropdown(false)

      // Clear any previous import stats
      props.setImportStatus("");
      props.setImportResult({});

      const xlsxCallback = (responseArray) => {
        const importData = responseArray[0]
        const sheetNames = responseArray[1]
        setImportData(importData)
        setSheetNames(sheetNames)
        setFileParserRunning(false) // Need to set this value in callback to prevent batch state setting
      }

      const csvCallback = (importData) => {
        setImportData(importData)
        setFileParserRunning(false)
      }

      // begin parsing file
      if (fileIsOfType(file, "xlsx")) {
        new FileHandler().parseXLSXFileSimple(file, selectedSheetName, xlsxCallback)
      } else if (fileIsOfType(file, "csv")) {
        new FileHandler().parseCSVFileSimple(file, csvCallback);
      } else {
        console.error("Invalid File Selected")
      }
    }
  }, [file, parsedFileName, selectedSheetName, parsedSheetName, fileParserRunning, props]);


  // Handle file available for import after parsing completed and basic validation completed

  const [importDataValidationCompleted, setImportDataValidationCompleted] = React.useState(false);
  const [importValidationErrors, setImportValidationErrors] = React.useState([]);

  React.useEffect(() => {
    if (!props.importRunning && importData.length > 0 && !importDataValidationCompleted && props.metadata && props.importType) {
      const errors = DataImportServiceApi.INSTANCE.validateJobData(importData, props.metadata[props.importType])
      setShouldDisplayVersionDropdown(!DataImportServiceApi.INSTANCE.validateVersionExistsInDataOrSettings(importData))
      setImportValidationErrors(errors)
      setImportDataValidationCompleted(true)
    }
  }, [importData, importDataValidationCompleted, selectedSheetName, props])

  React.useEffect(() => {
    if (importData.length > 0 && runningDialogOpen && !importNetworkImport && importDataValidationCompleted) {
      // Callback function to be passed into the file upload in DIS class
      setImportNetworkImport(true);
      const importFinishedCallback = (importStatus, importResult) => {
        // Cleanup state
        setFile(undefined);
        setParsedFileName(undefined)
        setImportData([]);
        setRunningDialogOpen(false);
        setImportNetworkImport(false);
        setImportDataValidationCompleted(false);
        setImportValidationErrors([])
        setShouldDisplayVersionDropdown(false)
        props.setImportRunning(false);

        // Set import repsonse
        props.setImportStatus(importStatus);
        props.setImportResult(importResult);
        props.jobFinsishedEventDispatcher(importStatus, importResult)
      };
      props.setImportRunning(true);

      // we provide value for version from end user for default values
      const userDefaultValues = {}
      if (version !== "") {
        userDefaultValues['Version'] = version
      }

      const columnNames = props.metadata.factData.columns.map((c) => c.columnName)
      DataImportServiceApi.INSTANCE.uploadData(
        props.modelId,
        importData,
        importFinishedCallback,
        "csv",
        userDefaultValues,
        columnNames
      );
    }
    // avoid triggering this effect on version change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importData, importNetworkImport, importDataValidationCompleted, props]);


  //Network effect to fetch versions
  React.useEffect(() => {
    if (props.modelId) {
      DataImportServiceApi.INSTANCE.getModel(props.modelId).then((resp) => {
        if (resp.versions !== undefined) {
            setAvailableVersions(resp.versions)
        }
      })
    }
  }, [props.modelId])


  const defaultValues = DataImportServiceApi.INSTANCE.getDefaultValues()
  let defaultVersion = defaultValues.hasOwnProperty('Version') ? defaultValues.Version : "" 

  return (
    <div>
      {
        // Portal required - https://github.com/SAP/ui5-webcomponents/issues/2069
      }
      {createPortal(
        <Dialog
          open={props.dialogOpen && props.isViewMode}
          headerText={"Upload Data"}
          onAfterClose={() => props.setDialogOpen(false)}
          className="footerPartNoPadding"
          style={{ padding: 0 }}
          footer={
            <Bar
              style={{ minWidth: "100%", height: "38px", backgroundColor: 'white', boxShadow: "none"}}
              endContent={
                <>
                  <Button
                    disabled={!file || fileParserRunning}
                    style={{
                      marginLeft: 'auto',
                      height: "24px",
                      backgroundColor: "#5496cd",
                      border: 0,
                    }}
                    design="Emphasized"
                    onClick={() => {
                      props.setDialogOpen(false);
                      setRunningDialogOpen(true);
                    }}
                  >
                    Run
                  </Button>
                  <Button
                    style={{ height: "24px" }}
                    design="Transparent"
                    onClick={() => props.setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </>
              }
            />
          }
        >
        <MainDialogContents
          setSelectedSheetName={setSelectedSheetName}
          selectedSheetName={selectedSheetName}
          setFile={setFile}
          setParsedFileName={setParsedFileName}
          file={file}
          versions={availableVersions}
          setVersion={setVersion}
          version={version}
          defaultVersion={defaultVersion}
          shouldDisplayVersionDropdown={shouldDisplayVersionDropdown && defaultVersion === ""}
          importType={props.importType}
          importValidationErrors={importValidationErrors}
          setImportValidationErrors={setImportValidationErrors}
          importDataValidationCompleted={importDataValidationCompleted}
          importData={importData}
          sheetNames={sheetNames}
          setSheetNames={setSheetNames}
          fileParserRunning={fileParserRunning}
          setAvailableVersions={setAvailableVersions}
          modelId={props.modelId}
          />
        </Dialog>,
        document.body
      )}

      {createPortal(
        <Dialog
          open={runningDialogOpen}
          onAfterClose={() => setRunningDialogOpen(false)}
          style={{ padding: 0 }}
          footer={
            <Bar
              style={{ minWidth: "100%", height: "38px" }}
              endContent={
                <>
                  <Button
                    style={{
                      height: "24px",
                      backgroundColor: "#5496cd",
                      border: 0,
                    }}
                    design="Emphasized"
                    onClick={() => setRunningDialogOpen(false)}
                  >
                    Run In Background
                  </Button>
                </>
              }
            />
          }
        >
          <ImportRunningDialogContents text={"Please wait while the data import is running."}/>
        </Dialog>,
        document.body
      )}
    </div>
  );
}

export default EndUserEntryDialog;
