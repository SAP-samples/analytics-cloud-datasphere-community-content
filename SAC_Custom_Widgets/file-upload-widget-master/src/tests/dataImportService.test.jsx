import DataImportServiceApi from "../api/dataImportService";
import { vi, describe, test } from "vitest";
import { Response } from "node-fetch";
import Papa from "papaparse";

global.fetch = vi.fn();


describe("dataImportServiceApi", () => {

    const mockOrigin = "https://mockTenant.cloud";
    const mockModelId = "mockModelId"
    const mockJobId = "mockJobID"

    beforeEach(() => {
        new DataImportServiceApi(
            mockOrigin + "/api/v1/dataimport"
        );
        vi.clearAllMocks();
    })

    test("getInstance", async () => {
        expect(await DataImportServiceApi.INSTANCE).toBeDefined();
    })

    describe("getXLSXScriptURL", () => {
        test("Successfully fetches XLXS URL", async () => {
            fetch.mockReturnValue(Promise.resolve(getSuccessfulResponse()))

            const XlxsUrl = await DataImportServiceApi.INSTANCE.getXLSXScriptURL()

            expect(XlxsUrl).toEqual("https://mockTenant.cloud/api/v1/dataimport/widget/xlsx.mini.min.js")
        })

        test("Fails to fetch XLXS URL", async () => {
            fetch.mockReturnValue(Promise.resolve(getNegativeResponse()))

            const XlxsUrl = await DataImportServiceApi.INSTANCE.getXLSXScriptURL()

            expect(XlxsUrl).toEqual("https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.mini.min.js")
        })
    })

    describe("getModels", () => {

        test("Successfully fetches list of models", async () => {
            fetch.mockReturnValue(Promise.resolve(getSuccessfulResponse()))

            await DataImportServiceApi.INSTANCE.getModels()

            const options = {
                headers: {
                    "x-sap-dis-request-source": "fileUploadWidget",
                },
            }

            expect(fetch).toHaveBeenCalledWith("https://mockTenant.cloud/api/v1/dataimport/models", options)
        })


        test("Fails to fetch list of models", async () => {
            fetch.mockReturnValue(Promise.resolve(getNegativeResponse()))

            await expect(() => DataImportServiceApi.INSTANCE.getModels()).rejects
                .toThrow("Unable to get list of models")
        })
    })


    describe("getModel", () => {
        test("Successfully fetches single Model", async () => {
            fetch.mockReturnValue(Promise.resolve(getSuccessfulResponse()))

            await DataImportServiceApi.INSTANCE.getModel(mockModelId)

            const options = {
                headers: {
                    "x-sap-dis-request-source": "fileUploadWidget",
                },
            }

            expect(fetch).toHaveBeenCalledWith("https://mockTenant.cloud/api/v1/dataimport/models/" + mockModelId, options)
        })

        test("Fails to fetch a single Model", async () => {
            fetch.mockReturnValue(Promise.resolve(getNegativeResponse()))

            await expect(() => DataImportServiceApi.INSTANCE.getModel()).rejects
                .toThrow("Unable to get model information")
        })
    })

    describe("getModelMetadata", () => {
        test("Successfully fetches model metadata", async () => {
            fetch.mockReturnValue(Promise.resolve(getSuccessfulResponse()))

            await DataImportServiceApi.INSTANCE.getModelMetadata(mockModelId)

            const options = {
                headers: {
                    "x-sap-dis-request-source": "fileUploadWidget",
                },
            }

            expect(fetch).toHaveBeenCalledWith("https://mockTenant.cloud/api/v1/dataimport/models/" + mockModelId + "/metadata", options)
        })

        test("Fails to fetch a single Model", async () => {
            fetch.mockReturnValue(Promise.resolve(getNegativeResponse()))

            await expect(() => DataImportServiceApi.INSTANCE.getModelMetadata()).rejects
                .toThrow("Unable to get model metadata")
        })
    })

    describe("getCSRFToken", () => {
        test("Successfully fetches CSRF Token from response headers", async () => {
            fetch.mockReturnValue(Promise.resolve(getSuccessfulResponse()))

            const csrfToken = await DataImportServiceApi.INSTANCE.getCSRFToken(mockModelId)

            const options = {
                "headers": {
                    "Content-Type": "application/json",
                    "X-Csrf-Token": "fetch",
                    "x-sap-dis-request-source": "fileUploadWidget",
                },
                "method": "GET"
            }

            expect(fetch).toHaveBeenCalledWith("https://mockTenant.cloud/api/v1/dataimport/models", options)
            expect(csrfToken).toEqual("mockCsrf")
        })

        test("Fails to fetch a CSRF Token", async () => {
            fetch.mockReturnValue(Promise.resolve(getNegativeResponse()))

            await expect(() => DataImportServiceApi.INSTANCE.getCSRFToken(mockModelId)).rejects
                .toThrow("Unable to fetch CSRF token - 500")
        })

    })

    describe("getJobs", () => {
        test("Successfully fetches a list of Import Jobs", async () => {
            fetch.mockReturnValue(Promise.resolve(getSuccessfulResponse()))

            await DataImportServiceApi.INSTANCE.getJobs()

            const options = {
                "method": "GET",
                headers: {
                    "x-sap-dis-request-source": "fileUploadWidget"
                },
            }

            expect(fetch).toHaveBeenCalledWith("https://mockTenant.cloud/api/v1/dataimport/jobs", options)
        })

        test("Fails to fetch list of jobs", async () => {
            fetch.mockReturnValue(Promise.resolve(getNegativeResponse()))

            await expect(() => DataImportServiceApi.INSTANCE.getJobs()).rejects
                .toThrow("HTTP error! status: 500")
        })
    })

    describe("getJobStatus", () => {
        test("Successfully fetches Job Status", async () => {
            fetch.mockReturnValue(Promise.resolve(getSuccessfulResponse()))

            await DataImportServiceApi.INSTANCE.getJobStatus(mockJobId)

            const options = {
                "method": "GET",
                headers: {
                    "x-sap-dis-request-source": "fileUploadWidget"
                },
            }

            expect(fetch)
                .toHaveBeenCalledWith("https://mockTenant.cloud/api/v1/dataimport/jobs/" + mockJobId + "/status", options)
        })

        test("Fails to fetch status of job", async () => {
            fetch.mockReturnValue(Promise.resolve(getNegativeResponse()))

            await expect(() => DataImportServiceApi.INSTANCE.getJobStatus(mockJobId)).rejects
                .toThrow("HTTP error! status: 500")
        })
    })

    describe("getInvalidRows", () => {

        test("Successfully fetches list of invalid Rows", async () => {
            fetch.mockReturnValue(Promise.resolve(getSuccessfulResponse()))

            await DataImportServiceApi.INSTANCE.getInvalidRows(mockJobId)

            const options = {
                "method": "GET",
                headers: {
                    "x-sap-dis-request-source": "fileUploadWidget"
                },
            }

            expect(fetch)
                .toHaveBeenCalledWith("https://mockTenant.cloud/api/v1/dataimport/jobs/" + mockJobId + "/invalidRows", options)
        })

        test("Fails to fetch list of invalid rows", async () => {
            fetch.mockReturnValue(Promise.resolve(getNegativeResponse()))

            await expect(() => DataImportServiceApi.INSTANCE.getInvalidRows(mockJobId)).rejects
                .toThrow("HTTP error! status: 500")
        })

    })

    describe("uploadData", () => {

        test("Triggers complete file import process", async () => {
            fetch.mockReturnValue(Promise.resolve(getSuccessfulResponse()))

            const csrfSpy = vi.spyOn(DataImportServiceApi.INSTANCE, "getCSRFToken")
            csrfSpy.mockReturnValue("mockCsrf")

            const postDataSpy = vi.spyOn(DataImportServiceApi.INSTANCE, "postCSVDataToJob")
            postDataSpy.mockReturnValue(Promise.resolve(getSuccessfulResponse()))

            const postRunJobSpy = vi.spyOn(DataImportServiceApi.INSTANCE, "postRunJob")
            postRunJobSpy.mockReturnValue(Promise.resolve(getSuccessfulResponse()))

            const getJobStatusSpy = vi.spyOn(DataImportServiceApi.INSTANCE, "getJobStatus")
            getJobStatusSpy.mockReturnValue(Promise.resolve({
                jobStatus: "COMPLETED",
                additionalInformation: {
                    failedNumberRows: 0
                }
            }))

            const data = [
                ["Version", "Item", "Date", "Price"],
                ["public.Actual", "Water", "202205", "2"],
                ["public.Actual", "Coffee", "202206", "3"],
                ["public.Actual", "Cola", "202206", "2"],
            ];


            const importFinishedCallback = (importStatus, importResult) => {
                expect(importStatus).toEqual("COMPLETED")
                expect(importResult.totalRecordsFromUser).toEqual(4)
            };

            const columnNames = ["Version", "Item", "Date", "Price"];
            await DataImportServiceApi.INSTANCE.uploadData(mockModelId, data,
                importFinishedCallback, "csv", {}, columnNames)

        }, { timeout: 10000 })

        test("Fails to fetch CSRF Token", async () => {
            const csrfSpy = vi.spyOn(DataImportServiceApi.INSTANCE, "getCSRFToken")
            csrfSpy.mockReturnValue(Promise.reject(getNegativeResponse()))

            const importFinishedCallback = (importStatus, importResult) => {
                expect(importStatus).toEqual("NOT_STARTED")
                expect(importResult.totalRecordsFromUser).toEqual(-1)
            };

            await DataImportServiceApi.INSTANCE.uploadData(mockModelId, "",
                importFinishedCallback, "csv", {}, [])

        }, { timeout: 10000 })

        test("Fails to  create a new Job", async () => {
            const csrfSpy = vi.spyOn(DataImportServiceApi.INSTANCE, "getCSRFToken")
            csrfSpy.mockReturnValue("mockCsrf")

            const createJobSpy = vi.spyOn(DataImportServiceApi.INSTANCE, "createJob")
            createJobSpy.mockReturnValue(Promise.reject(getNegativeResponse()))

            const importFinishedCallback = (importStatus, importResult) => {
                expect(importStatus).toEqual("NOT_STARTED")
                expect(importResult.totalRecordsFromUser).toEqual(-1)
            };

            await DataImportServiceApi.INSTANCE.uploadData(mockModelId, "",
                importFinishedCallback, "csv", {}, [])

        }, { timeout: 10000 })

        test("Fails when only a single row exists", async () => {
            fetch.mockReturnValue(Promise.resolve(getSuccessfulResponse()))

            const importFinishedCallback = (importStatus, _importResult) => {
                expect(importStatus).toEqual("FAILED")
            };


            await DataImportServiceApi.INSTANCE.uploadData(mockModelId, "",
                importFinishedCallback, "csv", {}, [])

        }, { timeout: 10000 })

        test("Fails to post CSV data to job", async () => {
            fetch.mockReturnValue(Promise.resolve(getSuccessfulResponse()))

            const postCSVDataToJobSpy = vi.spyOn(DataImportServiceApi.INSTANCE, "postCSVDataToJob")
            postCSVDataToJobSpy.mockReturnValue(Promise.reject(getNegativeResponse()))


            const data = [
                ["Version", "Item", "Date", "Price"],
                ["public.Actual", "Water", "202205", "2"],
                ["public.Actual", "Coffee", "202206", "3"],
                ["public.Actual", "Cola", "202206", "2"],
            ];

            const postRunJobSpy = vi.spyOn(DataImportServiceApi.INSTANCE, "postRunJob")
            postRunJobSpy.mockReturnValue(Promise.resolve(getSuccessfulResponse()))

            const importFinishedCallback = (importStatus, _importResult) => {
                expect(importStatus).toEqual("NOT_STARTED")
            };

            await DataImportServiceApi.INSTANCE.uploadData(mockModelId, data,
                importFinishedCallback, "csv", {}, [])

        }, { timeout: 10000 })

    })


    describe("postRunJob", () => {

        test("Successfully triggers job to run", async () => {
            fetch.mockReturnValue(Promise.resolve(getSuccessfulResponse()))

            DataImportServiceApi.INSTANCE["csrfToken"] = "mockCsrf"
            await DataImportServiceApi.INSTANCE.postRunJob(mockJobId)

            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": "mockCsrf",
                    "x-sap-dis-request-source": "fileUploadWidget",
                },
                data: { jobSettings: {} },
            };


            expect(fetch)
                .toHaveBeenCalledWith("https://mockTenant.cloud/api/v1/dataimport/jobs/" + mockJobId + "/run", options)
        })

        test("Fails to trigger job to run", async () => {
            fetch.mockReturnValue(Promise.resolve(getNegativeResponse()))

            await expect(() => DataImportServiceApi.INSTANCE.getInvalidRows(mockJobId)).rejects
                .toThrow("HTTP error! status: 500")
        })

    })

    describe("createJob", () => {

        test("Successfully creates a new job", async () => {
            fetch.mockReturnValue(Promise.resolve(getSuccessfulResponse()))

            DataImportServiceApi.INSTANCE["csrfToken"] = "mockCsrf"
            await DataImportServiceApi.INSTANCE.createJob(mockModelId, "factData", {})

            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": "mockCsrf",
                    "x-sap-dis-request-source": "fileUploadWidget",
                },
                body: "{\"Mapping\":{},\"DefaultValues\":{},\"JobSettings\":{}}"
            };


            expect(fetch)
                .toHaveBeenCalledWith("https://mockTenant.cloud/api/v1/dataimport/models/" + mockModelId + "/factData", options)
        })

        test("Fails to create a new job", async () => {
            fetch.mockReturnValue(Promise.resolve(getNegativeResponse()))

            await expect(() => DataImportServiceApi.INSTANCE.createJob(mockModelId, "factData", {})).rejects
                .toThrow("HTTP error! status: 500")
        })
    })

    describe("postCSVDataToJob", () => {

        test("Successfully posts CSV data to Job", async () => {
            fetch.mockReturnValue(Promise.resolve(getSuccessfulResponse("{\"failedRows\": []}")))

            DataImportServiceApi.INSTANCE["csrfToken"] = "mockCsrf"
            await DataImportServiceApi.INSTANCE.postCSVDataToJob(mockJobId, getMockedRows())

            const data = Papa.unparse(getMockedRows())
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "text/csv",
                    "x-csrf-token": "mockCsrf",
                    "x-sap-dis-request-source": "fileUploadWidget",
                },
                body: data
            };


            expect(fetch)
                .toHaveBeenCalledWith("https://mockTenant.cloud/api/v1/dataimport/jobs/" + mockJobId, options)
        })

        test("Fails to post CSV Data to Job", async () => {
            fetch.mockReturnValue(Promise.resolve(getNegativeResponse()))

            await expect(() => DataImportServiceApi.INSTANCE.postCSVDataToJob(mockModelId, getMockedRows())).rejects
                .toThrow("Error sending data to import job: 500")
        })


    })

    describe("pollStatusTillCompletion", async () => {
        test("Polls status until Job is successful", async () => {
            const getJobStatusSpy = vi.spyOn(DataImportServiceApi.INSTANCE, "getJobStatus")
            getJobStatusSpy.mockReturnValue(Promise.resolve({
                jobStatus: "COMPLETED",
                additionalInformation: {
                    failedNumberRows: 0
                }
            }))
            await DataImportServiceApi.INSTANCE.pollStatusTillCompletion(mockJobId)

            expect(DataImportServiceApi.INSTANCE["status"]).toEqual("COMPLETED")
        })

        test("Polls status until Job is completed with Failures", async () => {
            const getJobStatusSpy = vi.spyOn(DataImportServiceApi.INSTANCE, "getJobStatus")
            getJobStatusSpy.mockReturnValue(Promise.resolve({
                jobStatus: "COMPLETED",
                additionalInformation: {
                    failedNumberRows: 5
                }
            }))
            await DataImportServiceApi.INSTANCE.pollStatusTillCompletion(mockJobId)

            expect(DataImportServiceApi.INSTANCE["status"]).toEqual("COMPLETED_WITH_FAILURES")
        })

        test("Polls status until Job is failed", async () => {
            const getJobStatusSpy = vi.spyOn(DataImportServiceApi.INSTANCE, "getJobStatus")
            getJobStatusSpy.mockReturnValue(Promise.resolve({
                jobStatus: "FAILED",
            }))
            await DataImportServiceApi.INSTANCE.pollStatusTillCompletion(mockJobId)

            expect(DataImportServiceApi.INSTANCE["status"]).toEqual("FAILED")
        })

        test("Fails to get status of running job", async () => {
            await expect(() => DataImportServiceApi.INSTANCE.pollStatusTillCompletion(mockJobId)).rejects.toThrowError();
        })

    })

    describe("validateJobData", () => {

        const ImportTypeMetadata = {
            "keys": [
                "Version",
                "Date",
                "Item"
            ],
            "columns": [
                { "columnName": "Version" },
                { "columnName": "Date" },
                { "columnName": "Item" },
                { "columnName": "Price" }
            ]
        }

        test("Validates that data is correct", async () => {

            const errors = DataImportServiceApi.INSTANCE.validateJobData(getMockedRows(), ImportTypeMetadata)

            expect(errors.length).toEqual(0)
        })

        test("Validates that key dimension is missing from data", async () => {
            const mockData = [
                ["Version", "Item", "Price"],
                ["public.Actual", "Water", "2"],
            ]

            const errors = DataImportServiceApi.INSTANCE.validateJobData(mockData, ImportTypeMetadata)

            expect(errors.length).toEqual(1)
            expect(errors[0]).toEqual("The key dimension - Date has no value")
        });

        test("Validates that mappings correspond to real columns", async () => {
            DataImportServiceApi.INSTANCE.setMappings({
                "InvalidMapping": "invalidMapping"
            })
            const errors = DataImportServiceApi.INSTANCE.validateJobData(getMockedRows(), ImportTypeMetadata)

            expect(errors.length).toEqual(1)
            expect(errors[0]).toEqual("The mapping InvalidMapping to invalidMapping is not valid. Please contact an administrator to fix the mappings settings.")
        });


        test("Validates that data contains no extra columns", async () => {
            const mockData = [
                ["Version", "Item", "Date", "Price", "ExtraColumn"],
                ["public.Actual", "Water", "202205", "2", "ExtraValue"]
            ]
            const errors = DataImportServiceApi.INSTANCE.validateJobData(mockData, ImportTypeMetadata)

            expect(errors.length).toEqual(1)
            expect(errors[0]).toEqual("Data contains unknown column - ExtraColumn")
        });

    })

    describe("_getHeaderRow", () => {
        test("Returns header row from CSV Data", async () => {
            const header = DataImportServiceApi.INSTANCE._getHeaderRow(getMockedRows())

            expect(header).toEqual(getMockedRows()[0])
        })

        test("Fails with incompatible Pivot Settings", async () => {
            DataImportServiceApi.INSTANCE.setJobSettings({
                pivotOptions: {
                    pivotKeyName: "mockKey",
                    pivotValueName: "mockValue",
                    pivotColumnStart: 3
                }
            })
            const header = DataImportServiceApi.INSTANCE._getHeaderRow([["Version", "Item"]])

            expect(header[0]).toEqual("The data should contain at least 3 columns in order to support pivot import settings, found only 2")
        })

    })

    describe("validateVersionExistsInDataOrSettings", () => {
        test("Returns true when version exists in header columns", async () => {
            const result = DataImportServiceApi.INSTANCE.validateVersionExistsInDataOrSettings(getMockedRows())

            expect(result).toBeTruthy()
        })

        test("Returns false when version is not in header", async () => {
            const result = DataImportServiceApi.INSTANCE.validateVersionExistsInDataOrSettings([["Price", "Item"]])

            expect(result).toBeFalsy()
        })

        test("Returns true when version is specified as PivotKey", async () => {
            DataImportServiceApi.INSTANCE.setJobSettings({
                pivotOptions: {
                    pivotKeyName: "Version",
                    pivotValueName: "mockValue",
                    pivotColumnStart: 3
                }
            })
            const result = DataImportServiceApi.INSTANCE.validateVersionExistsInDataOrSettings([["Price", "Item"]])

            expect(result).toBeTruthy()
        })

    })

    describe("handleJsonError", () => {

        test("Successfully adds error to error responses", async () => {
            const response = new Response(
                "{\"error\": \"mockError\", \"code\": \"mockCode\"}", {
                status: 500,
                statusText: "Error",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            DataImportServiceApi.INSTANCE["resultObj"] = {
                errorResponses: []
            };

            await DataImportServiceApi.INSTANCE.handleJsonError(response);

            const resultObj = DataImportServiceApi.INSTANCE["resultObj"];

            expect(resultObj.errorResponses.length).toBe(1);
        })

        test("Fails to add error if the response is not json", async () => {
            const response = new Response(
                "{\"error\": \"mockError\", \"code\": \"mockCode\"}", {
                status: 500,
                statusText: "Error",
                headers: {
                    "Content-Type": "application/csv"
                }
            });

            DataImportServiceApi.INSTANCE["resultObj"] = {
                errorResponses: []
            };

            await DataImportServiceApi.INSTANCE.handleJsonError(response);

            const resultObj = DataImportServiceApi.INSTANCE["resultObj"];

            expect(resultObj.errorResponses.length).toBe(0);
        })
    })

    test("convertDISInvalidRowsToCSV", async () => {

        const invalidRows = [{
            row: "2.00,Coffee",
            reason: "mockReason"
        }, {
            row: "1.50,Tea",
            reason: "mockReason"
        }]

        const result = DataImportServiceApi.INSTANCE.convertDISInvalidRowsToCSV(invalidRows)

        expect(result).toEqual(["2.00,Coffee,mockReason", "1.50,Tea,mockReason"])
    })

    test("convertDMInvalidRowsToCSV", async () => {

        const invalidRows =
        {
            failedRows: [{
                Price: "2.00",
                Item: "Coffee",
                _REJECTION_REASON: "mockReason"
            }, {
                Price: "1.50",
                Item: "Tea",
                _REJECTION_REASON: "mockReason"
            }]
        }

        const result = DataImportServiceApi.INSTANCE.convertDMInvalidRowsToCSV(invalidRows)

        expect(result).toEqual(["2.00,Coffee,mockReason", "1.50,Tea,mockReason"])
    })

    const getSuccessfulResponse = (body) => {
        body = body || "{}"
        return new Response(
            body, {
            status: 200,
            statusText: "OK",
            headers: {
                "x-csrf-token": "mockCsrf"
            },
        });
    };

    const getNegativeResponse = (body) => {
        body = body || "{}"
        return new Response(
            body, {
            status: 500,
            statusText: "Error"
        });
    };

    const getMockedRows = () => {
        return [
            ["Version", "Item", "Date", "Price"],
            ["public.Actual", "Water", "202205", "2"],
            ["public.Actual", "Coffee", "202206", "3"],
            ["public.Actual", "Cola", "202206", "2"],
        ];
    }

})
