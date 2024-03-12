import Papa from "papaparse";
import DataImportJobResults from "./dataImportJobResults";

// Possible Job Statuses for Data Import Service Jobs
export const JOBS_STATUSES = [
  "NOT_STARTED",
  "READY_FOR_WRITE",
  "PROCESSING",
  "COMPLETED",
  "COMPLETED_WITH_FAILURES",
  "FAILED",
];

export default class DataImportServiceApi {
  static INSTANCE;

  MODELS_ENDPOINT = "/models";
  JOBS_ENDPOINT = "/jobs";
  WIDGET_ENDPOINT = "/widget"

  constructor(URL) {
    this.URL = URL;
    this.mappings = {};
    this.defaultValues = {};
    this.jobSettings = {};
    this.importType = "factData";
    this.chunkSize = 100_000;
    this.resultObj = {};
    this.delimiter = ","
    DataImportServiceApi.INSTANCE = this;
  }

  static getInstance() {
    return DataImportServiceApi.INSTANCE;
  }

  // Getters & Setters

  setMappings(mappings) {
    this.mappings = mappings;
  }

  getMappings() {
    return this.mappings;
  }

  setDefaultValues(defaultValues) {
    this.defaultValues = defaultValues;
  }

  getDefaultValues() {
    return this.defaultValues;
  }

  setJobSettings(jobSettings) {
    this.jobSettings = jobSettings;
  }

  getJobSettings() {
    return this.jobSettings;
  }

  setChunkSize(chunkSize) {
    this.chunkSize = chunkSize;
  }

  getChunkSize() {
    return this.chunkSize;
  }

  /** Get Based Requests */

    async getXLSXScriptURL() {
      // Used to generate a consistent URL for the XLSX script, used to parse XLSX data within a webworker
      const widgetXLSXUrl = this.URL + this.WIDGET_ENDPOINT + "/xlsx.mini.min.js"
      let response = await fetch(widgetXLSXUrl)
      if (!response.ok) {
        return "https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.mini.min.js"
      }
      return widgetXLSXUrl
    }

    /**
       * Fetches a list of models from Data Import Service
       *
       * @throws {Error} Throws an error if the HTTP response status is not 2xx
       *
       * @returns {Promise<Array>} A promise that resolves with the list of models
    */
  async getModels() {
    let response = await fetch(this.URL + this.MODELS_ENDPOINT);
    if (!response.ok) {
      throw new Error("Unable to get list of models");
    }
    return await response.json();
  }


  /**
     * Fetches information for a specific model from Data Import Service.
     *
     * @param {string} modelId - The unique identifier of the model to retrieve.
     *
     * @throws {Error} Throws an error if the HTTP response status is not 2xx
     *
     * @returns {Promise<Object>} A promise that resolves with the model information as an object.
   */
  async getModel(modelId) {
    let response = await fetch(this.URL + this.MODELS_ENDPOINT + "/" + modelId);
    if (!response.ok) {
      throw new Error("Unable to get model information");
    }
    return await response.json();
  }

  /**
     * Fetches the metadata for a specific model from Data Import Service.
     *
     * @param {string} modelId - The unique identifier of the model to retrieve.
     *
     * @throws {Error} Throws an error if the HTTP response status is not 2xx
     *
     * @returns {Promise<Object>} A promise that resolves with the model metadata as an object.
   */
  async getModelMetadata(modelId) {
    let response = await fetch(
      this.URL + this.MODELS_ENDPOINT + "/" + modelId + "/metadata"
    );
    if (!response.ok) {
      throw new Error("Unable to get model metadata");
    }
    return await response.json();
  }

