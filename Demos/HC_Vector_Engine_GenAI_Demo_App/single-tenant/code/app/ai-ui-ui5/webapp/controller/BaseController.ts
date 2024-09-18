import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import AppComponent from "../Component";
import Model from "sap/ui/model/Model";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Router from "sap/ui/core/routing/Router";
import History from "sap/ui/core/routing/History";
import Dialog from "sap/m/Dialog";
import Text from "sap/m/Text";
import Button from "sap/m/Button";
import JSONModel from "sap/ui/model/json/JSONModel";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import OperationMode from "sap/ui/model/odata/OperationMode";
import Fragment from "sap/ui/core/Fragment";
import {INITIAL_GRAPH} from "../model/graphModel";
import MessageStrip from "sap/m/MessageStrip";
import {ButtonType, DialogType } from "sap/m/library";
import { ValueState } from "sap/ui/core/library";
import Table, { Table$CellClickEvent } from "sap/ui/table/Table";
import Column from "sap/ui/table/Column";
import BusyIndicator from "sap/m/BusyIndicator";
import formatter from "../model/formatter";
import Popover from "sap/m/Popover";
import ExpandableText from "sap/m/ExpandableText";
import Sorter from "sap/ui/model/Sorter";


export const CAP_BASE_URL = "api/odata/v4/reference-documents";
export const CAP_BASE_MOVIE_URL: string = "movie-api/odata/v4/movies";

/**
 * @namespace ui.controller
 */
export default abstract class BaseController extends Controller {
	private createGetLinePopover: Popover;
	private showTableCellContentDialog: Dialog;
	private oErrorMessageDialog: Dialog;
	private resourceBundle: ResourceBundle;
	public controller: AbortController;
	public signal: AbortSignal;
	public movieListDialog: Dialog;
	public graphObjects: any = {
		naturalPromptDone: {
			"node": {
				"key": "naturalPrompt"
			}
		},
		embeddingDone: {
			"node": {
				"key": "embedPrompt"
			},
			"line": {
				"from": "naturalPrompt",
				"to": "embedPrompt"
			}
		},
		semanticSearchDone: {
			"node": {
				"key": "semanticSearch"
			},
			"line": {
				"from": "embedPrompt",
				"to": "semanticSearch"
			},
			"group": {
				"key": "ragGroup"
			}
		},
		ragDone: {
			"node": {
				"key": "llm"
			},
			"line": {
				"from": "semanticSearch",
				"to": "llm"
			},
			"group": {
				"key": "llmGroup"
			}
		},
		defaultLlmDone: {
			"node": {
				"key": "llm"
			},
			"group": {
				"key": "llmGroup"
			},
		},
		responseDisplayed: {
			"node": {
				"key": "response"
			},
			"line": {
				"from": "llm",
				"to": "response"
			},
		}
	};

	public onInit(): void {
		// const model: JSONModel = new JSONModel("../model/suggestedQuestions.json");
		const model: JSONModel = this.getModel("suggestedQuestions") as JSONModel;
		this.setModel(model, 'suggestedQuestions');
	}

	public async onInfoMaterialSelect(event: Event): Promise<void> {
		const modelPath = event.getSource().getBindingContextPath()
		const localModel: JSONModel = this.getModel("suggestedQuestions") as JSONModel;
		const url = localModel.getProperty(modelPath).url
		window.open(url, '_blank');
	}

	/**
	 * Convenience method for accessing the component of the controller's view.
	 * @returns The component of the controller's view
	 */
	public getOwnerComponent(): AppComponent {
		return super.getOwnerComponent() as AppComponent;
	}

	/**
	 * Convenience method to get the components' router instance.
	 * @returns The router instance
	 */
	public getRouter(): Router {
		return UIComponent.getRouterFor(this);
	}

	/**
	 * Convenience method for getting the i18n resource bundle of the component.
	 * @returns The i18n resource bundle of the component
	 */
	private getResourceBundle(): ResourceBundle {
		const oModel: ResourceModel = this.getOwnerComponent().getModel("i18n") as ResourceModel;
		return oModel.getResourceBundle() as ResourceBundle;
	}

	public getText(sKey: string, aArgs?: any[], bIgnoreKeyFallback?: boolean): string {
		if (!this.resourceBundle) {
			this.resourceBundle = this.getResourceBundle();
		}
		return this.resourceBundle.getText(sKey, aArgs, bIgnoreKeyFallback);
	}

	/**
	 * Convenience method for getting the view model by name in every controller of the application.
	 * @param [sName] The model name
	 * @returns The model instance
	 */
	public getModel(sName?: string): Model {
		return this.getView().getModel(sName);
	}

