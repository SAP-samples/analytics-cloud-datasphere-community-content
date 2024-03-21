import ReactDOM from "react-dom/client";
import DataImportServiceApi from "../api/dataImportService";
import App from "../App";

export default class BuilderWidget extends HTMLElement {
  static get observedAttributes() {
    return ["settings"];
  }

  constructor() {
    super();
    this.baseURL = window.location.origin;
    this.dataImportService = new DataImportServiceApi(
      this.baseURL + "/api/v1/dataimport"
    );
    this.modelId = "";
    this.importType = "";
    this.mappings = {};
    this.defaultValues = {};
    this.jobSettings = {};
    this.sheetName = "";

    // Class Properties, try to avoid adding too many here
    this.updateSettings();
  }

  /**
   * Passes values back into react components on change
   * @param {} name
   * @param {*} oldValue
   * @param {*} newValue
   */
  attributeChangedCallback(name, oldValue, newValue) {
    const settings = JSON.parse(this.getAttribute("settings"));
    settings["setWidgetAttribute"] = this.setWidgetAttribute.bind(this);
    if (this.root) {
      render(this.root, settings);
    }
  }


  /**
   * Sets the attributes of the BuilderWidget component to have the
   * values specified in the changedProperties object
   * @param {Object} changedProperties - An object containing the properties that have changed
   */
  onCustomWidgetAfterUpdate(changedProperties) {
    if (changedProperties["modelId"] !== undefined) {
      this.modelId = changedProperties["modelId"];
    }
    if (changedProperties["importType"] !== undefined) {
      this.importType = changedProperties["importType"];
    }
    if (changedProperties["mappings"] !== undefined) {
      this.mappings = changedProperties["mappings"];
    }
    if (changedProperties["defaultValues"] !== undefined) {
      this.defaultValues = changedProperties["defaultValues"];
    }
    if (changedProperties["jobSettings"] !== undefined) {
      this.jobSettings = changedProperties["jobSettings"];
    }
    if (changedProperties["sheetName"] !== undefined) {
      this.sheetName = changedProperties["sheetName"];
    }
    this.updateSettings();
  }

  /**
   * Sets an event with the key value pair of the property that's chagned
   * @param {String} key - the property that's changed 
   * @param {*} value - the new value of the property
   */
  setWidgetAttribute(key, value) {
    const settings = JSON.parse(this.getAttribute("settings"));
    settings[key] = value;
    const event = new CustomEvent("propertiesChanged", {
      detail: {
        properties: {
          [key]: value,
        },
      },
    });
    this.dispatchEvent(event);
  }

  /**
   * Updates settings object persisted to the SAC Story
   */
  updateSettings() {
    const settings = {
      modelId: this.modelId,
      importType: this.importType,
      baseURL: this.baseURL,
      mode: "BUILDER",
      isAdminMode: true,
      jobSettings: this.jobSettings,
      mappings: this.mappings,
      defaultValues: this.defaultValues,
      sheetName: this.sheetName,
    };
    this.setAttribute("settings", JSON.stringify(settings));
  }


  /**
   * Attaches the React Application to the DOM
   */
  connectedCallback() {
    const elem = this
    if (!this.root) {
      this.root = ReactDOM.createRoot(elem);
    }
    const settings = JSON.parse(this.getAttribute("settings"));
    settings["setWidgetAttribute"] = this.setWidgetAttribute.bind(this);
    render(this.root, settings);
  }
}

/**
 * 
 * @param {ReactDOM} root - The Root of the React DOM
 * @param {*} props - Any props we want to pass into the react app
 */
export function render(root, props) {
  root.render(<App {...props}></App>);
}
