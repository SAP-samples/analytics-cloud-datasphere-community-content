import { Label, Title } from "@ui5/webcomponents-react";

function AdminBuilderHeader() {
  return (
    <div
      style={{
        backgroundColor: "#eff4f9",
        minHeight: "120px",
        display: "flex",
        borderBottom: "1px solid #d1e0ee",
      }}
    >
      <div
        style={{
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 12,
          paddingBottom: 12,
          margin: "auto",
          marginLeft: 0,
        }}
      >
        <Title style={{ margin: "auto", marginLeft: 0, color: "#346187" }}>
          File Upload
        </Title>
        <Label>Configure File Upload Widget</Label>
      </div>
    </div>
  );
}

export default AdminBuilderHeader;
