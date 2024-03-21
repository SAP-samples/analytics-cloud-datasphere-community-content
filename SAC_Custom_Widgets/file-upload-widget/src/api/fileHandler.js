import Papa from "papaparse";
import DataImportServiceApi from "./dataImportService";

export default class FileHandler {

  /**
   * 
   * @param {File} file - File Specified by the User
   * @param {String} sheetName - which sheetname in the file to use
   * @param {Function} callback  - The callback function to handle import data
   * @returns {Promise<Function>} - Callback Handler for Import Data
   */
  async parseXLSXFileSimple(file, sheetName, callback = () => {}) {
    const worker = new Worker(URL.createObjectURL(new Blob([`\
    importScripts("${await DataImportServiceApi.INSTANCE.getXLSXScriptURL()}");

    self.addEventListener('message', async(e) => {
      try {
        const ab = new FileReaderSync().readAsArrayBuffer(e.data.file);
        const workbook = XLSX.read(ab, {dense: true});
        const parsingSheetName = e.data.sheetName === "" ? workbook.SheetNames[0] : e.data.sheetName
        const sheet = workbook.Sheets[parsingSheetName]
        const dataInCSVFormat = XLSX.utils.sheet_to_json(sheet, {header: 1, defval: ""})
        postMessage({dataInCSVFormat: dataInCSVFormat, sheetNames: workbook.SheetNames})
      } catch(e) {
        postMessage(e)
      }
    })
    `], { type: "text/javascript" })))

    return new Promise((resolve, reject) => {
      worker.onmessage = async function(e) {
        const dataInCSVFormat = await e.data.dataInCSVFormat
        const sheetNames = await e.data.sheetNames
        callback([dataInCSVFormat, sheetNames]);
      }
      worker.onerror = (e) => {
        reject(e.message)
      }
      worker.postMessage({file: file, sheetName: sheetName})
    })
  }

  /**
   * @param {File} file - File Specified by the User
   * @param {Function} callback  - The callback function to handle import data
   */

  parseCSVFileSimple(file, callback = () => {}) {
      Papa.parse(file, {
        worker: true,
        complete: (results, file) => {
          this.sheetData = results.data;
          callback(this.sheetData);
        },
        error: (error, file) => {
          console.error(error);
        },
      });
    }
  }
