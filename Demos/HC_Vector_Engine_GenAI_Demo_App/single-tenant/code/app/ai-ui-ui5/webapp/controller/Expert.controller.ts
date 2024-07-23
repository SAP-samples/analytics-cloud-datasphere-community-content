import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import Event from "sap/ui/base/Event";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";

export const CAP_BASE_MOVIE_URL = "movie-api/odata/v4/movies";
export default class Expert extends BaseController {


	public onInit(): void {
		super.onInit();
	}

	public async onSemanticSearchPromptSelect(event: Event): Promise<void> {
		this.onPromptSelect(event, "suggestedQuestions", "/scenario/semanticSearchQuestions", "/expert/semanticSearchQuestion");
	}
	public async onSubmit(event: Event): Promise<void> {
		this.updateGraph(this.graphObjects.naturalPromptDone, "Success");
		const question: string = event.getSource().getValue();
		const oDataModel = this.getModel("movie-api") as ODataModel;
		const httpHeaders: any = oDataModel.getHttpHeaders();
		const localModel: JSONModel = this.getModel("suggestedQuestions") as JSONModel;
		const existingQuestions = localModel.getProperty("/scenario/semanticSearchQuestions");
		const currentScenario = localModel.getProperty("/scenario/name")
		// as long as the request is running, set the response text field to busy
		await localModel.setProperty("/expert/movieSemanticSearchAnswerListItemIsBusy", true);
		await localModel.setProperty("/expert/movieSemanticSearchAnswerListItemIsExpanded", true);
		await localModel.setProperty("/expert/semanticSearchQuestion", question);

		// add the question to the list of models in case it hasn't been asked before
		if (!existingQuestions.some((q: any) => (q.label === question))) {
			const newQuestion = {
				title: `Question`,
				label: question,
				highlight: "Success",
				index: existingQuestions.length + 1
			};
			existingQuestions.push(newQuestion);
			localModel.setProperty("/questions", existingQuestions);
		}
		this.toggleRagGroupBusy(true);
		try {
			const endpointSemanticSearch = "semanticSearch";
			const payload = {"text": question, scenario: currentScenario};
			const response = await this.callBackendEndpoint(endpointSemanticSearch, payload, httpHeaders);
			const parsedResults = JSON.parse(response.value.result);
			const tableEntries: Array<object> = parsedResults.map((item: any) => {
				return {
					ID: item.ID,
					title: item.title,
					releaseDate: item.releaseDate,
					text: item.text,
					similarity: item.COSINE_SIMILARITY.toString(),
					euclideanDistance: item.EUCLIDEAN_DISTANCE.toString()
				}
			});
			this.updateGraph(this.graphObjects.embeddingDone, "Success", response.value.embeddingDuration);
			this.updateGraph(this.graphObjects.semanticSearchDone, "Success", response.value.databaseDuration);
			localModel.setProperty("/expert/movieSemanticSearchAnswers", tableEntries);
		} catch (error) {
			console.log(error);
			// TODO: update Graph with "error" status in case we reach this code
			this.updateGraph(this.graphObjects.embeddingDone, "Error");
			this.updateGraph(this.graphObjects.semanticSearchDone, "Error");
		} finally {
			this.toggleRagGroupBusy(false);
			await localModel.setProperty("/expert/movieSemanticSearchAnswerListItemIsBusy", false);
			console.log("DONE");
		}
	}

