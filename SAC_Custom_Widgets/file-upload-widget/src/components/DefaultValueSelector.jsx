import React from "react";
import Error from "./Error";
import {
  Label,
  Panel,
  Dialog,
  Input,
  Button,
  Bar,
  FlexBox,
  Text,
  Icon,
} from "@ui5/webcomponents-react";
import { createPortal } from "react-dom";
import "@ui5/webcomponents-icons/dist/arrow-right";

function DefaultValuesInput(props) {
  if (props.metadata === undefined) {
    return <div>Error! You shouldn't be seeing this..</div>;
  }
  return (
    <FlexBox direction="Column">
      {props.metadata.columns.map((column) => {
        return (
          <FlexBox direction="Row" justifyContent="SpaceBetween">
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
              name="arrow-right"
            />
            <Input
              value={props.defaultValues[column.columnName] || ""}
              onChange={(e) =>
                props.setDefaultValues({
                  ...props.defaultValues,
                  [column.columnName]: e.target.value,
                })
              }
            />
          </FlexBox>
        );
      })}
    </FlexBox>
  );
}

function DefaultValueSelector(props) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [tempDefaultValues, setTempDefaultValues] = React.useState(props.defaultValues)

  // Update temp mappings when default values change
  React.useMemo(() => {
    setTempDefaultValues(props.defaultValues)
  }, [props.defaultValues])

  React.useEffect(() => {
    if (!dialogOpen) {
      setTempDefaultValues(props.defaultValues)
    }
  // only use effect when dialog is closed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogOpen])

  const handleDefaultValuesSave = () => {
    const filteredDefaultValues = {}
    // Filter out undefined or empty string values
    Object.keys((tempDefaultValues)).forEach((key) => {
      if (tempDefaultValues[key] !== undefined && tempDefaultValues[key] !== "") {
        filteredDefaultValues[key] = tempDefaultValues[key]
      }
    })
    props.setDefaultValues(filteredDefaultValues);
    setDialogOpen(false)
  }

  const importTypeMetadata = props.importTypeMetadata;
  const [error, setError] = React.useState("");
  return (
    <Panel headerText="Default Values" collapsed={true}>
      <div style={{ display: "flex", flexDirection: "column", paddingLeft: 30 }}>
        <Error message={error} close={() => setError("")} />
        <Label wrappingType="Normal">
          <b>Optionally</b> configure default values. These will be used if the
          user's uploaded data does not supply a value for a measure or
          dimension.
        </Label>
        <Button
          disabled={importTypeMetadata === undefined}
          onClick={() => {
            setDialogOpen(true);
          }}
        >
          Open Default Values Dialog
        </Button>
        {
          // Portal required - https://github.com/SAP/ui5-webcomponents/issues/2069
        }
        {createPortal(
          <Dialog
            open={dialogOpen}
            headerText={"Default Values"}
            onAfterClose={() => setDialogOpen(false)}
            footer={
              <Bar
                design="Footer"
                endContent={
                  <>
                  <Button onClick={() => handleDefaultValuesSave()}>Save</Button>
                  <Button onClick={() => setDialogOpen(false)}>Close</Button>
                  </>
                }
              />
            }
          >
            <DefaultValuesInput
              metadata={importTypeMetadata}
              setDefaultValues={setTempDefaultValues}
              defaultValues={tempDefaultValues}
            />
          </Dialog>,
          document.body
        )}
      </div>
    </Panel>
  );
}

export default DefaultValueSelector;
