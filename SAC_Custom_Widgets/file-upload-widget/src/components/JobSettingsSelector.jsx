import {
  Button,
  CheckBox,
  FlexBox,
  Label,
  Option,
  Panel,
  Select,
} from "@ui5/webcomponents-react";
import React from "react";
import Error from "./Error";
import DATE_FORMATS from "./endUser/dateFormatOptions";
import "@ui5/webcomponents-icons/dist/decline";


const testNumber = (newValue, oldValue) => {
  const regex = /^[0-9]*$/;
  if (regex.test(newValue)) {
    return newValue
  }
  return oldValue
}

function PivotSettings(props) {
  const [pivotEnabled, setPivotEnabled] = React.useState(
    props.pivotSettings !== undefined && props.pivotSettings["pivotColumnStart"]
  );

  const handleChange = (key, value) => {
    props.setPivotSettings({ ...props.pivotSettings, [key]: value });
  };

  return (
    <FlexBox direction="Column">
      <FlexBox>
        <CheckBox
          checked={props.pivotSettings !== undefined}
          onChange={(e) => {
            if (e.target.checked) {
              props.setPivotSettings({});
            } else {
              props.clearPivotSettings();
            }
            setPivotEnabled(e.target.checked);
          }}
        />
        <Label style={{ alignSelf: "center" }}>Enable Pivot Settings</Label>
      </FlexBox>
      <FlexBox
        direction="Column"
        style={{ display: pivotEnabled ? "" : "none" }}
      >
        <FlexBox direction="Row">
        </FlexBox>
        <FlexBox direction="Row">
          <Label style={{ alignSelf: "center" }}>Pivot Column Start</Label>
          <input
            type="text"
            value={(props.pivotSettings && props.pivotSettings["pivotColumnStart"]) ? props.pivotSettings["pivotColumnStart"] : ""}
            style={{ marginLeft: "auto", height: '20px', border: '1px solid rgb(191, 191, 191)', minWidth: '204px' }}
            onInput={(e) => {
              e.preventDefault();
              handleChange(
                "pivotColumnStart",
                testNumber(e.target.value, props.pivotSettings["pivotColumnStart"])
              )
            }
            }
          />
        </FlexBox>
        <FlexBox direction="Row">
          <Label style={{ alignSelf: "center" }}>Pivot Key</Label>
          <Select
            style={{ marginLeft: "auto" }}
            onChange={(e) =>
              handleChange("pivotKeyName", e.detail.selectedOption.dataset.id)
            }
          >
            <Option
              data-id={""}
              selected={
                props.pivotSettings &&
                props.pivotSettings["pivotKeyName"] === ""
              }
            ></Option>
            {props.importTypeMetadata.columns.map((column) => {
              const name = props.mappings[column.columnName]
                ? props.mappings[column.columnName]
                : column.columnName;
              return (
                <Option
                  data-id={name}
                  key={name}
                  selected={
                    props.pivotSettings &&
                    props.pivotSettings["pivotKeyName"] === name
                  }
                >
                  {name}
                </Option>
              );
            })}
          </Select>
        </FlexBox>
        <FlexBox direction="Row">
          <Label style={{ alignSelf: "center" }}>Pivot Value</Label>
          <Select
            style={{ marginLeft: "auto" }}
            onChange={(e) =>
              handleChange("pivotValueName", e.detail.selectedOption.dataset.id)
            }
          >
            <Option
              data-id={""}
              selected={
                props.pivotSettings &&
                props.pivotSettings["pivotValueName"] === ""
              }
            ></Option>
            {props.importTypeMetadata.columns.map((column) => {
              const name = props.mappings[column.columnName]
                ? props.mappings[column.columnName]
                : column.columnName;
              return (
                <Option
                  data-id={name}
                  key={name}
                  selected={
                    props.pivotSettings &&
                    props.pivotSettings["pivotValueName"] === name
                  }
                >
                  {name}
                </Option>
              );
            })}
          </Select>
        </FlexBox>
      </FlexBox>
    </FlexBox>
  );
}

