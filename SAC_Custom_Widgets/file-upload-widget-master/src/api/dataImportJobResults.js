export default class DataImportJobResults {
  constructor() {
    this.totalRecordsFromUser = -1
    this.failedRecords = [];
    this.error = {};
    this.statusResponse = undefined;
    this.errorResponses = [];
    this.columnNames = [];
    this.dataMotiveFailedRowsCount = 0;
  }
}
