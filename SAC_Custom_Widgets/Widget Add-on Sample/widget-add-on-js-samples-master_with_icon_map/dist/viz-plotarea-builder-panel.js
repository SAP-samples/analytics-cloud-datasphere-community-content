(function(){
    const customIconTableTemplate = document.createElement('template');
    customIconTableTemplate.innerHTML = `
        <style>
            :host {
                display: block;
            }
        </style>
        <fieldset>
            <legend>Custom Icons</legend>
            <table>
            </table>
        </fieldset>
    `;

    const customIconRowTemplate = document.createElement('template');
    customIconRowTemplate.innerHTML = `
        <tr class="custom-icon-row">
            <td>
                <input class="custom-icon-name" type="text" size="20">
            </td>
            <td>
                <input class="custom-icon-url" type="text" size="30">
            </td>
            <td>
                <button class="custom-icon-remove-btn">-</button>
            </td>
        </tr>
    `;

    class CustomIconTable extends HTMLElement {
        constructor() {
            super();
            this._shadowRoot = this.attachShadow({ mode: 'open' });
            const templateNode = customIconTableTemplate.content.cloneNode(true);
            this._shadowRoot.appendChild(templateNode);
            this._customIconTable = this._shadowRoot.querySelector('table');
        }

        _createCustomIconRow(
            iconName = '',
            iconUrl = ''
        ) {
            const templateNode = customIconRowTemplate.content.cloneNode(true);
            const customIconRow = templateNode.querySelector('tr');
            const customIconNameEl = templateNode.querySelector('.custom-icon-name');
            const customIconUrlEl = templateNode.querySelector('.custom-icon-url');
            const removeCustomIconBtn = templateNode.querySelector('.custom-icon-remove-btn');

            const dispatchChangeEvent = (e) => {
                e.preventDefault();
                if (customIconNameEl.value && customIconUrlEl.value) {
                    this.dispatchEvent(new Event('change'));
                }
            }

            if (iconName) {
                customIconNameEl.value = iconName;
            }

            if (iconUrl) {
                customIconUrlEl.value = iconUrl;
            }

            customIconNameEl.addEventListener('change', dispatchChangeEvent);
            customIconUrlEl.addEventListener('change', dispatchChangeEvent);
            removeCustomIconBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this._customIconTable.removeChild(customIconRow);
                this.dispatchEvent(new Event('change'));
            });

            this._customIconTable.appendChild(customIconRow);
        }

        get value() {
            const customIconRows = this._customIconTable.querySelectorAll('.custom-icon-row');
            return Array.from(customIconRows).reduce((map, row) => {
                const iconName = row.querySelector('.custom-icon-name').value;
                const iconUrl = row.querySelector('.custom-icon-url').value;
                if (iconName && iconUrl) {
                    map[iconName] = (iconUrl || '').trim();
                }
                return map;
            }, {});
        }

        set value(value) {
            this._customIconTable.replaceChildren([]);
            Object.entries((value || {})).forEach(([iconName, iconUrl]) => {
                this._createCustomIconRow(iconName, iconUrl);
            });
            this._createCustomIconRow();
        }
    }

    customElements.define('custom-icon-table', CustomIconTable);

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
            </fieldset>
            <custom-icon-table id="bps_custom_icon_table"></custom-icon-table>
            <input type="submit" style="display:none;">
        </form>

        <style>
        :host {
            display: block;
            padding: 1em 1em 1em 1em;
        }
        custom-icon-table {
            margin-top: 30px;
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
            this._shadowRoot.getElementById('bps_custom_icon_table').addEventListener('change', this._submit.bind(this));
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
                            customIconMap: this.customIconMap,
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

        set customIconMap(value) {
            (this._shadowRoot.getElementById('bps_custom_icon_table')).value = value;
        }

        get customIconMap() {
            return (this._shadowRoot.getElementById('bps_custom_icon_table')).value;
        }
    }

    customElements.define("viz-plotarea-build", VizPlotareaBuilderPanel);
})();