function ImportMethod(props) {
  return (
    <FlexBox>
      {props.importType === "factData" && (
        <FlexBox>
          <Label style={{ alignSelf: "center" }}>Import Method:</Label>
          <Select
            style={{ marginLeft: "auto" }}
            onChange={(e) =>
              props.setImportMethod(e.detail.selectedOption.dataset.id)
            }
          >
            <Option data-id={"Update"} selected={props.importMethod === "Update"}>
              Update
            </Option>
            <Option data-id={"Append"} selected={props.importMethod === "Append"}>
              Append
            </Option>
          </Select>
        </FlexBox>
      )}
    </FlexBox>
  );
}

function ReverseSignCheckbox(props) {
  return (
    <FlexBox>
      <CheckBox
        checked={props.reverseSign}
        disabled={props.disabled}
        onChange={(e) => props.setReverseSign(e.target.checked)}
      />
      <Label style={{ alignSelf: "center" }}>Reverse Account Sign</Label>
    </FlexBox>
  );
}

function ExecuteWithFailedRowsCheckbox(props) {
  return (
    <FlexBox>
      <CheckBox
        checked={props.executeWithFailedRows}
        onChange={(e) => props.setExecuteWithFailedRows(e.target.checked)}
      />
      <Label style={{ alignSelf: "center" }}>Execute With Failed Rows</Label>
    </FlexBox>
  );
}

function IgnoreAdditionalColumns(props) {
  return (
    <FlexBox>
      <CheckBox
        checked={props.ignoreAdditionalColumns}
        onChange={(e) => props.setIgnoreAdditionalColumns(e.target.checked)}
      />
      <Label style={{ alignSelf: "center" }}>Ignore Additional Columns</Label>
    </FlexBox>
  );
}

function DateFormatsSettings(props) {

  const [dateDimensionKeys, setDateDimensionKeys] = React.useState([])

  const handleCheckboxChange = (e) => {
    if (e.target.checked) {
      props.setDateFormats({})
    } else {
      props.clearDateFormats()
    }
  }

  React.useState(() => {
    const dateDimensionColumns = props.importTypeMetadata.columns.filter((column) => {
      return column.propertyType === "DATE"
    })
    const dateDimensionKeysArray = dateDimensionColumns.map((column) => column.columnName)
    setDateDimensionKeys(dateDimensionKeysArray)
  }, [props.importTypeMetadata])

  const dateFormatKeys = React.useMemo(() => {
    if (props.dateFormats) {
      return Object.keys(props.dateFormats)
    }
    return []
  }, [props.dateFormats])

  const handleAddNewDateFormat = (key) => {
    // only add key if it's not already in list
    if (key !== undefined && props.dateFormats[key] === undefined) {
      props.setDateFormats({ ...props.dateFormats, [key]: DATE_FORMATS[0] })
    }
  }

  return (
    <FlexBox direction="Column">
      <FlexBox direction="Row">
        <CheckBox disabled={props.disabled} checked={props.dateFormats !== undefined} onChange={(e) => handleCheckboxChange(e)} />
        <Label style={{ alignSelf: "center" }}>Enable Date Format Settings</Label>
      </FlexBox>
      <FlexBox direction="Column" style={{ display: props.dateFormats !== undefined ? '' : 'None' }}>
        {dateFormatKeys.map((key) => (
          <FlexBox key={key} direction="Row">
            <Label style={{ alignSelf: "center", overflow: "hidden", width: "30%" }}>{key}:</Label>
            <Select style={{ marginLeft: 'auto' }} key={key} onChange={(e) => { props.setDateFormats({ ...props.dateFormats, [key]: e.detail.selectedOption.dataset.id }) }}>
              {DATE_FORMATS.map((format) => (
                <Option data-id={format} key={format} selected={props.dateFormats[key] === format}>{format}</Option>
              ))}
            </Select>
            <Button icon="decline" design="Transparent" onClick={(e) => {
              const formats = { ...props.dateFormats }
              delete formats[key]
              props.setDateFormats(formats)
            }} />
          </FlexBox>
        ))}

        <Label style={{ alignSelf: "center", marginTop: '.5rem' }}>Select Date Dimension To Add Format:</Label>
        <Select style={{ margin: 'auto', marginTop: '.5rem' }} onClose={(e) => {
          // onChange will not fire event if the selected option is the same, need to validate the Select state when the dropdown is closed
          const children = e.target.children;
          for (let child of children) {
            if (child._state.selected && !props.dateFormats.hasOwnProperty(child.dataset.id)) {
              handleAddNewDateFormat(child.dataset.id)
            }
          }
        }}>
          <Option></Option>
          {dateDimensionKeys.map((key) => (
            <Option data-id={key} key={key}>{key}</Option>
          ))}
        </Select>
      </FlexBox>
    </FlexBox>
  )
}

