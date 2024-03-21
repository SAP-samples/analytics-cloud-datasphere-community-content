import React from "react";
import EndUserEntryDialog from "./EndUserEntryDialog";
import EndUserUpload from "./EndUserUpload";

function EndUserWrapper(props) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [importRunning, setImportRunning] = React.useState(false);

  const [importResult, setImportResult] = React.useState({});
  const [importStatus, setImportStatus] = React.useState("");

  let isViewMode = true;

  if (window.location && window.location.href) {
    const storyMode = new URLSearchParams(window.location.href.split('?')[1]).get("mode")
    if(storyMode && storyMode === "edit") {
      isViewMode = false;
    }
  }

  return (
    <>
      <EndUserUpload
        importResult={importResult}
        importStatus={importStatus}
        importTypeMetadata = {props.metadata}
        setDialogOpen={setDialogOpen}
        importRunning={importRunning}
        isViewMode={isViewMode}
      />
      <EndUserEntryDialog
        modelId={props.modelId}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        importRunning={importRunning}
        setImportRunning={setImportRunning}
        setImportResult={setImportResult}
        setImportStatus={setImportStatus}
        importType={props.importType}
        metadata={props.metadata}
        importStatus={importStatus}
        importResult={importResult}
        isViewMode={isViewMode}
        jobFinsishedEventDispatcher={props.jobFinsishedEventDispatcher}
      />
    </>
  );
}

export default EndUserWrapper;
