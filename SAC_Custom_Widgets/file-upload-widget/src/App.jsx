/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import ModelSelector from "./components/ModelSelector";
import MappingSelector from "./components/MappingSelector";
import JobSettingsSelector from "./components/JobSettingsSelector";
import ImportTypeSelector from "./components/ImportTypeSelector";
import DefaultValueSelector from "./components/DefaultValueSelector";
import { ThemeProvider } from "@ui5/webcomponents-react";
import DataImportServiceApi from "./api/dataImportService";
import Error from "./components/Error";
import EndUserWrapper from "./components/endUser/EndUserWrapper";
import AdminBuilderHeader from "./components/AdminBuilderHeader";
import ModelJobsTimelineWrapper from "./components/ModelJobsTimelineWrapper";

function App(props) {
  const [modelId, setModelId] = React.useState(props.modelId);
  const [importType, setImportType] = React.useState(props.importType);
  const [mappings, setMappings] = React.useState(props.mappings || {});
  const [defaultValues, setDefaultValues] = React.useState(
    props.defaultValues || {}
  );
  const [jobSettings, setJobSettings] = React.useState(props.jobSettings || {});

  const [metadata, setMetadata] = React.useState({});
  const [error, setError] = React.useState("");

  const modelChangeHandler = (newModelId) => {
    if (newModelId !== modelId) {
      setModelId(newModelId)
      setImportType("")
      setMappings({})
      setDefaultValues({})
    }
  }

  const importTypeChangeHandler = (newImportType) => {
    if (newImportType !== importType) {
      setImportType(newImportType)
      setMappings({})
      setDefaultValues({})
      setJobSettings({})
    }

  }

  // Handle setting changes

  React.useEffect(() => {
    if (props.isAdminMode && modelId) {
      props.setWidgetAttribute("modelId", modelId);
    }
  }, [modelId]);

  React.useEffect(() => {
    if (props.isAdminMode && importType) {
      props.setWidgetAttribute("importType", importType);
    }
  }, [importType]);

  React.useEffect(() => {
    if (props.isAdminMode && mappings) {
      props.setWidgetAttribute("mappings", mappings);
    }
  }, [mappings]);

  React.useEffect(() => {
    if (props.isAdminMode && defaultValues) {
      props.setWidgetAttribute("defaultValues", defaultValues);
    }
  }, [defaultValues]);

  React.useEffect(() => {
    if (props.isAdminMode && jobSettings) {
      props.setWidgetAttribute("jobSettings", jobSettings);
    }
  }, [jobSettings]);

  // Get Metadata
  React.useEffect(() => {
    if (!modelId) {
      return;
    }
    DataImportServiceApi.getInstance()
      .getModelMetadata(modelId)
      .then((resp) => {
        setMetadata(resp);
        setError("");
      })
      .catch((err) => {
        setError("Error - " + err.message);
      });
  }, [modelId]);

  const showScreen = () => {
    switch(props.mode) {
      case "BUILDER": {
        return (
          <div>
            <AdminBuilderHeader />
            <div style={{ padding: "24px", paddingTop: "12px" }}>
              <Error message={error} close={() => setError("")} />
              <ModelSelector modelId={modelId} setModelId={modelChangeHandler} />
              <ImportTypeSelector
                modelId={modelId}
                importType={importType}
                setImportType={importTypeChangeHandler}
              />
              <MappingSelector
                modelId={modelId}
                importTypeMetadata={metadata[importType]}
                mappings={mappings}
                setMappings={setMappings}
              />
              <DefaultValueSelector
                modelId={modelId}
                importTypeMetadata={metadata[importType]}
                defaultValues={defaultValues}
                setDefaultValues={setDefaultValues}
              />
              <JobSettingsSelector
                jobSettings={jobSettings}
                setJobSettings={setJobSettings}
                importTypeMetadata={metadata[importType]}
                mappings={mappings}
                importType={importType}
              />
              <ModelJobsTimelineWrapper modelId={modelId} />
            </div>
          </div>
        );
      }
      case "Styler": {
        console.log("Styler Panel not implemented.")
        break;
      }
      case("STORY"):
      default: {
        return <EndUserWrapper modelId={modelId} metadata={metadata} importType={importType} mappings={mappings} jobFinsishedEventDispatcher={props.jobFinsishedEventDispatcher} />
      }
    }
  };
  return <ThemeProvider>{showScreen()}</ThemeProvider>;
}

export default App;
