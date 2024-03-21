
(function() {
    
  const template = document.createElement('template')
  template.innerHTML = `
  <style>
      #root div {
          margin: 0.5rem;
      }
      #textarea {
          padding: 0;
          width: 100%;
          height: 20rem;
      }
  </style>
  <div id="root" style="width: 100%; height: 100%;">
      <div>Text</div>
      <div>
          <textarea id="textarea" placeholder="Input the text to generate the word cloud"></textarea>
      </div>
      <div>
          <button id="button">Apply</button>
      </div>
  </div>

  `

  class Builder extends HTMLElement {
    constructor () {
      super()

      this._shadowRoot = this.attachShadow({ mode: 'open' })
      this._shadowRoot.appendChild(template.content.cloneNode(true))
      this._root = this._shadowRoot.getElementById('root')

      this._textarea = this._shadowRoot.getElementById('textarea')
      this._button = this._shadowRoot.getElementById('button')
      this._button.addEventListener('click', () => {
        const text = this._textarea.value
        this.dispatchEvent(new CustomEvent('propertiesChanged', { detail: { properties: { text } } }))
      })
    }

    // ------------------
    // LifecycleCallbacks
    // ------------------
    async onCustomWidgetBeforeUpdate (changedProps) {
    }

    async onCustomWidgetAfterUpdate (changedProps) {
      if (changedProps.text) {
        this._textarea.value = changedProps.text
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

  customElements.define('com-sap-sac-sample-echarts-wordcloudbyinput-builder', Builder)

})()