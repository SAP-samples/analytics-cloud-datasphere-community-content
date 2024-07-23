import Popover from "sap/m/Popover";
import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import Button from "sap/m/Button";
import Fragment from "sap/ui/core/Fragment";
import {MOVIEMODEL} from "../model/movie";
import {CAPMODEL} from "../model/cap";
import {STANDARDMODEL} from "../model/standard";
import {EXPERTMODEL} from "../model/expert";
import MessageToast from "sap/m/MessageToast";

/**
 * @namespace ui.controller
 */
export default class App extends BaseController {
    private createGetHelpPopover: Popover;
	private createGetScenariosPopover: Popover;
    private observer: PerformanceObserver;

    public onInit(): void {
        // apply content density mode to root view
        this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        // navigate to standard view on page reload
        this.observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.type === "reload") {
									this.navToMain();
                }
            });
        });
        this.observer.observe({ type: "navigation", buffered: true });
    }

	public onNavButtonPress(): void {
		this.navToMain();
	}

	public navToMain(): void {
		const localModel: JSONModel = this.getModel("suggestedQuestions") as JSONModel;
		localModel.setProperty("/scenario",{})
		localModel.setProperty("/version","")
		localModel.setProperty("/scenario/promptChain", "");
		this.navTo("main");
	}

	public onNavToScenarioPress(event: Event): void {
		const localModel: JSONModel = this.getModel("suggestedQuestions") as JSONModel;
		const elemId: string = event.getSource().getId();
		if (elemId.includes("movie")) {
			localModel.setProperty("/scenario", JSON.parse(JSON.stringify(MOVIEMODEL)));
		} else if (elemId.includes("CAP")) {
			localModel.setProperty("/scenario", JSON.parse(JSON.stringify(CAPMODEL)));
		}
		this.resetViewModel();
		this.onNavToStandardModePress();
	}

	public async resetViewModel(): void {
		const localModel: JSONModel = this.getModel("suggestedQuestions") as JSONModel;
		await localModel.setProperty("/standard", JSON.parse(JSON.stringify(STANDARDMODEL)));
		await localModel.setProperty("/expert", JSON.parse(JSON.stringify(EXPERTMODEL)));
	}
    public onNavToStandardModePress(): void {
			const localModel: JSONModel = this.getModel("suggestedQuestions") as JSONModel;
			localModel.setProperty("/scenario/promptChain", "");
        this.navTo('standard');
        this.resetGraph();
    }
    public onNavToExpertModePress(): void {
			const localModel: JSONModel = this.getModel("suggestedQuestions") as JSONModel;
			localModel.setProperty("/scenario/promptChain", "");
        this.navTo('expert');
        this.resetGraph();
    }

    public async onOpenHelpButtonPress(event: Event): Promise<void> {
        if (!this.createGetHelpPopover) {
            await this.initCreateGetHelpPopover();
        }
        // this.createNewGroundingDialog.setModel("TODO");
        const helpButton: Button = event.getSource();
        this.createGetHelpPopover.openBy(helpButton);
        /** Once the grounding has been created and stored, its metadata need to
         * be added to the model to update the list of available groundings */
    }

    public async initCreateGetHelpPopover(): Promise<void> {
        this.createGetHelpPopover = (await Fragment.load({
            id: "getHelpPopover",
            name: "ai.ui.view.GetHelpPopover",
            controller: this
        })) as Popover;
        const popover = this.createGetHelpPopover as Popover;
        this.getView().addDependent(this.createGetHelpPopover);
    }

	public async initCreateGetScenariosPopover(): Promise<void> {
		this.createGetScenariosPopover = (await Fragment.load({
			id: "getScenariosPopover",
			name: "ai.ui.view.GetScenariosPopover",
			controller: this
		})) as Popover;
		const popover = this.createGetScenariosPopover as Popover;
		this.getView().addDependent(this.createGetScenariosPopover);
	}
}
