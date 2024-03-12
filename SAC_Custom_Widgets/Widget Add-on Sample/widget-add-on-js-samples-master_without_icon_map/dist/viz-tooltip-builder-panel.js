const tooltipFormTemplate = document.createElement("template");
tooltipFormTemplate.innerHTML = `
    <form id="form">
        <fieldset>
            <legend>Tooltip Header Properties</legend>
            <table>
                <tr>
                    <td>Max</td>
                    <td><input id="bps_max" type="number" size="10" maxlength="10">Millian</td>
                </tr>
                <tr>
                    <td>Color</td>
                    <td><input id="bps_color" type="text" size="10" maxlength="10"></td>
                </tr>
            </table>
            <input type="submit" style="display:none;">
        </fieldset>
    </form>
    <style>
    :host {
        display: block;
        padding: 1em 1em 1em 1em;
    }
    </style>
`;

class VizTooltipBuilderPanel extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({mode: "open"});
        this._shadowRoot.appendChild(tooltipFormTemplate.content.cloneNode(true));
        this._shadowRoot.getElementById("form").addEventListener("submit", this._submit.bind(this));
    }

    _submit(e) {
        e.preventDefault();
        this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties: {
                        color: this.color,
                        max: this.max
                    }
                }
        }));
    }

    set color(newColor) {
        (this._shadowRoot.getElementById("bps_color")).value = newColor;
    }

    get color() {
        return (this._shadowRoot.getElementById("bps_color")).value;
    }

    set max(value) {
        (this._shadowRoot.getElementById("bps_max")).value = value;
    }

    get max() {
        return (this._shadowRoot.getElementById("bps_max")).value;
    }
}

customElements.define("viz-tooltip-build", VizTooltipBuilderPanel);