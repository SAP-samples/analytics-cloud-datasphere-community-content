import { MessageStrip } from "@ui5/webcomponents-react";
import React from "react";

function Error(props) {
  if (!props.message) {
    return;
  }
  return (
    <MessageStrip design="Negative" onClose={() => props.close()}>
      {props.message}
    </MessageStrip>
  );
}

export default Error;
