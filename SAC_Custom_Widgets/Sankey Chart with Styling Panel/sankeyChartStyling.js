(function() {
    let template = document.createElement("template");
    template.innerHTML = `
      <style>
        .depthSettings {
          margin: 0.5rem 0;
        }

        .depth {
          font-size: 18px;
        }

        .settings {
          color: #666;
          font-size: 14px;
        }

        .settings label {
          display: inline-block;
          line-height: 1.75rem;
          width: 5.625rem;
        }

        .settings input {
          color: #333;
          line-height: 1.25rem;
        }
      </style>
      <div>
        <div class="depthSettings">
          <div class="depth">
            <label>Depth 0</label>
          </div>
          <div class="settings">
            <div>
              <label>Color:</label>
              <input id="depth0_itemColor" type="text" name="color" />
            </div>
            <div>
              <label class="lineOpacity">Line Opacity:</label>
              <input id="depth0_lineOpacity" type="text" name="opacity" />
            </div>
          </div>
        </div>
        <div class="depthSettings">
          <div class="depth">
            <label>Depth 1</label>
          </div>
          <div class="settings">
            <div>
              <label>Color:</label>
              <input id="depth1_itemColor" type="text" name="color" />
            </div>
            <div>
              <label class="lineOpacity">Line Opacity:</label>
              <input id="depth1_lineOpacity" type="text" name="opacity" />
            </div>
          </div>
        </div>
        <div class="depthSettings">
          <div class="depth">
            <label>Depth 2</label>
          </div>
          <div class="settings">
            <div>
              <label>Color:</label>
              <input id="depth2_itemColor" type="text" name="color" />
            </div>
            <div>
              <label class="lineOpacity">Line Opacity:</label>
              <input id="depth2_lineOpacity" type="text" name="opacity" />
            </div>
          </div>
        </div>
        <div class="depthSettings">
          <div class="depth">
            <label>Depth 3</label>
          </div>
          <div class="settings">
            <div>
              <label>Color:</label>
              <input id="depth3_itemColor" type="text" name="color" />
            </div>
            <div>
              <label class="lineOpacity">Line Opacity:</label>
              <input id="depth3_lineOpacity" type="text" name="opacity" />
            </div>
          </div>
        </div>
      </div>
    `;

    class SankeyChartStylingPanel extends HTMLElement {
        constructor() {
            super();
            console.log("styling: constructor()");
            this._shadowRoot = this.attachShadow({mode: "open"});
            this._shadowRoot.appendChild(template.content.cloneNode(true));

            this._shadowRoot.getElementById("depth0_itemColor").addEventListener("change", this.onDepthSettingsChanged.bind(this, 0));
            this._shadowRoot.getElementById("depth0_lineOpacity").addEventListener("change", this.onDepthSettingsChanged.bind(this, 0));

            this._shadowRoot.getElementById("depth1_itemColor").addEventListener("change", this.onDepthSettingsChanged.bind(this, 1));
            this._shadowRoot.getElementById("depth1_lineOpacity").addEventListener("change", this.onDepthSettingsChanged.bind(this, 1));

            this._shadowRoot.getElementById("depth2_itemColor").addEventListener("change", this.onDepthSettingsChanged.bind(this, 2));
            this._shadowRoot.getElementById("depth2_lineOpacity").addEventListener("change", this.onDepthSettingsChanged.bind(this, 2));

            this._shadowRoot.getElementById("depth3_itemColor").addEventListener("change", this.onDepthSettingsChanged.bind(this, 3));
            this._shadowRoot.getElementById("depth3_lineOpacity").addEventListener("change", this.onDepthSettingsChanged.bind(this, 3));

            this._props = {};
        }

        connectedCallback() {
            console.log(`styling[${this._props["widgetName"]}]: connectedCallback()`);
        }

        disconnectedCallback() {
            console.log(`styling[${this._props["widgetName"]}]: disconnectedCallback()`);
        }

        onCustomWidgetBeforeUpdate(changedProps) {
            this._props = { ...this._props, ...changedProps };
            if ("depth0Settings" in changedProps) {
                this.updateDepthSettings(changedProps["depth0Settings"], 0);
            }

            if ("depth1Settings" in changedProps) {
                this.updateDepthSettings(changedProps["depth1Settings"], 1);
            }

            if ("depth2Settings" in changedProps) {
                this.updateDepthSettings(changedProps["depth2Settings"], 2);
            }

            if ("depth3Settings" in changedProps) {
                this.updateDepthSettings(changedProps["depth3Settings"], 3);
            }
            console.log(`styling[${this._props["widgetName"]}]: onCustomWidgetBeforeUpdate(${JSON.stringify(changedProps)})`);
        }

        onCustomWidgetAfterUpdate(changedProps) {
            console.log(`styling[${this._props["widgetName"]}]: onCustomWidgetAfterUpdate(${JSON.stringify(changedProps)})`);
        }

        onCustomWidgetDestroy() {
            console.log(`styling[${this._props["widgetName"]}]: onCustomWidgetDestroy()`);
        }

        updateDepthSettings(settings, depth) {
            this[`depth${depth}Color`] = settings.itemColor;
            this[`depth${depth}Opacity`] = settings.lineOpacity;
        }

        onDepthSettingsChanged(depth, event) {
            event.preventDefault();

            const properties = {};
            properties[`depth${depth}Settings`] = {
                itemColor: this[`depth${depth}Color`],
                lineOpacity: this[`depth${depth}Opacity`]
            };

            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties
                }
            }));
        }

        set depth0Color(value) {
            this._shadowRoot.getElementById("depth0_itemColor").value = value;
        }

        get depth0Color() {
            return this._shadowRoot.getElementById("depth0_itemColor").value;
        }

        set depth0Opacity(value) {
            this._shadowRoot.getElementById("depth0_lineOpacity").value = value;
        }

        get depth0Opacity() {
            return parseFloat(this._shadowRoot.getElementById("depth0_lineOpacity").value);
        }

        set depth1Color(value) {
            this._shadowRoot.getElementById("depth1_itemColor").value = value;
        }

        get depth1Color() {
            return this._shadowRoot.getElementById("depth1_itemColor").value;
        }

        set depth1Opacity(value) {
            this._shadowRoot.getElementById("depth1_lineOpacity").value = value;
        }

        get depth1Opacity() {
            return parseFloat(this._shadowRoot.getElementById("depth1_lineOpacity").value);
        }

        set depth2Color(value) {
            this._shadowRoot.getElementById("depth2_itemColor").value = value;
        }

        get depth2Color() {
            return this._shadowRoot.getElementById("depth2_itemColor").value;
        }

        set depth2Opacity(value) {
            this._shadowRoot.getElementById("depth2_lineOpacity").value = value;
        }

        get depth2Opacity() {
            return parseFloat(this._shadowRoot.getElementById("depth2_lineOpacity").value);
        }

        set depth3Color(value) {
            this._shadowRoot.getElementById("depth3_itemColor").value = value;
        }

        get depth3Color() {
            return this._shadowRoot.getElementById("depth3_itemColor").value;
        }

        set depth3Opacity(value) {
            this._shadowRoot.getElementById("depth3_lineOpacity").value = value;
        }

        get depth3Opacity() {
            return parseFloat(this._shadowRoot.getElementById("depth3_lineOpacity").value);
        }
    }

    customElements.define("com-sap-sac-sample-echarts-sankeyyg-styling", SankeyChartStylingPanel);
})();