function JobSettingsSelector(props) {
  const [error, setError] = React.useState("");
  const setImportMethod = (importMethod) =>
    props.setJobSettings({ ...props.jobSettings, importMethod: importMethod });
  const setPivotSettings = (pivotSettings) =>
    props.setJobSettings({
      ...props.jobSettings,
      pivotOptions: pivotSettings,
    });
  const setReverseSign = (reverseSign) =>
    props.setJobSettings({ ...props.jobSettings, reverseSignByAccountType: reverseSign });

  const setExecuteWithFailedRows = (executeWithFailedRows) => {
    props.setJobSettings({ ...props.jobSettings, executeWithFailedRows: executeWithFailedRows })
  }
  const setIgnoreAdditionalColumns = (ignoreAdditionalColumns) => {
    props.setJobSettings({ ...props.jobSettings, ignoreAdditionalColumns: ignoreAdditionalColumns })
  }
  const clearPivotSettings = () => {
    const settings = { ...props.jobSettings };
    delete settings["pivotOptions"];
    props.setJobSettings(settings);
  };

  const clearDateFormats = () => {
    const settings = { ...props.jobSettings }
    delete settings['dateFormats']
    props.setJobSettings(settings)
  }

  const setDateFormats = (dateFormats) => {
    props.setJobSettings({
      ...props.jobSettings,
      dateFormats,
    });
  }


  if (props.importTypeMetadata === undefined) {
    return (
      <Panel headerText="Job Settings" collapsed={true}>
        <div style={{ display: "flex", flexDirection: "column", paddingLeft: 30 }}>
          <Label wrappingType="Normal">
            Model and Import Type selection is required to enable and display Job Settings
          </Label>
        </div>
      </Panel>
    );
  }

  return (
    <Panel headerText="Job Settings" collapsed={true}>
      <div style={{ display: "flex", flexDirection: "column", paddingLeft: 30 }}>
        <Error message={error} close={() => setError("")} />
        <ImportMethod
          setImportMethod={setImportMethod}
          importMethod={props.jobSettings.importMethod}
          importType={props.importType}
        />
        <ReverseSignCheckbox
          disabled={props.importType === 'privateFactData'}
          reverseSign={props.jobSettings["reverseSignByAccountType"] === true}
          setReverseSign={setReverseSign}
        />
        <ExecuteWithFailedRowsCheckbox
          executeWithFailedRows={
            props.jobSettings["executeWithFailedRows"] ? props.jobSettings["executeWithFailedRows"] : true // default to true
          }
          setExecuteWithFailedRows={setExecuteWithFailedRows}
        />
        <IgnoreAdditionalColumns
          ignoreAdditionalColumns={
            props.jobSettings["ignoreAdditionalColumns"] ? props.jobSettings["ignoreAdditionalColumns"] : false // default to false
          }
          setIgnoreAdditionalColumns={setIgnoreAdditionalColumns}
        />
        <PivotSettings
          pivotSettings={props.jobSettings["pivotOptions"]}
          setPivotSettings={setPivotSettings}
          clearPivotSettings={clearPivotSettings}
          mappings={props.mappings}
          importTypeMetadata={props.importTypeMetadata}
        />
        <DateFormatsSettings
          dateFormats={props.jobSettings['dateFormats']}
          importTypeMetadata={props.importTypeMetadata}
          setDateFormats={setDateFormats}
          clearDateFormats={clearDateFormats}
          disabled={props.importType === 'privateFactData'}
        />
      </div>
    </Panel>
  );

}

export default JobSettingsSelector;
