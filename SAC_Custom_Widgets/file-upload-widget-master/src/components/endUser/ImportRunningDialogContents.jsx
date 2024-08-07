import { BusyIndicator, FlexBox, Text } from "@ui5/webcomponents-react";

function ImportRunningDialogContents(props) {
  return (
    <FlexBox direction="Column" style={{ width: "100%"}}>
      <Text style={{display: "flex", justifyContent: "center"}}>{props.text}</Text>
      <BusyIndicator active style={{ marginTop: "1rem" }} />
    </FlexBox>
  );
}

export default ImportRunningDialogContents;
