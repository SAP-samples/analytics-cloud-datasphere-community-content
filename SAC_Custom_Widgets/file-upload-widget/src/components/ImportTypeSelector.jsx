import React from "react";
import DataImportServiceApi from "../api/dataImportService";
import Error from "./Error";
import { Label, Option, Panel, Select } from "@ui5/webcomponents-react";

export function beautifyImportTypeName(importType) {
  switch (importType) {
    case "factData":
      return "Fact Data";
    case "masterData":
      return "Master Data";
    case "masterFactData":
      return "Master & Fact Data";
    case "privateFactData":
      return "Private Fact Data"
    default:
      return importType;
  }
}

const filterImportTypes = (importTypes) => {
  return importTypes.filter((importType) => importType !== "masterData" && importType !== "masterFactData")
}

function ImportTypeSelector(props) {
  const [importTypes, setImportTypes] = React.useState([]);
  const [error, setError] = React.useState("");
  React.useEffect(() => {
    DataImportServiceApi.getInstance()
      .getModel(props.modelId)
      .then((resp) => {
        if (resp.importTypes) {
            const importTypeKeys = resp.importTypes.map((importTypeMetadata) => importTypeMetadata.importType)
            setImportTypes(filterImportTypes(importTypeKeys));
        }
      })
      .catch((err) => {
        setError("Error - " + err.message);
      });
  }, [props.modelId]);
  if (props.modelId === "") {
    return (
      <Panel headerText="Import Type" collapsed={true}>
        <Label>Please select a model first.</Label>
      </Panel>
    );
  }
  return (
    <Panel headerText="Import Type" collapsed={true}>
      <div
        style={{ display: "flex", flexDirection: "column", paddingLeft: 30 }}
      >
        <Error message={error} close={() => setError("")} />
        <Label>Select Import Type</Label>
        <Select
          onChange={(e) =>
            props.setImportType(e.detail.selectedOption.dataset.id)
          }
          style={{ width: "100%" }}
        >
          <Option key="" data-id="" selected={props.importType === ""}>
            {importTypes && importTypes.length === 0 ? "Loading..." : ""}
          </Option>
          {importTypes.map((importType) => {
            return (
              <Option
                key={importType}
                data-id={importType}
                selected={importType === props.importType}
              >
                {beautifyImportTypeName(importType)}
              </Option>
            );
          })}
        </Select>
        <Label wrappingType="Normal">Note: swapping import type resets default values, mappings, and job settings.</Label>
      </div>
    </Panel>
  );
}

export default ImportTypeSelector;
