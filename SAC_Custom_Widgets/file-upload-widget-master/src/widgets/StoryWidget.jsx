import ReactDOM from "react-dom/client";
import DataImportServiceApi from "../api/dataImportService";
import { render } from "./BuilderWidget";


export default class StoryWidget extends HTMLElement {
  static get observedAttributes() {
    return ["settings"];
  }

  constructor() {
    super();

    // External APIs & Handlers
    this.baseURL = window.location.origin;
    this.dataImportService = new DataImportServiceApi(
      this.baseURL + "/api/v1/dataimport"
    );
    // Upload Handler & Settings
    // Class Properties, try to avoid adding too many here
    this.importType = "";
    this.modelId = "";
    this.resultObj = undefined
    this.updateSettings();
  }

  /**
   * Allows the user to call the 'open' method from the SAC Script, and open the dialog
   */
  open() {
    window.handleButtonClick()
  }

  /**
   * Emits an event when the job is finished. Called from Data Import Service client.
   * @param {*} event the event to emit from the widget
   * @param {*} resultObj the result obj from the finished job run
   */
  jobRunFinishedEventDispatcher(event, resultObj) {
    const status_to_event = {
      "COMPLETED": "onSuccess",
      "COMPLETED_WITH_FAILURES": "onPartialSuccess",
      "FAILED": "onFailure",
    }

    if (status_to_event[event] !== undefined) {
      this.resultObj = resultObj
      this.dispatchEvent(new Event(status_to_event[event]))
    }
  }


  /**
   * 
   * @returns The number of rows attached in the last Data Import Service Job
   */
  getTotalJobRowCount() {
    if (this.resultObj) {
      return this.resultObj.totalRecordsFromUser
    }
    return -1
  }

  /**
   * 
   * @returns The number of failed rows in the last Data Import Service Job
   */
  getJobFailedRowCount() {
    if (this.resultObj) {
      return this.resultObj.failedRecords.length
    }
    return -1
  }

  /**
   * Passes values back into react components on change
   * @param {} name
   * @param {*} oldValue
   * @param {*} newValue
   */
  attributeChangedCallback(name, oldValue, newValue) {
    const settings = JSON.parse(this.getAttribute("settings"));
    if (this.root) {
      render(this.root, settings)
    }
  }

  /**
   * Attaches the React Application to the DOM
   */
  connectedCallback() {
    const elem = this
    if (!this.root) {
      this.root = ReactDOM.createRoot(elem)
    }
    const settings = JSON.parse(this.getAttribute("settings"));
    const props = {...settings, jobFinsishedEventDispatcher: this.jobRunFinishedEventDispatcher.bind(this),}
    render(this.root, props)
  }

  /**
     * Sets the attributes of the BuilderWidget component to have the
     * values specified in the changedProperties object
     * @param {Object} changedProperties - An object containing the properties that have changed
   */
  onCustomWidgetAfterUpdate(changedProperties) {
    console.log("Import Widget Properties", changedProperties);
    if (changedProperties["modelId"] !== undefined) {
      this.modelId = changedProperties["modelId"];
    }
    if (changedProperties["importType"] !== undefined) {
      this.setImportType(changedProperties["importType"]);
    }
    if (changedProperties["mappings"] !== undefined) {
      this.setMappings(changedProperties["mappings"]);
    }
    if (changedProperties["defaultValues"] !== undefined) {
      this.setDefaultValues(changedProperties["defaultValues"]);
    }
    if (changedProperties["jobSettings"] !== undefined) {
      this.setJobSettings(changedProperties["jobSettings"]);
    }
    if (changedProperties["sheetName"] !== undefined) {
      this.sheetName = changedProperties["sheetName"];
    }
    this.updateSettings();
  }

  /**
    * Updates settings object persisted to the SAC Story
   */
  updateSettings() {
    const settings = {
      modelId: this.modelId,
      baseURL: this.baseURL,
      mode: "STORY",
      isAdminMode: false,
      jobSettings: this.getJobSettings(),
      mappings: this.getMappings(),
      defaultValues: this.getDefaultValues(),
      importType: this.importType,
    };
    this.setAttribute("settings", JSON.stringify(settings));
  }


  /**
   * @returns The ModelID currently specified
   */
  get modelId() {
    return this._modelId;
  }

  /** 
   * @param modelID - the modelID we want to set
  */
  set modelId(modelId) {
    this._modelId = modelId;
    this.updateSettings();
  }

  /**
   * Sets the Import Type
   * @param {String} importType - The import type specified in the builder panel
   */
  setImportType(importType) {
    this.dataImportService.importType = importType;
  }

  /**
   * Sets the Mappings 
   * @param {Object} mappings - Mappings specified in the builder panel
   */
  setMappings(mappings) {
    this.dataImportService.setMappings(mappings);
  }

  /**
   * Sets the Job Settings
   * @param {Object} jobSettings - Job Settings specifed in the builder panel
   */
  setJobSettings(jobSettings) {
    this.dataImportService.setJobSettings(jobSettings);
  }

  /**
   * Sets the Default Values
   * @param {Object} defaultValues 
   */
  setDefaultValues(defaultValues) {
    this.dataImportService.setDefaultValues(defaultValues);
  }

  /**
   * Sets the Sheet Name
   * @param {String} sheetName 
   */
  setSheetName(sheetName) {
    this.sheetName = sheetName;
  }

  /**
   * Sets the Chunk Size
   * @param {number} - Chunk Size we want to specify
   */
  setChunkSize(chunkSize) {
    this.dataImportService.setChunkSize(chunkSize);
  }

  /**
   * Gets the data import type.
   * @returns {String} The data import type.
   */
  getImportType() {
    return this.dataImportService.importType;
  }

  /**
   * Retrieves job settings for data import.
   * @returns {Object} An object containing job settings.
   */
  getJobSettings() {
    return this.dataImportService.getJobSettings();
  }

  /**
   * Retrieves default values for data import.
   * @returns {Object} An object containing default values.
   */
  getDefaultValues() {
    return this.dataImportService.getDefaultValues();
  }

  /**
   * Retrieves mappings for data import.
   * @returns {Object} An object containing data mappings.
   */
  getMappings() {
    return this.dataImportService.getMappings();
  }

  /**
   * Retrieves the chunk size for data import.
   * @returns {number} The chunk size for data import.
   */
  getChunkSize() {
    return this.dataImportService.getChunkSize();
  }
}