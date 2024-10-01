export const INITIAL_GRAPH = {
    "nodes": [
        {
            "key": "naturalPrompt",
            "icon": "sap-icon://customer",
            "title": "User input",
            "status": "CustomStandard",
					"enabled": false,
            "attributes": [
                {
                    "label": "Task duration",
                    "value": ""
                }
            ]
        },
        {
            "key": "embedPrompt",
            "icon": "sap-icon://chart-axis",
            "title": "Transform the user input to a vector",
            "group": "ragGroup",
            "status": "CustomInactive",
					"enabled": false,
            "attributes": [
                {
                    "label": "Task duration",
                    "value": ""
                }
            ]
        },
        {
            "key": "semanticSearch",
            "icon": "sap-icon://database",
            "title": "Run vector search in SAP HANA cloud",
            "group": "ragGroup",
            "status": "CustomInactive",
					"enabled": false,
            "attributes": [
                {
                    "label": "Task duration",
                    "value": ""
                }
            ]
        },
        {
            "key": "llm",
            "icon": "sap-icon://ai",
            "title": "Prompt the LLM with the user input",
            "group": "llmGroup",
            "status": "CustomStandard",
            "busy": false,
					"enabled": true,
            "attributes": [
                {
                    "label": "Task duration",
                    "value": ""
                }
            ]
        },
        {
            "key": "response",
            "icon": "sap-icon://goal",
            "title": "Display LLM response",
            "status": "CustomStandard",
					"enabled": false,
            "attributes": [
                {
                    "label": "Task duration",
                    "value": "N/A"
                }
            ]
        }
    ],
    "lines": [
        {
            "from": "naturalPrompt",
            "to": "embedPrompt",
            "group": "ragGroup",
            "status": "CustomInactive",
            "title": "Generate vector from natural language input using LLM"
        },
        {
            "from": "embedPrompt",
            "to": "semanticSearch",
            "group": "ragGroup",
            "status": "CustomInactive",
            "title": "Retrieve results best fitting to natural prompt from HANA Cloud using its Vector Engine"
        },
        {
            "from": "semanticSearch",
            "to": "llm",
            "group": "ragGroup",
            "status": "CustomInactive",
            "title": "Retrieval Augmented Generation"
        },
        {
            "from": "llm",
            "to": "response",
            "group": "llmGroup",
            "status": "CustomStandard",
            "title": "Return response"
        }
    ],
    "groups": [
        {
            "key": "llmGroup",
            "title": "Default LLM",
            "status": "CustomStandard",
            "busy": false
        },
        {
            "key": "ragGroup",
            "title": "Vector Search using SAP HANA Cloud",
            "status": "CustomStandardGroup",
            "busy": false
        }
    ]
}