	public async onPromptLlmWithRagSubmit(event: Event): Promise<void> {
		this.controller = new AbortController();
		this.signal = this.controller.signal;
		console.log("onPromptLlmWithRagSubmit")
		const table = this.byId("HanaResultsTable");
		const selectedIndices: number[] = table.getSelectedIndices();
		const selectedMovieIds: string[] = selectedIndices.map(index => table.getContextByIndex(index).getObject().ID);
		const question: string = event.getSource().getValue();
		const oDataModel = this.getModel("movie-api") as ODataModel;
		const httpHeaders: any = oDataModel.getHttpHeaders();
		const localModel: JSONModel = this.getModel("suggestedQuestions") as JSONModel;
		const modelName = localModel.getProperty("/scenario/expert/selectedModel");
		const currentScenario = localModel.getProperty("/scenario/name");
		const modelValue = localModel
			.getProperty("/models")
			.find((m: { name: string; description: string; "icon": string; "value": string }) => m.name === modelName)
			.value
		// as long as the request is running, set the response text field to busy
		await localModel.setProperty("/expert/ragAnswerListItemIsBusy", true);
		await localModel.setProperty("/expert/ragAnswerPanelIsExpanded", true);
		await localModel.setProperty("/expert/llmWithRagPrompt", question);
		const withRag: boolean = !!(selectedMovieIds.length > 0);
		if (!withRag) {
			this.setRagGroupColor(withRag);
		} else {
			this.setRagGroupColor(withRag, true);
		}
		const existingQuestions = localModel.getProperty("/scenario/movieLLMWithRagPrompts")
		// add the question to the list of models in case it hasn't been asked before
		if (!existingQuestions.some((q: any) => (q.label === question))) {
			const newQuestion = {
				title: `Question`,
				label: question,
				highlight: "Success",
				index: existingQuestions.length + 1
			};
			existingQuestions.push(newQuestion);
			localModel.setProperty("/scenario/movieLLMWithRagPrompts", existingQuestions);
		}

		try {
			this.toggleLLMNodeBusy(true);
			const payload = {
				"text": question,
				"rag": withRag,
				"model": modelValue,
				"ids": selectedMovieIds,
				"scenario": currentScenario
			};
			const endpointGenerateResponse = "generateFullRagResponseStep3";
			const response = await this.callBackendEndpoint(endpointGenerateResponse, payload, httpHeaders);
			localModel.setProperty("/promptChain", response.value.chainCallOptions);
			const parsedResults = response.value.result.replaceAll("<","< ");
			const parsedDuration = response.value.duration;
			localModel.setProperty("/expert/llmAnswer", parsedResults);
			this.updateGraph(this.graphObjects.ragDone, "Success", parsedDuration);
			await this.updateGraph(this.graphObjects.responseDisplayed, "Success");
		} catch (error) {
			console.log(error);
			// TODO: update Graph with "error" status in case we reach this code
			this.updateGraph(this.graphObjects.ragDone, "Error");
			this.updateGraph(this.graphObjects.responseDisplayed, "Error");
		} finally {
			this.toggleLLMNodeBusy(false);
			await localModel.setProperty("/expert/ragAnswerListItemIsBusy", false);
			console.log("DONE");
		}
	}

	public async onDeletePromptPress(event: Event): Promise<void> {
		const selectedItem = event.getParameter("listItem").getId()
		const selectedItemIndex = +selectedItem.split("-").at(-1)
		const localModel: JSONModel = this.getModel("suggestedQuestions") as JSONModel;
		const existingQuestions = localModel.getProperty("/scenario/semanticSearchQuestions");
		existingQuestions.splice(selectedItemIndex, 1)
		existingQuestions.map((q: { index: number; }) => {
			if (q.index > selectedItemIndex) q.index -= 1
		})
		localModel.setProperty("/scenario/semanticSearchQuestions", existingQuestions);
	}

	public async onMovieLLMWithRagPromptSelect(event: Event): Promise<void> {
		this.onPromptSelect(event, "suggestedQuestions", "/scenario/movieLLMWithRagPrompts", "/expert/llmWithRagPrompt");
	}

	public async onMovieLLMWithRagPromptDeletePress(event: Event): Promise<void> {
		const selectedItem = event.getParameter("listItem").getId()
		const selectedItemIndex = +selectedItem.split("-").at(-1)
		const localModel: JSONModel = this.getModel("suggestedQuestions") as JSONModel;
		const existingQuestions = localModel.getProperty("/scenario/movieLLMWithRagPrompts");
		existingQuestions.splice(selectedItemIndex, 1)
		existingQuestions.map((q: { index: number; }) => {
			if (q.index > selectedItemIndex) q.index -= 1
		})
		localModel.setProperty("/scenario/movieLLMWithRagPrompts", existingQuestions);
	}
}