	public async onPromptSelect(event: Event, modelName: string, listPath: string, propertyPath: string): Promise<void> {
		const localModel: JSONModel = this.getModel(modelName) as JSONModel;
		const source = event.getSource();
		const selectedIndex: number = +source.getContent()[0].getId().split("-").at(-1);
		const labelText: string = localModel.getProperty(listPath)[selectedIndex].label
		localModel.setProperty(propertyPath, labelText);

	}

	/**
	 * Convenience method for setting the view model in every controller of the application.
	 * @param oModel The model instance
	 * @param [sName] The model name
	 * @returns The current base controller instance
	 */
	public setModel(oModel: Model, sName?: string): BaseController {
		this.getView().setModel(oModel, sName);
		return this;
	}

	/**
	 * Convenience method for triggering the navigation to a specific target.
	 * @public
	 * @param sName Target name
	 * @param [oParameters] Navigation parameters
	 * @param [bReplace] Defines if the hash should be replaced (no browser history entry) or set (browser history entry)
	 */
	public navTo(sName: string, oParameters?: object, bReplace?: boolean): void {
		const localModel: JSONModel = this.getModel("suggestedQuestions") as JSONModel;
		const route = sName[0].toUpperCase() + sName.slice(1);
		if (route !== "Main") {
			localModel.setProperty("/version", route);
		}
		this.getRouter().navTo(sName, oParameters, undefined, bReplace);
	}

	/**
	 * Convenience event handler for navigating back.
	 * It there is a history entry we go one step back in the browser history
	 * If not, it will replace the current entry of the browser history with the main route.
	 */
	public onNavBack(): void {
		const sPreviousHash = History.getInstance().getPreviousHash();
		if (sPreviousHash !== undefined) {
			window.history.go(-1);
		} else {
			this.getRouter().navTo("main", {}, undefined, true);
		}
	}

	/* To open a generic message dialog */
	public openMessageDialog(title: string, body: string) {
		const content = new Text({text: body});
		content.addStyleClass("sapUiTinyMarginTop");
		content.addStyleClass("sapUiSmallMarginBeginEnd");

		const dialog = new Dialog({title: title, content: content, contentWidth: "40%"});
		const closeButton = new Button({text: this.getText("buttons.close"), press: () => dialog.close()});
		dialog.setBeginButton(closeButton);
		dialog.open();
	}

	public async onOpenMovieList(event: Event): Promise<void> {
		if (!this.movieListDialog) {
			const localModel: JSONModel = this.getModel("suggestedQuestions") as JSONModel;
			const version = localModel.getProperty("/version")
			await this.initMovieListDialog(version);
		} else {
			// we need to add the table again because on each dialog close, we destroy its content
			this.movieListDialog.addContent(this.createDialogContent());
		}
		// this.createNewGroundingDialog.setModel("TODO");
		this.movieListDialog.open();
		/** Once the grounding has been created and stored, its metadata need to
		 * be added to the model to update the list of available groundings */
	}

	public async initMovieListDialog(version: string): Promise<void> {
		this.movieListDialog = (await Fragment.load({
			id: "MovieListDialog" + version,
			name: "ai.ui.view.MovieListDialog",
			controller: this
		})) as Dialog;
		const dialog = this.movieListDialog as Dialog;
		this.getView().addDependent(this.movieListDialog);
		const closeButton = new Button({
			text: this.getText("buttons.close"),
			press: () => {
				dialog.destroyContent();
				dialog.close();
			}});
		dialog.setEndButton(closeButton);

		dialog.addContent(this.createDialogContent());
		dialog.setModel(new ODataModel({serviceUrl: `${CAP_BASE_MOVIE_URL}/`, operationMode: "Server"}));
	}

