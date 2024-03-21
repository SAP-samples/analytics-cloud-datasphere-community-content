import React from "react";
import Fuse from "fuse.js";
import {
  Bar,
  BusyIndicator,
  Button,
  Dialog,
  FileUploader,
  FlexBox,
  Icon,
  Input,
  Label,
  Option,
  Panel,
  Select,
  Text,
} from "@ui5/webcomponents-react";
import "@ui5/webcomponents-icons/dist/combine";
import { createPortal } from "react-dom";
import FileHandler from "../api/fileHandler";
import {fileIsOfType} from './endUser/EndUserEntryDialog';
import ImportRunningDialogContents from "./endUser/ImportRunningDialogContents";

function MappingsMatcher(props) {
  const [fileHeaders, setFileHeaders] = React.useState([]);
  const [rawInput, setRawInput] = React.useState(false);
  const [fileName, setFileName] = React.useState("");
  const [file, setFile] = React.useState(undefined);
  const [parsedFile, setParsedFile] = React.useState("")
  const [selectedSheetName, setSelectedSheetName] = React.useState("");
  const [parsedSheetName, setParsedSheetName] = React.useState("");
  const [sheetNames, setSheetNames] = React.useState([])

  const clearState = () => {
    setFile(undefined);
    setFileHeaders([]);
    setFileName("");
    setParsedFile("");
    setSelectedSheetName("");
    setParsedSheetName("");
    setSheetNames([]);
    props.setMappings({})
  }

  React.useEffect(() => {

    if((file && file.name !== parsedFile) || (file && selectedSheetName !== parsedSheetName)) {
      const handleFileHeaders = (fileHeaders) => {

        const fileHeadersAsStrings = fileHeaders.map((value) => String(value));

        const options = {
          includeScore: true,
        };
        const fuse = new Fuse(fileHeadersAsStrings, options);
        const fuzzySearch = (columnName) => {
          const result = fuse.search(columnName.replaceAll("_", "").trim());
          if (result[0] && result[0].score !== undefined && result[0].score < 0.34)
            return result[0]["item"];
          return "";
        };
        const mappings = { ...props.mappings };
        props.metadata.columns.forEach(
          (c) => (mappings[c.columnName] = fuzzySearch(c.columnName))
        );
        props.setMappings(mappings);
        setFileHeaders(fileHeaders);
        setFileName("")
      };

      const handleXLSXFile = (responseFromFileHandler) => {
        const data = responseFromFileHandler[0]
        const fileHeaders = data[0]
        const sheetNames = responseFromFileHandler[1]
        handleFileHeaders(fileHeaders)
        setSheetNames(sheetNames)
        props.setFileParserRunning(false)
      }

      const handleCSVFile = (fileHeaders) => {
        handleFileHeaders(fileHeaders)
        props.setFileParserRunning(false);
      }

      props.setFileParserRunning(true)
      if(fileIsOfType(file, "xlsx")) {
        new FileHandler().parseXLSXFileSimple(file, selectedSheetName, handleXLSXFile)
      } else if(fileIsOfType(file, "csv")) {
        setSheetNames([])
        new FileHandler().parseCSVFileSimple(file, (data) => handleCSVFile(data[0]))
      }
      setParsedFile(file.name)
      setParsedSheetName(selectedSheetName)
    }
  }, [file, parsedFile, parsedSheetName, selectedSheetName, props])


  // If Loading Dialog is Running
  if(props.fileParserRunning) {
    return (
      <FlexBox direction="column">
        <ImportRunningDialogContents text="Parsing File"/>
      </FlexBox>
    )
  }
  // If a file has been uploaded
  if (fileHeaders.length > 0) {
    return (
      <FlexBox direction="Column">
        {props.metadata.columns.map((column) => {
          return (
            <FlexBox
              direction="Row"
              justifyContent="SpaceBetween"
              key={column.columnName}
              style={{ marginBottom: "1rem" }}
            >
              <Text style={{ margin: "auto", marginLeft: 0 }}>
                {column.columnName}
              </Text>
              <Icon
                style={{
                  width: "1.2rem",
                  height: "1.2rem",
                  margin: "auto",
                  marginRight: "10px",
                }}
                name="combine"
              />
              <Select
                onChange={(e) =>
                  props.setMappings({
                    ...props.mappings,
                    [column.columnName]: e.detail.selectedOption.dataset.id,
                  })
                }
              >
                {fileHeaders.map((header) => {
                  return (
                    <Option
                      selected={props.mappings[column.columnName] === header}
                      key={header}
                      data-id={header}
                    >
                      {header}
                    </Option>
                  );
                })}
                <Option
                  selected={props.mappings[column.columnName] === ""}
                  data-id={""}
                >
                  {""}
                </Option>
              </Select>
            </FlexBox>
          );
        })}
        <FlexBox style={{ marginBottom: "1rem" }}>
          <FileUploader
            hideInput
            value={file ? file.name : ""}
            style={{ marginTop: ".5rem", marginBottom: ".5rem" }}
            onChange={async (e) => {
              if (e.target.files && e.target.files.length > 0) {
                setFile(e.target.files[0]);
              }
            }}
          >
            <Button style={{ height: "23px" }}>Upload Template File</Button>
          </FileUploader>
          <Icon
                style={{ margin: "auto", marginLeft: "10px", marginRight: 0 }}
                name="document-text"
            />
          <Label style={{margin: "auto"}}>
            {file ? file.name : "No File"}
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
              onClick={clearState}
            />                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
        </FlexBox>
        {sheetNames.length > 0 ?
          <FlexBox style={{marginBottom: "0.5rem", justifyContent: "space-between"}}>
          <Label style={{marginTop: "0.5rem"}}>Select Sheet Name:</Label>
            <Select
              onChange={(e) => {
                setSelectedSheetName(e.detail.selectedOption.dataset.id)
              }}
            >
              {sheetNames.map((sheetName) => {
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
       :<BusyIndicator /> }
        <Button
          onClick={() => {
            clearState();
            setRawInput(true);
          }}
        >
          Raw Text Input
        </Button>
      </FlexBox>
    );
  }
  // If in raw input mode
  if (props.metadata !== undefined && (rawInput || Object.keys(props.mappings).filter((x) => !!x).length !== 0)) {
    return (
      <FlexBox direction="Column">
        {props.metadata.columns.map((column) => {
          return (
            <FlexBox
              direction="Row"
              justifyContent="SpaceBetween"
              key={column.columnName}
              style={{ marginBottom: "1rem" }}
            >
              <Text style={{ margin: "auto", marginLeft: 0 }}>
                {column.columnName}
              </Text>
              <Icon
                style={{
                  width: "1.2rem",
                  height: "1.2rem",
                  margin: "auto",
                  marginRight: "10px",
                }}
                name="combine"
              />
              <Input
                value={props.mappings[column.columnName] || ""}
                onChange={(e) =>
                  props.setMappings({
                    ...props.mappings,
                    [column.columnName]: e.target.value,
                  })
                }
              />
            </FlexBox>
          );
        })}
        <Button
          onClick={() => {
            clearState();
            setRawInput(false);
          }}
        >
          Upload File Template
        </Button>
      </FlexBox>
    );
  }
  // Initial file upload screen
  return (
    <FlexBox direction="Column">
      <Label style={{ marginBottom: "0.5rem" }}>Select a mapping method</Label>
      <FlexBox style={{ marginBottom: "0.5rem" }}>
        <FileUploader
          hideInput
          value={fileName}
          style={{ marginTop: ".5rem", marginBottom: ".5rem" }}
          onChange={async (e) => {
            if (e.target.files && e.target.files.length > 0) {
              setFile(e.target.files[0]);
            }
          }}
        >
        <Button style={{ height: "23px" }}>Upload Template File</Button>
      </FileUploader>
       <Icon
            style={{ margin: "auto", marginLeft: "10px", marginRight: 0 }}
            name="document-text"
        />
        <Label style={{margin: "auto"}}>
          {file ? file.name : "No File"}
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
            onClick={clearState}
          />                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
      </FlexBox>
      <Label
        style={{
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        OR
      </Label>
      {sheetNames.length > 0 ?
      <FlexBox style={{marginBottom: "0.5rem"}}>
       <Label>Select Sheet Name:</Label>
        <Select
          onChange={(e) => {
            setSelectedSheetName(e.detail.selectedOption.dataset.id)
          }}
        >
          {sheetNames.map((sheetName) => {
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
       :<BusyIndicator /> }
      <Button
        onClick={() => {
          props.setMappings([])
          clearState()
          setRawInput(true);
        }}
      >
        Raw Text Input
      </Button>
    </FlexBox>
  );
}

function MappingSelector(props) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [tempMappings, setTempMappings] = React.useState(props.mappings)
  const [fileParserRunning, setFileParserRunning] = React.useState(false);

  const importTypeMetadata = props.importTypeMetadata

  // Clear mappings when Import Type or Model ID is changed
  React.useMemo(() => {
    setTempMappings(props.mappings)
  }, [props.mappings])

  return (
    <Panel headerText="Data Mappings" collapsed={true}>
      <div style={{ display: "flex", flexDirection: "column", paddingLeft: 30 }}>
        <Label wrappingType="Normal">
          <b>Optionally</b> configure mappings if columns in the user's uploaded data will have different names to the expected column names of the data import service.
        </Label>
        <Button
          disabled={importTypeMetadata === undefined}
          onClick={() => {
            setDialogOpen(true);
          }}
        >
          Open Data Mappings Dialog
        </Button>
      </div>
      {
        // Portal required - https://github.com/SAP/ui5-webcomponents/issues/2069
      }
      {createPortal(
        <Dialog
          open={dialogOpen}
          headerText={"Data Mappings"}
          onAfterClose={() => setDialogOpen(false)}
          style={{ padding: 0 }}
          footer={
            <Bar
              design="Footer"
              endContent={
                <>
                <Button onClick={() => {
                  setDialogOpen(false)
                  setFileParserRunning(false);
                  props.setMappings(tempMappings)
                }}>Save</Button>
                <Button onClick={() => {
                  setFileParserRunning(false);
                  setDialogOpen(false);
                }
                }>Cancel</Button>
                </>

              }
            />
          }
        >
          <MappingsMatcher
            metadata={importTypeMetadata}
            setMappings={setTempMappings}
            mappings={tempMappings}
            fileParserRunning={fileParserRunning}
            setFileParserRunning={setFileParserRunning}
          />
        </Dialog>,
        document.body
      )}
    </Panel>
  );
}

export default MappingSelector;
