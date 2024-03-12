import {
  BusyIndicator,
  Button,
  FileUploader,
  FlexBox,
  Icon,
  Label,
  MessageStrip,
  Option,
  Select,
  Text,
} from "@ui5/webcomponents-react";
import "@ui5/webcomponents-icons/dist/decline";
import Error from "../Error";
import "@ui5/webcomponents-icons/dist/refresh";
import "@ui5/webcomponents-icons/dist/document-text";
import DataImportServiceApi from "../../api/dataImportService";
import React from "react"
import { fileIsOfType } from "./EndUserEntryDialog";
import ImportRunningDialogContents from "./ImportRunningDialogContents";

function MainDialogContents(props) {

  let versions = props.versions

  const [networkLoading, setNetworkLoading] = React.useState(false)
  const [error, setError] = React.useState("");

  const isPrivateVersionImport = props.importType === "privateFactData"
  if (!isPrivateVersionImport) {
    versions = versions.filter((ver) => ver.id.startsWith("public."))
  }

  /*
  (1) If a default Value is set for Verison we will display it with a Label
  (2) If no default value is set but Version exists in the dataset then we show just then normal file upload UI
  (3) If no default Value is set and no Version exists in the dataset then we expose the Version Selector
  */
  return (
    <FlexBox>
      {props.fileParserRunning ? <ImportRunningDialogContents text="Parsing File"/>: 
      <FlexBox direction="Column"  style={{width: "100%"}}>
    
        <FlexBox direction="Column" style={{ marginBottom: "1rem", display: props.shouldDisplayVersionDropdown ? '' : 'None'}}>
          <Label>Target Version:</Label>
          <Text>Select the version you want to run the import job on.</Text>
          <FlexBox direction="Row">
          <Select onChange={(e) => props.setVersion(e.detail.selectedOption.dataset.id)}>
            {networkLoading ? (<Option>Loading Versions...</Option>) : versions.map((version) => {
              return (
                <Option selected={version.id === props.version.id} key={version.id} data-id={version.id}>{version.description}</Option>
              )
            })
            }
          </Select>
          <Button
            icon="refresh"
            style={{
              marginTop: "5px",
              marginLeft: "5px",
              minWidth: 0,
              height: "25px",
              width: "20px",
            }}
            design="Transparent"
            onClick={() => {
              setNetworkLoading(true)
              DataImportServiceApi.INSTANCE.getModel(props.modelId).then((resp) => {
                if (resp.versions !== undefined) {
                  props.setAvailableVersions(resp.versions)
                }
                setNetworkLoading(false)
              }).catch(() => {
                setNetworkLoading(false)
                setError("Failed to Reload Versions")
              })
            }}
          />
        </FlexBox>
        <Error message={error} close={() => setError("")} />

        </FlexBox>
          {props.defaultVersion !== "" && (<Text style={{marginBottom: ".5rem"}}>Selected Target Version: <b>{props.defaultVersion}</b></Text>)}
        <FlexBox direction="Column">
          <Label>Upload File:</Label>
          <FlexBox>
            <FileUploader
              hideInput
              value={props.file ? props.file.name : ""}
              style={{ marginTop: ".5rem", marginBottom: ".5rem" }}
              onChange={async (e) => {
                if (e.target.files[0]) {
                  props.setFile(e.target.files[0]);
                }
              }}
            >
              <Button style={{ height: "23px" }}>Select Source File</Button>
            </FileUploader>
            <Icon
              style={{ margin: "auto", marginLeft: "10px", marginRight: 0 }}
              name="document-text"
            />
            <Label style={{ margin: "auto" }}>
              {props.file ? props.file.name : "No File"}
            </Label>
            <Button
              style={{
                margin: "auto",
                marginRight: 0,
                marginLeft: 0,
                minWidth: 0,
                height: "20px",
                width: "20px",
              }}
              design="Transparent"
              icon="decline"
              onClick={() => {props.setFile(undefined); props.setParsedFileName(undefined); props.setSheetNames([])}}
            />
          </FlexBox>
          {props.sheetNames && props.sheetNames.length !== 0 && props.file && fileIsOfType(props.file, "xlsx")
            && (
              <FlexBox direction="Column">
                <Label>Select Sheet Name:</Label>
                <Select
                  onChange={(e) => {
                    props.setSelectedSheetName(e.detail.selectedOption.dataset.id)
                  }}
                >
                  {props.sheetNames.map((sheetName) => {
                    return (
                      <Option
                        key={sheetName}
                        data-id={sheetName}
                        selected={sheetName === props.selectedSheetName}
                      >
                        {sheetName}
                      </Option>
                    )
                  })}
                </Select>
              </FlexBox>
            )}
        </FlexBox>
        <FlexBox direction="Column">
        {props.importDataValidationCompleted && props.file ?
          <>
          <Label>{Math.max(0, props.importData.length - 1)} rows of data found in the file.</Label>
          {props.importValidationErrors.map((err) => {
            return(
              <MessageStrip style={{marginTop: '1rem'}} key={err} design="Negative" onClose={() => props.setImportValidationErrors([...props.importValidationErrors].filter((someErr) => someErr !== err))}>{err}</MessageStrip>
            )
          })}
          </>
        :
        <BusyIndicator /> }
        </FlexBox>
      </FlexBox>
      }
    </FlexBox>
  );
}

export default MainDialogContents;