  /**
     * Fetches a CSRF Token from Data Import Service used in POST Requests
     *
     * @throws {Error} Throws an error if the HTTP response status is not 2xx
     *
     * @returns {String} A string containing a CSRF token
   */
  async getCSRFToken() {
    const jobUrl = this.URL + this.MODELS_ENDPOINT;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Csrf-Token": "fetch",
      },
    };
    const response = await fetch(jobUrl, options);
    if (!response.ok) {
      this.status = "FAILED";
      await this.handleJsonError(response);
      throw new Error(`Unable to fetch CSRF token - ${response.status}`);
    }
    return await response.headers.get("X-Csrf-Token");
  }

  /** Job Based Data Upload */

  /**
   * Uses set defaultValues, jobSettings, and mappings to push data to model
   * @param {*} modelId the model to target
   * @param {*} data the data to push to the model
   * @param {*} callback containing importStatus and a DataImportJobResults object
   */
  async uploadData(
    modelId,
    data,
    callback = (importStatus, importResultData) => { },
    mode = "json",
    userDefaultValues = {},
    columnNames
  ) {
    this.resultObj = new DataImportJobResults();
    this.resultObj.columnNames = [[...columnNames, "Rejection Reason"].join(this.delimiter)]
    this.status = "NOT_STARTED";
    try {
      this.csrfToken = await this.getCSRFToken();
    } catch (error) {
      this.resultObj.error = error;
      callback(this.status, this.resultObj);
    }
    let createdJob = {};

    try {
      createdJob = await this.createJob(modelId, this.importType, userDefaultValues);
    } catch (error) {
      this.resultObj.error = error;
      callback(this.status, this.resultObj);
      return;
    }

    const jobId = createdJob["jobID"];

    this.resultObj.totalRecordsFromUser = data.length
    if (mode === "csv") {
      if (data.length < 1) {
        // Throw an error since the file is too small, should never occur from main flow
        const error = new Error("Data contains no rows")
        this.resultObj.error = error
        this.status = "FAILED"
        callback(this.status, error)
      }
      for (let i = 1; i < data.length; i += this.chunkSize) {
        // Posting Data to Data Import Service in chunks, of default size 100000
        const chunk = [data[0], ...data.slice(i, i + this.chunkSize)]
        try {
          await this.postCSVDataToJob(jobId, chunk);
        } catch (error) {
          this.resultObj.error = error;
          callback(this.status, this.resultObj);
          return;
        }
      }
    }

    // Run job
    try {
      await this.postRunJob(jobId);
    } catch (error) {
      this.resultObj.error = error;
      callback(this.status, this.resultObj);
      return;
    }

    // Poll until job finished for completion / failure status
    try {
      await this.pollStatusTillCompletion(jobId);
    } catch (error) {
      this.resultObj.error = error;
      callback(this.status, this.resultObj);
    }

    // If a job is completed but earlier on some records failed to be posted to the staging table update the status
    if (this.status === "COMPLETED" && this.resultObj.failedRecords.length > 0) {
      this.status = "COMPLETED_WITH_FAILURES"
    }

    if (this.resultObj.statusResponse.additionalInformation.failedNumberRows) {
      try {
        const invalidRowsValidation = await this.getInvalidRows(jobId);
        const invalidRowsDataMotive = await this.convertDMInvalidRowsToCSV(invalidRowsValidation)
        this.resultObj.dataMotiveFailedRowsCount = invalidRowsDataMotive.length
        this.resultObj.failedRecords = [
          ...this.resultObj.failedRecords,
          ...invalidRowsDataMotive
        ];
      } catch (error) {
        this.resultObj.error = error;
        callback(this.status, this.resultObj);
        return;
      }
    }
    callback(this.status, this.resultObj);
  }

  async pollStatusTillCompletion(jobId) {
    while (
      this.status !== "COMPLETED" &&
      this.status !== "FAILED" &&
      this.status !== "COMPLETED_WITH_FAILURES"
    ) {
      let jobStatusResp;
      try {
        jobStatusResp = await this.getJobStatus(jobId);
        this.status = jobStatusResp.jobStatus;
        this.resultObj.statusResponse = jobStatusResp;
      } catch (error) {
        this.status = "FAILED";
        throw new Error(`Error checking job status`);
      }
      if (this.status === "COMPLETED") {
        // below disable warning line in case we ever swap to using a real number
        // eslint-disable-next-line eqeqeq
        if (jobStatusResp.additionalInformation.failedNumberRows != "0") {
          this.status = "COMPLETED_WITH_FAILURES";
          return;
        }
        return;
      } else if (this.status === "FAILED") {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }


  /**
   * 
   * @param {String} modelId - The ModelID to target
   * @param {String} importType - The Import Type of this job
   * @param {String} userDefaultValues - Default Values specifed by the end user
   * @returns {Object} The Response of the Job Creation Request
   */
  async createJob(modelId, importType = "factData", userDefaultValues = {}) {
    const jobUrl = this.URL + this.MODELS_ENDPOINT + "/" + modelId + "/" + importType;
    Object.keys(this.mappings).forEach((key) => {
      // Checks if the user has specified mappings for a column
      if (this.mappings[key] === undefined || this.mappings[key] === "") {
        this.mappings[key] = key;
      }
    });

    const jobSettings = { ...this.jobSettings };
    const pivotOptions = jobSettings.pivotOptions;
    // If Pivot Options are not specified correctly, do not apply them to the job
    if (pivotOptions &&
      (!pivotOptions.pivotColumnStart || !pivotOptions.pivotKeyName || !pivotOptions.pivotValueName)) {
      delete jobSettings["pivotOptions"]
    }

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": this.csrfToken,
      },
      body: JSON.stringify({
        Mapping: this.mappings,
        DefaultValues: { ...this.defaultValues, ...userDefaultValues },
        JobSettings: jobSettings,
      }),
    };
    const response = await fetch(jobUrl, options);
    if (!response.ok) {
      this.status = "FAILED";
      await this.handleJsonError(response);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  /**
     * 
     * @param {String} jobId - The JobID of the job created in the 'createJob' function
     * @param {*} chunk - The chunk of data to be posted
     * @returns The Response from the Request to Data Import Service
   */
  async postCSVDataToJob(jobId, chunk) {
    const jobUrl = this.URL + this.JOBS_ENDPOINT + "/" + jobId;

    const data = Papa.unparse(chunk);
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "text/csv",
        "x-csrf-token": this.csrfToken,
      },
      body: data,
    };

    const response = await fetch(jobUrl, options);
    if (!response.ok) {
      this.status = "FAILED"
      await this.handleJsonError(response);
      throw new Error(`Error sending data to import job: ${response.status}`);
    }
    const json = await response.json();

    // If there were failed rows, add them to the _failedRecords array
    if (json.failedRows.length > 0) {
      // Convert the rows to a readable format
      const failedRowsWithReasonAsCSV = this.convertDISInvalidRowsToCSV(json.failedRows)
      this.resultObj.failedRecords = [
        ...this.resultObj.failedRecords,
        ...failedRowsWithReasonAsCSV
      ];
    }
    return json;
  }


  /**
   * 
   * @param {String} jobId = The JobId of the job we want to run
   * @returns The Response from the Request to Data Import Service
   */
  async postRunJob(jobId) {
    const jobUrl = this.URL + this.JOBS_ENDPOINT + "/" + jobId + "/run";

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": this.csrfToken,
      },
      data: { jobSettings: this.jobSettings },
    };

    const response = await fetch(jobUrl, options);
    if (!response.ok) {
      this.status = "FAILED"
      await this.handleJsonError(response);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  /**
   * 
   * @param {String} jobId - The JobID we want to get the status of 
   * @returns The response from the JobID status request
   */
  async getJobStatus(jobId) {
    const jobStatusUrl =
      this.URL + this.JOBS_ENDPOINT + "/" + jobId + "/status";
    let options = {
      method: "GET",
    };
    let response = await fetch(jobStatusUrl, options);
    if (!response.ok) {
      await this.handleJsonError(response);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  /**
   * Gets all the jobs associated with a tenant
   * @returns {Promise<Object>} A JSON object containing an array of all the jobs
   */
  async getJobs() {
    const jobStatusUrl =
      this.URL + this.JOBS_ENDPOINT;
    let options = {
      method: "GET",
    };
    let response = await fetch(jobStatusUrl, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  /**
   * 
   * @param {String} jobId - The JobID we want to get the invalid rows for
   * @returns {Promise<Object>} - A JSON object containing an array of rows that failed Validation
   */
  async getInvalidRows(jobId) {
    const invalidRowsUrl =
      this.URL + this.JOBS_ENDPOINT + "/" + jobId + "/invalidRows";
    let options = {
      method: "GET",
    };

    let response = await fetch(invalidRowsUrl, options);
    if (!response.ok) {
      await this.handleJsonError(response);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  /**
   * Adds the Error JSON response to the resultsObj.errorResponses array
   * @param {Response} response - The Error Response
   */
  async handleJsonError(response) {
    const responseType = response.headers.get("Content-Type");
    if (responseType && responseType.toLowerCase() === "application/json") {
      const error = await response.json();
      this.resultObj.errorResponses.push(error);
    }
  }

  /**
   * 
   * @param {Array<String>} importData - The Data inputted by the user 
   * @param {*} importTypeMetadata - The Metadata of the model we want to validate
   * @returns 
   */
  validateJobData(importData, importTypeMetadata) {
    const errors = []
    if (importData.length < 2) {
      errors.push("The data should contain at least one row of headers and one row of values.")
    }
    const headerRow = this._getHeaderRow(importData)
    // check that each key column has a column value or is a pivotKey / pivotValue or has a default value
    const importTypeMetadataKeys = importTypeMetadata.keys
    for (let key of importTypeMetadataKeys) {
      if (!headerRow.includes(key) && // header does not include the key
        !headerRow.includes(this.mappings[key]) && // a mapped value in the header does not contain the key
        !(this.jobSettings.pivotOptions !== undefined && this.jobSettings.pivotOptions.pivotKeyName === key) &&  // pivot options exist and the keyName is not the key
        !(this.jobSettings.pivotOptions !== undefined && this.jobSettings.pivotOptions.pivotValueName === key) && // pivot options exist and the keyValue is not the key
        !(this.defaultValues[key]) && // A default value does not exist for the key
        !(key === "Version") // The version dimension has a default default value of public.Actual so we can skip this "key"...
      ) {
        // we are missing a key
        errors.push(`The key dimension - ${key} has no value`)
      }
    }

    // check that each column in the headers that are not pivot keys have a match in the metadata with consideration for mappings
    const columnNames = importTypeMetadata.columns.map((c) => c.columnName)
    // collect valid mapping values
    const validMappingsValues = []
    for (let key in this.mappings) {
      // check for misconfiguration that could occur if a model changes
      if (!columnNames.includes(key)) {
        errors.push(`The mapping ${key} to ${this.mappings[key]} is not valid. Please contact an administrator to fix the mappings settings.`)
      }
      if (columnNames.includes(key) && this.mappings[key] !== undefined && this.mappings[key] !== "") {
        validMappingsValues.push(this.mappings[key])
      }
    }

    // Additional Columns can be ignored with this Job Setting
    if(!this.jobSettings["ignoreAdditionalColumns"]) { 
      for (let headerName of headerRow) {
        if (
          !columnNames.includes(headerName) &&   // header is not the same as metadata
          !validMappingsValues.includes(headerName)    // header does not have a valid mapping that is mapped into metadata 
        ) {
          errors.push(`Data contains unknown column - ${headerName}`)
        }
      }
    }
    return errors
  }

  /**
   * Gets the header row of a file specified by the user
   * @param {Array<String>} importData 
   * @returns 
   */
  _getHeaderRow(importData) {
    const errors = []
    if (importData.length < 2) {
      errors.push("The data should contain at least one row of headers and one row of values.")
    }
    const headerRow = [...importData[0]]
    let checkToColumn = importData[0].length

    if (this.jobSettings.pivotOptions !== undefined && this.jobSettings.pivotOptions.pivotColumnStart !== undefined) {
      checkToColumn = this.jobSettings.pivotOptions.pivotColumnStart
      if (headerRow.length < this.jobSettings.pivotColumnStart) {
        // fail fast because the parsing is difficult and nonsensical otherwise
        return [`The data should contain at least ${this.jobSettings.pivotColumnStart} columns in order to support pivot import sedttings, found only ${headerRow.length}`]
      }
      while (headerRow.length >= checkToColumn) {
        headerRow.pop()
      }
    }
    return headerRow
  }

  /**
   * Validates whether or not a user has specified a version in their file
   * @param {Array<String>} importData - The import data specified by the user
   * @returns {boolean} - Returns true if the user speciried a version in their data
   */
  validateVersionExistsInDataOrSettings(importData) {
    const key = "Version"
    const headerRow = this._getHeaderRow(importData)
    if (!headerRow.includes(key) && // header does not include version
      !headerRow.includes(this.mappings[key]) && // a mapped value in the header does not contain the version
      !(this.jobSettings.pivotOptions !== undefined && this.jobSettings.pivotOptions.pivotKeyName === key) &&  // pivot options exist and the keyName is not the key
      !(this.jobSettings.pivotOptions !== undefined && this.jobSettings.pivotOptions.pivotValueName === key)) {
      return false
    }
    return true
  }

  /**
   * Map Rows from {row: <row>, reason: <reason>} to CSV String
   * @param {Array<Object>} DISInvalidRows - Invalid Rows as we get them back from Data Import Service
   * @returns {Array<String>} - Invalid Rows as CSV Strings
   */
  convertDISInvalidRowsToCSV(DISInvalidRows) {
    return DISInvalidRows.map((row) => `${row.row.replaceAll(",", this.delimiter)}${this.delimiter}${row.reason}`)
  }

  /**
   * Convert rows from Data Motive Failed Records to CSV Strings
   * @param {Array<Object>} invalidRowsValidation - Invalid Rows as recieved from Data Motive 
   * @returns {Array<String>} - Invalid Rows as CSV Strings
   */
  convertDMInvalidRowsToCSV(invalidRowsValidation) {
    return invalidRowsValidation.failedRows.map((row) => Object.values(row).join(this.delimiter))
  }
}
