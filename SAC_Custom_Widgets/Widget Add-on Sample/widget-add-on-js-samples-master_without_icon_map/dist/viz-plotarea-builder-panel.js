const plotareaFormTemplate = document.createElement("template");
plotareaFormTemplate.innerHTML = `
    <form id="form">
        <fieldset>
            <legend>Plotarea Properties</legend>
            <table>
                <tr>
                    <td>Rounded Marker</td>
                    <td><input id="bps_rounded" type="checkbox" checked></td>
                </tr>
                <tr id="donutDataLabelRow">
                    <td>Donut Data Label</td>
                    <td><input id="bps_donutDataLabel" type="checkbox" checked></td>
                </tr>
                <tr>
                    <td>Donut Data Label Size</td>
                    <td><input id="bps_donutDataLabelSize" type="number" value="100">%</td>
                </tr>
                <tr>
                    <td>Data Marker Size</td>
                    <td><input id="bps_dataMarkerSize" type="number" value="100">%</td>
                </tr>
                <tr>
                    <td>Axis Label Color</td>
                    <td><input id="bps_axis_label_color" type="text" size="10" maxlength="10" value="#333"></td>
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

class VizPlotareaBuilderPanel extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({mode: "open"});
        this._shadowRoot.appendChild(plotareaFormTemplate.content.cloneNode(true));
        this._shadowRoot.getElementById("form").addEventListener("submit", this._submit.bind(this));
        this._shadowRoot.getElementById('bps_rounded').addEventListener('change', this._submit.bind(this));
        this._shadowRoot.getElementById('bps_donutDataLabel').addEventListener('change', this._submit.bind(this));
        this._shadowRoot.getElementById('bps_donutDataLabelSize').addEventListener('change', this._submit.bind(this));
        this._shadowRoot.getElementById('bps_dataMarkerSize').addEventListener('change', this._submit.bind(this));
        this._shadowRoot.getElementById('bps_axis_label_color').addEventListener('change', this._submit.bind(this));
    }

    _submit(e) {
        e.preventDefault();
        this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties: {
                        rounded: this.rounded,
                        donutDataLabel: this.donutDataLabel,
                        dataMarkerSize: this.dataMarkerSize,
                        axisLabelColor: this.axisLabelColor,
                        donutDataLabelSize: this.donutDataLabelSize,
                    }
                }
        }));
    }

    set rounded(value) {
        (this._shadowRoot.getElementById("bps_rounded")).checked = !!value;
    }

    get rounded() {
        return (this._shadowRoot.getElementById("bps_rounded")).checked;
    }

    set donutDataLabel(value) {
        (this._shadowRoot.getElementById("bps_donutDataLabel")).checked = !!value;
    }

    get donutDataLabel() {
        return (this._shadowRoot.getElementById("bps_donutDataLabel")).checked;
    }

    set donutDataLabelSize(value) {
        (this._shadowRoot.getElementById("bps_donutDataLabelSize")).value = value;
    }

    get donutDataLabelSize() {
        return (this._shadowRoot.getElementById("bps_donutDataLabelSize")).value;
    }

    set dataMarkerSize(value) {
        (this._shadowRoot.getElementById("bps_dataMarkerSize")).value = value;
    }

    get dataMarkerSize() {
        return (this._shadowRoot.getElementById("bps_dataMarkerSize")).value;
    }

    set axisLabelColor(value) {
        (this._shadowRoot.getElementById("bps_axis_label_color")).value = value;
    }

    get axisLabelColor() {
        return (this._shadowRoot.getElementById("bps_axis_label_color")).value;
    }
}

customElements.define("viz-plotarea-build", VizPlotareaBuilderPanel);