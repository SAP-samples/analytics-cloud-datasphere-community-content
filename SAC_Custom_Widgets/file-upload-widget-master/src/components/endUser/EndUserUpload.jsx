import {
  Bar,
  BusyIndicator,
  Button,
  Dialog,
  FlexBox,
  Icon,
  Label,
  Title,
} from "@ui5/webcomponents-react";
import "@ui5/webcomponents-icons/dist/media-play";
import "@ui5/webcomponents-icons/dist/information";
import "@ui5/webcomponents-icons/dist/copy";
import React from "react";
import { createPortal } from "react-dom";

// Enclose a label with a tooltip on hover that allows users to see and copy full error message
function TextStatusTooltip(props) {
  const { text, copyText } = props
  const [dialogOpen, setDialogOpen] = React.useState(false)

  return (
    <>
    <Label style={{fontSize: '14px'}} wrappingType="None">
      <Button hidden={props.noInfo} design={'Transparent'} icon="information" id={'openPopoverBtn'} onClick={() => setDialogOpen(true)} /> {text}
    </Label>
    {createPortal(
    <Dialog
      headerText="Import Info"
      onBeforeClose={() => {setDialogOpen(false)}}
      onAfterClose={() => setDialogOpen(false)}
      open={dialogOpen}
      allowTargetOverlap={true}
      footer={
        <Bar>
          <Button icon='copy' design={'Transparent'} onClick={() => navigator.clipboard.writeText(copyText)}>Copy Text</Button>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </Bar>
      }
    >
      <FlexBox direction="Column">
        <Label wrappingType="Normal">
          {text}
        </Label>
        {props.dataMotiveFailedRecordsCount !== undefined && props.dataMotiveFailedRecordsCount >= 2000 && (
          <Label wrappingType="Normal" style={{marginTop: "0.5rem"}}>
            Note: This is only a sample of the Failed Records. More may be available.
          </Label>
        )}
      </FlexBox>
    </Dialog>, document.body)}
    </>
  )

}

export function prettifyJobStatus(str) {
  return str
    .toLowerCase()
    .split("_")
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function EndUserUpload(props) {
  const handleButtonClick = () => {
    if (!props.importRunning) {
      props.setDialogOpen(true);
    }
  };

  window.handleButtonClick = handleButtonClick

  const getTitleText = () => {
    if (props.importResult && props.importStatus) {
      return `Import Complete (${prettifyJobStatus(props.importStatus)})`;
    }
    if (!props.importRunning) {
      return "Upload Data";
    }
    return "Import Running";
  };

  const getLabel = () => {
    if (props.importResult !== undefined && props.importStatus) {
      if (props.importResult.failedRecords.length > 0) {

        const columnNamesAndFailedRecords = [...props.importResult.columnNames, ...props.importResult.failedRecords]

        const csv = columnNamesAndFailedRecords.join("\n")
        const text = `Import had ${props.importResult.failedRecords.length} failed records. `


        return (
          <TextStatusTooltip dataMotiveFailedRecordsCount={props.importResult.dataMotiveFailedRowsCount} copyText={text} text={<>
            {text}
            <a
              style={{ color: 'rgb(10, 110, 209)', textDecoration: 'none', textOverflow: 'ellipsis', display: 'inline-block' }}
              target="_blank"
              rel="noreferrer"
              href={"data:text/csv;charset=utf-8," + encodeURIComponent(csv)}
              download="failedRecords.csv"
            >
              Download Failed Records
            </a>
            </>} />
        )
      }
      if (props.importStatus === "FAILED") {
        if (props.importResult.errorResponses.length > 0 && props.importResult.errorResponses[0].error) {
          return (
            <TextStatusTooltip text={props.importResult.errorResponses[0].error.message} copyText={props.importResult.errorResponses[0].error.message} />
          )
        } else {
          // Something went terribly wrong... An admin should send us the below log
          console.error("Upload Widget Critical Error", props.importResult, props.importStatus)
          return (
            <TextStatusTooltip text={'An unknown error occured. Please contact an admin.'} />
          )
        }
      }
      if (
        props.importResult.statusResponse &&
        props.importResult.statusResponse.additionalInformation &&
        props.importResult.statusResponse.additionalInformation.totalNumberRowsInJob
      ) {
        const successfulRowsCount = props.importResult.statusResponse.additionalInformation.totalNumberRowsInJob
        const successfulRowsText = `Succesfully imported ${successfulRowsCount} rows of data`
        return (
          <TextStatusTooltip text={successfulRowsText} copyText={successfulRowsText} />
        );
      }
    }
    if (!props.importRunning) {
      return (
        <TextStatusTooltip text={'Upload your planning csv'} noInfo={true} />
      );
    }
    return <BusyIndicator active style={{ marginTop: ".5rem" }} />;
  };

  return (
    <FlexBox
      direction="Row"
      style={{ display: "flex", minWidth: "100%", minHeight: "100%" }}
    >
      <div
        style={{
          display: "flex",
          cursor: "pointer",
          flexDirection: "row",
          backgroundColor: props.isViewMode ? "#abcae6" : "#c6cace",
          minWidth: "64px",
          width: "64px",
          minHeight: "64px",
          height: "100%",
          border: 0,
          borderRadius: "3px",
        }}
        onClick={() => handleButtonClick()}
      >
        <Icon
          name="media-play"
          style={{
            margin: "auto",
            alignSelf: "center",
            color: "white",
            fontSize: "1.5rem",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: ".3rem",
          paddingLeft: ".6rem",
          paddingRight: 0,
          maxWidth: '100%',
        }}
      >
        <Title style={{ marginBottom: ".2rem", fontSize: "16px" }}>
          {getTitleText()}
        </Title>
        {getLabel()}
      </div>
    </FlexBox>
  );
}

export default EndUserUpload;
