(function () {
  let template = document.createElement("template");
  template.innerHTML = `
    <style>
    #root div {
        margin: 0.5rem;
    }
    #root .title {
        font-weight: bold;
    }
</style>
<div id="root" style="width: 100%; height: 100%;">
    <div class="title">All</div>
    <div>
        <input id="showAll" type="checkbox" checked /><label for="reverse">Show</label>
    </div>

    <div class="title">Label</div>
    <div>
        <input id="labelAll" type="text" value="All" />
    </div>
    <div class="title">Drill Up Area</div>
    <div>
        <input id="drillUpArea" type="color" value="#ffffff" />
    </div>
    <div class="title">Colors</div>
    <!-- http://zhongguose.com/#chahuahong -->
    <div>
        <input id="stop0" type="color" value="#c04851" />
    </div>
    <div>
        <input id="stop1" type="color" value="#ed5a65" />
    </div>
    <div>
        <input id="stop2" type="color" value="#f07c82" />
    </div>
    <div>
        <input id="stop3" type="color" value="#eea2a4" />
    </div>
    <div>
        <input id="stop4" type="color" value="#ee3f4d" />
    </div>
    <div>
        <button id="button">Apply</button>
    </div>
</div>
    `;

    class Styling extends HTMLElement {
      constructor () {
        super()
    
        this._shadowRoot = this.attachShadow({ mode: 'open' })
        this._shadowRoot.appendChild(template.content.cloneNode(true))
        this._root = this._shadowRoot.getElementById('root')
    
        this._button = this._shadowRoot.getElementById('button')
        this._button.addEventListener('click', () => {
          const drillUpArea = this._shadowRoot.getElementById('drillUpArea').value
          const stops = [
            this._shadowRoot.getElementById('stop0').value,
            this._shadowRoot.getElementById('stop1').value,
            this._shadowRoot.getElementById('stop2').value,
            this._shadowRoot.getElementById('stop3').value,
            this._shadowRoot.getElementById('stop4').value
          ]
          const showAll = this._shadowRoot.getElementById('showAll').checked
          const labelAll = this._shadowRoot.getElementById('labelAll').value
          this.dispatchEvent(new CustomEvent('propertiesChanged', { detail: { properties: { drillUpArea, stops, showAll, labelAll } } }))
        })
      }
    
      // ------------------
      // LifecycleCallbacks
      // ------------------
      async onCustomWidgetBeforeUpdate (changedProps) {
      }
    
      async onCustomWidgetAfterUpdate (changedProps) {
        if (changedProps.drillUpArea) {
          this._shadowRoot.getElementById('drillUpArea').value = changedProps.drillUpArea
        }
        if (changedProps.stops) {
          this._shadowRoot.getElementById('stop0').value = changedProps.stops[0]
          this._shadowRoot.getElementById('stop1').value = changedProps.stops[1]
          this._shadowRoot.getElementById('stop2').value = changedProps.stops[2]
          this._shadowRoot.getElementById('stop3').value = changedProps.stops[3]
          this._shadowRoot.getElementById('stop4').value = changedProps.stops[4]
        }
        if (changedProps.showAll !== undefined) {
          this._shadowRoot.getElementById('showAll').checked = changedProps.showAll
        }
        if (changedProps.labelAll !== undefined) {
          this._shadowRoot.getElementById('labelAll').value = changedProps.labelAll
        }
      }
    
      async onCustomWidgetResize (width, height) {
      }
    
      async onCustomWidgetDestroy () {
        this.dispose()
      }
    
      // ------------------
      //
      // ------------------
    
      dispose () {
      }
    }

    customElements.define('com-sap-sample-init-example-echarts-sunburst-styling', Styling);
})();