	public createDialogContent(): Table {
		const scenario = this.getModel("suggestedQuestions").getProperty("/scenario/name");
		const pathForTable = (scenario === "MOVIES") ? "/Movies": "/CapDocs";
		const labelForDescription = (scenario === "MOVIES") ? "Plot": "Documentation";
		const oSorter = (scenario === "MOVIES") ? new Sorter('releaseDate') : new Sorter('title');
		const oFirstVisibleRow = (scenario === "MOVIES") ? 42 : 0;
		const table = new Table({
			selectionMode: 'None',
			alternateRowColors: true,
			enableSelectAll: false,
			enableCellFilter: true,
			threshold: 15,
			enableBusyIndicator: true,
			ariaLabelledBy: ["Title"],
			rows: {
				path: pathForTable,
				parameters: {operationMode: 'Server'},
				sorter: oSorter,
			},
			firstVisibleRow: oFirstVisibleRow,
			visibleRowCountMode: "Auto",
			minAutoRowCount: 15,
			noData: new BusyIndicator({ })
		});
		// define title column
		const titleColumn = new Column({
			sortProperty: "title",
			filterProperty: "title",
			autoResizable: true,
			width: "auto"
		});
		titleColumn.setLabel("Title");
		titleColumn.setTemplate(new Text({ text: "{title}", wrapping: false}));
		// define releaseDate column
		const releaseDateColumn = new Column({
			sortProperty: "releaseDate",
			filterProperty: "releaseDate",
			autoResizable: true,
			width: "auto"
		});
		releaseDateColumn.setLabel("Release Date");
		const txt = new Text().bindText({path:"releaseDate", formatter: formatter.formatDate});
		releaseDateColumn.setTemplate(txt);
		// define title column
		const textColumn = new Column({
			filterProperty: "text",
			autoResizable: true,
			width: "60%"
		});
		textColumn.setLabel(labelForDescription);
		textColumn.setTemplate(new ExpandableText({ text: "{text}", overflowMode: "Popover"}));
		// add all columns to the table
		table.addColumn(titleColumn);
		table.addColumn(releaseDateColumn);
		table.addColumn(textColumn);

		return table;
	}

	public resetGraph(): void {
		const localModel: JSONModel = this.getModel("suggestedQuestions") as JSONModel;
		localModel.setProperty("/applicationFlowGraph", JSON.parse(JSON.stringify(INITIAL_GRAPH)));
		localModel.setProperty("/inputForLLM", "")
		localModel.setProperty("/promptChain", {})
	}

	public updateGraph(graphObjectKeys: any, newStatus: string, duration?: number): void {
		const localModel: JSONModel = this.getModel("suggestedQuestions") as JSONModel;
		const graphDefinition: object = localModel.getProperty("/applicationFlowGraph");
		if (graphObjectKeys.node) {
			graphDefinition.nodes.find((node: { key: any; status: string; attributes: any; }) => {
				if (node.key === graphObjectKeys.node.key) {
					node.status = newStatus;
					if (duration) {
						node.attributes[0].value = (Math.round(duration * 100) / 100).toFixed(2) + 's';
					}
				}
			});
		}
		if (graphObjectKeys.line) {
			graphDefinition.lines.find((line: { from: any; to: any; status: string; }) => {
				if (line.from === graphObjectKeys.line.from && line.to === graphObjectKeys.line.to) {
					line.status = newStatus;
				}
			});
		}
		if (graphObjectKeys.group) {
			graphDefinition.groups.forEach((group, index, array) => {
				if (group.key === graphObjectKeys.group.key) {
					group.status = newStatus;
					array[index] = group;
				}
			});
		}
		localModel.setProperty("/applicationFlowGraph", graphDefinition);
	}

	public async onCancelPress(event: Event): Promise<void> {
		this.controller.abort();
		const localModel: JSONModel = this.getModel("suggestedQuestions") as JSONModel;
		await localModel.setProperty("/standard/llmAnswer", "");
		console.log("request aborted");
		this.resetGraph();
	}

	public toggleLLMNodeBusy(isBusy: boolean) {
		const localModel: JSONModel = this.getModel("suggestedQuestions") as JSONModel;
		let nodesDefinition = localModel.getProperty('/applicationFlowGraph/nodes');
		nodesDefinition.find((g: { key: string; busy: boolean; }) => {
			if (g.key === 'llm') g.busy = isBusy
		});
		localModel.setProperty('/applicationFlowGraph/nodes', nodesDefinition);
	}

	public toggleRagGroupBusy(isBusy: boolean) {
		const localModel: JSONModel = this.getModel("suggestedQuestions") as JSONModel;
		let groupsDefinition = localModel.getProperty('/applicationFlowGraph/groups');
		groupsDefinition.find((g: { key: string; busy: boolean; }) => {
			if (g.key === 'ragGroup') g.busy = isBusy
		});
		localModel.setProperty('/applicationFlowGraph/groups', groupsDefinition);
	}

