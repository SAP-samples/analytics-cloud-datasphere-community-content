import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import Event from "sap/ui/base/Event";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";

export default class Standard extends BaseController {
    public onInit(): void {
        super.onInit();
    }

    public async onPromptLlmWithRagSubmit(event: Event): Promise<void> {
        this.resetGraph();

        this.controller = new AbortController();
        this.signal = this.controller.signal;
        const localModel: JSONModel = this.getModel("suggestedQuestions") as JSONModel;

        const question: string = localModel.getProperty("/standard/llmWithRagPrompt");
        const oDataModel = this.getModel("movie-api") as ODataModel;
        const httpHeaders: any = oDataModel.getHttpHeaders();

        // as long as the request is running, set the response text field to busy
        await localModel.setProperty("/standard/ragAnswerListItemIsBusy", true);
        await localModel.setProperty("/standard/ragAnswerPanelIsExpanded", true);
        await localModel.setProperty("/standard/llmWithRagPrompt", question);
        const withRag: Boolean = localModel.getProperty("/standard/withRag");
        const existingQuestions = localModel.getProperty("/scenario/prompts");
			const currentScenario = localModel.getProperty("/scenario/name");
			const modelName = localModel.getProperty("/scenario/standard/selectedModel");
			const modelValue = localModel
				.getProperty("/models")
				.find((m: { name: string; description: string; "icon": string; "value": string }) => m.name === modelName)
				.value
			// add the question to the list of models in case it hasn't been asked before
        if (!existingQuestions.some((q: any) => (q.label === question))) {
            const newQuestion = {
                title: `Question`,
                label: question,
                highlight: "Success",
                index: existingQuestions.length + 1
            };
            existingQuestions.push(newQuestion);
            localModel.setProperty("/scenario/prompts", existingQuestions);
        }
        this.updateGraph(this.graphObjects.naturalPromptDone, "Success");
        const endpointFullRAg = "generateFullRagResponse";
        const endpointStep1 = "generateFullRagResponseStep1";
        const endpointStep2 = "generateFullRagResponseStep2";
        const endpointStep3 = "generateFullRagResponseStep3";
        try {
            if (!withRag) {
                this.toggleLLMNodeBusy(true);
                const payload = { "text": question, "scenario": currentScenario, "model": modelValue };
                const response = await this.callBackendEndpoint(endpointFullRAg, payload, httpHeaders);
							localModel.setProperty("/promptChain", response.value.chainCallOptions);
                const llmResults = response.value.result.replaceAll("<","< ");
                const llmDuration = response.value.duration;
                localModel.setProperty("/standard/llmAnswer", llmResults);
                this.updateGraph(this.graphObjects.defaultLlmDone, "Success", llmDuration);
            } else {
                this.toggleRagGroupBusy(true);
                // // Step 1
                const payloadStep1 = { "text": question };
                const responseStep1 = await this.callBackendEndpoint(endpointStep1, payloadStep1, httpHeaders);
                const step1Duration = responseStep1.value.duration;
                const step1Result = responseStep1.value.vector;
                this.updateGraph(this.graphObjects.embeddingDone, "Success", step1Duration);
                // // Step 2
                const payloadStep2 = { "vector": step1Result, "count": 5, scenario: currentScenario };

                const responseStep2 = await this.callBackendEndpoint(endpointStep2, payloadStep2, httpHeaders);
                const step2Duration = responseStep2.value.duration;
                const step2Result = responseStep2.value.movies;
                this.updateGraph(this.graphObjects.semanticSearchDone, "Success", step2Duration);
                this.toggleRagGroupBusy(false);
                // // Step 3
                this.toggleLLMNodeBusy(true);
                const payloadStep3 = {
                    "text": question,
                    rag: withRag,
                    ids: step2Result.map((movie: { ID: any; }) => movie.ID),
										scenario: currentScenario,
									model: modelValue
                };
                const responseStep3 = await this.callBackendEndpoint(endpointStep3, payloadStep3, httpHeaders);
							localModel.setProperty("/promptChain", responseStep3.value.chainCallOptions);
							const step3Duration = responseStep3.value.duration;
                const step3Result = responseStep3.value.result.replaceAll("<", "< ");
                localModel.setProperty("/standard/llmAnswer", step3Result);
                this.updateGraph(this.graphObjects.ragDone, "Success", step3Duration);
            }
            await this.updateGraph(this.graphObjects.responseDisplayed, "Success");
        } catch (error) {
            console.log(error);
            if (error.message === endpointFullRAg) {
                this.updateGraph(this.graphObjects.defaultLlmDone, "Error");
            } else {
                if (error.message === endpointStep1) {
                    this.updateGraph(this.graphObjects.embeddingDone, "Error");
                    this.updateGraph(this.graphObjects.semanticSearchDone, "Error");
                    this.updateGraph(this.graphObjects.ragDone, "Error");
                }
                if (error.message === endpointStep2) {
                    this.updateGraph(this.graphObjects.semanticSearchDone, "Error");
                    this.updateGraph(this.graphObjects.ragDone, "Error");
                }
                if (error.message === endpointStep3) {
                    this.updateGraph(this.graphObjects.ragDone, "Error");
                }
            }
            await this.updateGraph(this.graphObjects.responseDisplayed, "Error");
            // TODO: update Graph with "error" status in case we reach this code
        } finally {
            await localModel.setProperty("/standard/ragAnswerListItemIsBusy", false);
            this.toggleRagGroupBusy(false);
            this.toggleLLMNodeBusy(false);
            console.log("DONE");
        }
    }

    public async onMovieLLMWithRagPromptSelect(event: Event): Promise<void> {
        this.onPromptSelect(event, "suggestedQuestions", "/scenario/prompts", "/standard/llmWithRagPrompt");
    }

    public async onStandardPromptDeletePress(event: Event): Promise<void> {
        const selectedItem = event.getParameter("listItem").getId()
        const selectedItemIndex = +selectedItem.split("-").at(-1)
        const localModel: JSONModel = this.getModel("suggestedQuestions") as JSONModel;
        const existingQuestions = localModel.getProperty("/scenario/prompts");
        existingQuestions.splice(selectedItemIndex, 1)
        existingQuestions.map((q: { index: number; }) => { if (q.index > selectedItemIndex) q.index -= 1 })
        localModel.setProperty("/scenario/prompts", existingQuestions);
    }

    public onWithRagToggle(event: Event): void {
        // depending on switch state, grey out the "with RAG" part of the graph, or the "without RAG" part
        this.resetGraph();
        const localModel: JSONModel = this.getModel("suggestedQuestions") as JSONModel;
        const isWithRag: boolean = localModel.getProperty("/standard/withRag");
        this.setRagGroupColor(isWithRag);

    }
}
