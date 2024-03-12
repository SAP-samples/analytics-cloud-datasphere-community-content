(function(){
    const metricPlotareaFormTemplate = document.createElement("template");
    metricPlotareaFormTemplate.innerHTML = `
        <form id="form">
            <fieldset>
                <legend>Plotarea Properties</legend>
                <table>
                    <tr>
                        <td>Label Color</td>
                        <td><input id="bps_label_color" type="text" size="10" maxlength="10" value="#666"></td>
                    </tr>
                    <tr>
                        <td>Progress Bar Color</td>
                        <td><input id="bps_number_bar_color" type="text" size="10" maxlength="10" value="#488ccc"></td>
                    </tr>
                    <tr>
                        <td>Progress Track Color</td>
                        <td><input id="bps_number_track_color" type="text" size="10" maxlength="10" value="#ddd"></td>
                    </tr>
                    <tr>
                        <td>Max</td>
                        <td><input id="bps_max" type="number" size="10" maxlength="10">Millian</td>
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

    class MetricPlotareaBuilderPanel extends HTMLElement {

        constructor() {
            super();
            this._shadowRoot = this.attachShadow({mode: "open"});
            this._shadowRoot.appendChild(metricPlotareaFormTemplate.content.cloneNode(true));
            this._shadowRoot.getElementById("form").addEventListener("submit", this._submit.bind(this));
            this._shadowRoot.getElementById('bps_label_color').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('bps_number_bar_color').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('bps_number_track_color').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('bps_max').addEventListener('change', this._submit.bind(this));
        }

        _submit(e) {
            e.preventDefault();
            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                    detail: {
                        properties: {
                            labelColor: this.labelColor,
                            numberBarColor: this.numberBarColor,
                            numberTrackColor: this.numberTrackColor,
                            max: this.max,
                        }
                    }
            }));
        }

        set labelColor(value) {
            (this._shadowRoot.getElementById("bps_label_color")).value = value;
        }

        get labelColor() {
            return (this._shadowRoot.getElementById("bps_label_color")).value;
        }

        set numberBarColor(value) {
            (this._shadowRoot.getElementById("bps_number_bar_color")).value = value;
        }

        get numberBarColor() {
            return (this._shadowRoot.getElementById("bps_number_bar_color")).value;
        }

        set numberTrackColor(value) {
            (this._shadowRoot.getElementById("bps_number_track_color")).value = value;
        }

        get numberTrackColor() {
            return (this._shadowRoot.getElementById("bps_number_track_color")).value;
        }

        set max(value) {
            (this._shadowRoot.getElementById("bps_max")).value = value;
        }

        get max() {
            return (this._shadowRoot.getElementById("bps_max")).value;
        }
    }

    customElements.define("viz-metric-plotarea-build", MetricPlotareaBuilderPanel);
})();