	public async callBackendEndpoint(endpoint: string, payload: any, httpHeaders: any) {
		this.controller = new AbortController();
		this.signal = this.controller.signal;
		const response = await fetch(`${CAP_BASE_MOVIE_URL}/${endpoint}`, {
			signal: this.signal,
			method: "POST",
			headers: {
				"X-CSRF-Token": httpHeaders["X-CSRF-Token"],
				"Content-Type": "application/json"
			},
			body: JSON.stringify(payload)
		}).then(async response => {
			//throw new Error(endpoint);
			if (!response.ok) {
				const error :Error = JSON.parse(await response.text()).error;
				console.log("xxxxx", error.message);
				throw error;
			}
			return response.json();
		}).catch(e => {
			console.log("catching error",e)
			if (!this.oErrorMessageDialog) {
				this.oErrorMessageDialog = new Dialog({
					type: DialogType.Message,
					title: "Error",
					state: ValueState.Error,
					content: new Text({ text: e.message }),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "Close",
						press: function () {
							this.oErrorMessageDialog.close();
						}.bind(this)
					})
				});
			}
			this.oErrorMessageDialog.open();
			throw new Error(endpoint);
		})
		return response;
	}

	public greyOutGraphObject(graphObject: any, isWithRag: boolean, propertyToCheck: string, green?: boolean): any {
		if (green) {
			if (graphObject[propertyToCheck] && graphObject[propertyToCheck] === "ragGroup") {
				graphObject.status = "Success"
			}
		} else {
			if (isWithRag) {
				if (graphObject[propertyToCheck] && graphObject[propertyToCheck] === "ragGroup") {
					graphObject.status = "CustomStandard"
				}
			} else {
				if (graphObject[propertyToCheck] && graphObject[propertyToCheck] === "ragGroup") {
					graphObject.status = "CustomInactive"
				}
			}
		}

		return graphObject;
	}

	public setRagGroupColor(isWithRag: boolean, green?: boolean): void {
		const localModel: JSONModel = this.getModel("suggestedQuestions") as JSONModel;
		const graphDefinition: object = localModel.getProperty("/applicationFlowGraph");
		const colorAdjustedNodes = graphDefinition.nodes.map((node: any) => this.greyOutGraphObject(node, isWithRag, "group", green));
		const colorAdjustedLines = graphDefinition.lines.map((line: any) => this.greyOutGraphObject(line, isWithRag, "group", green));
		const colorAdjustedGroups = graphDefinition.groups.map((group: any) => this.greyOutGraphObject(group, isWithRag, "key", green));
		graphDefinition.nodes = colorAdjustedNodes;
		graphDefinition.lines = colorAdjustedLines;
		graphDefinition.groups = colorAdjustedGroups;
		localModel.setProperty("/applicationFlowGraph", graphDefinition);
	}

	public async onLinePress(event: Event): Promise<void> {
		// Prevents render a default tooltip
		const localModel: JSONModel = this.getModel("suggestedQuestions") as JSONModel;
		const scenario = localModel.getProperty("/scenario/name");
		const version = localModel.getProperty("/version");
		let question;
		const rag = localModel.getProperty("/promptChain/input_documents") ? true : false;
		if (version === "Standard") {
			question = localModel.getProperty("/standard/llmWithRagPrompt");
		} else if (version === "Expert") {
			question = localModel.getProperty("/expert/llmWithRagPrompt");
		}
		const oDataModel = this.getModel("movie-api") as ODataModel;
		const httpHeaders: any = oDataModel.getHttpHeaders();
		const response = await fetch(`${CAP_BASE_MOVIE_URL}/ScenarioConfig?$filter=scenario eq '${scenario}'`, {
			method: "GET",
			headers: {
				"X-CSRF-Token": httpHeaders["X-CSRF-Token"],
				"Content-Type": "application/json"
			}
		});
		const result = await response.json();
		let inputForLLM;
		if (rag) {
			const message = result.value[0].promptTemplateWithRAG;
			const movies = localModel.getProperty("/promptChain/input_documents");
			inputForLLM = message.replace("{context}", movies.map(m => {
				return m.pageContent.length > 150 ? m.pageContent.substr(0, 147) + "...\n" : m.pageContent
			}).join("\n"));
		} else {
			inputForLLM = result.value[0].promptTemplateNoRAG;
		}
		inputForLLM += `\n\nUser Question: ${question}`
		localModel.setProperty("/inputForLLM", inputForLLM)
		if (!this.createGetLinePopover) {
			await this.initCreateGetLinePopover();
		}
		const helpButton: Button = event.getSource();
		this.createGetLinePopover.openBy(helpButton);
	}

	public async initCreateGetLinePopover(): Promise<void> {
		this.createGetLinePopover = (await Fragment.load({
			id: "getLinePopover",
			name: "ai.ui.view.GetLinePopover",
			controller: this
		})) as Popover;
		const popover = this.createGetLinePopover as Popover;
		this.getView().addDependent(this.createGetLinePopover);
	}
}
