(function () {

  const template = document.createElement('template')
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
      <div class="title">Colors Palettes</div>
      <div>
          <input id="reverse" type="checkbox" /><label for="reverse">Reverse</label>
      </div>
      <div class="title">Color Stops</div>
      <div>
          <input id="stop0" type="text" placeholder="" />
      </div>
      <div>
          <input id="stop1" type="text" placeholder="" />
      </div>
      <div>
          <input id="stop2" type="text" placeholder="" />
      </div>
      <div>
          <input id="stop3" type="text" placeholder="" />
      </div>
      <div>
          <input id="stop4" type="text" placeholder="" />
      </div>
      <div>
          <button id="button">Apply</button>
      </div>
  </div>
  `

  class Styling extends HTMLElement {
    constructor () {
      super()

      this._shadowRoot = this.attachShadow({ mode: 'open' })
      this._shadowRoot.appendChild(template.content.cloneNode(true))
      this._root = this._shadowRoot.getElementById('root')

      this._button = this._shadowRoot.getElementById('button')
      this._button.addEventListener('click', () => {
        const stops = [
          Number(this._shadowRoot.getElementById('stop0').value),
          Number(this._shadowRoot.getElementById('stop1').value),
          Number(this._shadowRoot.getElementById('stop2').value),
          Number(this._shadowRoot.getElementById('stop3').value),
          Number(this._shadowRoot.getElementById('stop4').value)
        ]
        const reverse = this._shadowRoot.getElementById('reverse').checked
        this.dispatchEvent(new CustomEvent('propertiesChanged', { detail: { properties: { stops, reverse } } }))
      })
    }

    // ------------------
    // LifecycleCallbacks
    // ------------------
    async onCustomWidgetBeforeUpdate (changedProps) {
    }

    async onCustomWidgetAfterUpdate (changedProps) {
      if (changedProps.stops) {
        this._shadowRoot.getElementById('stop0').value = changedProps.stops[0]
        this._shadowRoot.getElementById('stop1').value = changedProps.stops[1]
        this._shadowRoot.getElementById('stop2').value = changedProps.stops[2]
        this._shadowRoot.getElementById('stop3').value = changedProps.stops[3]
        this._shadowRoot.getElementById('stop4').value = changedProps.stops[4]
      }
      if (changedProps.reverse !== undefined) {
        this._shadowRoot.getElementById('reverse').checked = changedProps.reverse
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

  customElements.define('com-sap-sac-sample-echarts-gaugegrade-styling', Styling)
})()