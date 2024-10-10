(function () {
  const template = document.createElement('template')
  template.innerHTML = `
    <style>
      #root label {
        height: 24px;
        display: block;
        font-size: .875rem;
        color: #999;
      }
      #root label:not(:first-child) {
        margin-top: 16px;
      }
      #root select {
        font-size: 14px;
        width: 120px;
      }
      #root button {
        display: block;
        margin-top: 16px;
      }
    </style>

    <div id="root" style="width: 100%; height: 100%;">
        <div id="nodeName">
            <label for="nodeName-input">the root node name</label>
            <input id="nodeName-input" style="width: 70%; height: 100%;" placeholder="Enter the name of the root node"/>
        </div>

        <div id="seriesLayout">
            <label for="seriesLayout-dropdown">layout setting</label>
            <select id="seriesLayout-dropdown" style="width: 50%; height: 100%;">
              <option value="orthogonal">orthogonal</option>
              <option value="radial">radial</option>
            </select>
        </div>

        <div id="seriesType" style="display: none;">
            <label for="seriesType-dropdown">orient</label>
            <select id="seriesType-dropdown" style="width: 50%; height: 100%;">
              <option value="LR">L-R</option>
              <option value="RL">R-L</option>
              <option value="TB">T-B</option>
              <option value="BT">B-T</option>
            </select>
        </div>

        <div id="seriesLineType" style="display: none;">
            <label for="seriesLineType-dropdown">edge shape</label>
            <select id="seriesLineType-dropdown" style="width: 50%; height: 100%;">
              <option value="curve">curve</option>
              <option value="polyline">polyline</option>
            </select>
        </div>

        <div id="treeNodeType">
            <label for="treeNodeType-dropdown">node symbol</label>
            <select id="treeNodeType-dropdown" style="width: 50%; height: 100%;">
               <option value="emptyCircle">circle</option>
               <option value="emptyRect">rect</option>
               <option value="emptyRoundRect">roundrect</option>
               <option value="emptyTriangle">triangle</option>
               <option value="emptyDiamond">diamond</option>
               <option value="emptyPin">pin</option>
               <option value="emptyArrow">arrow</option>
            </select>
        </div>

        <div id="treeNodeColor">
            <label for="treeNodeColor-input">node color</label>
            <input id="treeNodeColor-input" style="width: 70%; height: 100%;" placeholder="Enter node color"/>
        </div>

        <div id="nodeSymbolSize">
            <label for="nodeSymbolSize-dropdown">node symbol size</label>
            <select id="nodeSymbolSize-dropdown" style="width: 50%; height: 100%;">
                <option value=7> 7px </option>
                <option value=9> 9px </option>
                <option value=11> 11px </option>
                <option value=13> 13px </option>
                <option value=15> 15px </option>
            </select>
        </div>

        <div id="nodeFontsize">
            <label for="nodeFontsize-dropdown">fontsize</label>
            <select id="nodeFontsize-dropdown" style="width: 50%; height: 100%;">
                <option value=8> 8px </option>
                <option value=10> 10px </option>    
                <option value=12> 12px </option>
                <option value=14> 14px </option>
                <option value=16> 16px </option>
            </select>
        </div>

        <div id="nodeHighLigbt">
            <label for="nodeHighLigbt-input">threshold(Highlighted in red)</label>
            <input id="nodeHighLigbt-input" style="width: 70%; height: 100%;" placeholder="Enter threshold"/>
        </div>

        <div id="treeNodeLineWidth">
            <label for="treeNodeLineWidth-dropdown">edge weight</label>
            <select id="treeNodeLineWidth-dropdown" style="width: 50%; height: 100%;">
                <option value=1> 1px </option>
                <option value=2> 2px </option>    
                <option value=3> 3px </option>
                <option value=4> 4px </option>
                <option value=5> 5px </option>
                <option value=6> 6px </option>
                <option value=7> 7px </option>
            </select>
        </div>

        <div>
            <button id="aaply_button">Apply</button>
        </div>

    </div>
    `

  class Styling extends HTMLElement {
    constructor () {
      super()

      // Shadow DOM 是Web组件技术的核心部分，提供了强大的封装能力，使得开发者能够创建高度自包含、可重用的组件。
      // 通过使用Shadow DOM，组件的样式和行为可以独立于页面的其他部分，避免了样式和结构的冲突，提高了代码的可维护性和复用性。
      this._shadowRoot = this.attachShadow({ mode: 'open' })  // 创建并附加Shadow DOM
      this._shadowRoot.appendChild(template.content.cloneNode(true))
      this._root = this._shadowRoot.getElementById('root')

      this._button = this._shadowRoot.getElementById('aaply_button')
      this._button.addEventListener('click', () => {
        const seriesLayout = this._shadowRoot.getElementById('seriesLayout-dropdown').value
        const seriesLineType = this._shadowRoot.getElementById('seriesLineType-dropdown').value
        const seriesType = this._shadowRoot.getElementById('seriesType-dropdown').value
        const treeStructName = this._shadowRoot.getElementById('nodeName-input').value
        const nodeFontsize = this._shadowRoot.getElementById('nodeFontsize-dropdown').value
        const treeNodeType = this._shadowRoot.getElementById('treeNodeType-dropdown').value
        const nodeSymbolSize = this._shadowRoot.getElementById('nodeSymbolSize-dropdown').value
        const treeNodeColor = this._shadowRoot.getElementById('treeNodeColor-input').value
        const treeNodeLineWidth = this._shadowRoot.getElementById('treeNodeLineWidth-dropdown').value
        const nodeHighLigbt = this._shadowRoot.getElementById('nodeHighLigbt-input').value
        console.log()
        this.dispatchEvent(new CustomEvent('propertiesChanged', { 
          detail: { 
            properties: { 
              seriesLayout,
              seriesLineType,
              seriesType, 
              treeStructName,
              nodeFontsize,
              treeNodeType,
              nodeSymbolSize,
              treeNodeColor,
              treeNodeLineWidth,
              nodeHighLigbt
            } 
          } 
        }))
      })
      // Add event listener for seriesLayout-dropdown
      this._shadowRoot.getElementById('seriesLayout-dropdown').addEventListener('change', (event) => {
        const seriesTypeDiv = this._shadowRoot.getElementById('seriesType');
        const seriesLineTypeDiv = this._shadowRoot.getElementById('seriesLineType');
        if (event.target.value === 'orthogonal') {
          seriesTypeDiv.style.display = 'block';
          seriesLineTypeDiv.style.display = 'block';
        } else {
          seriesTypeDiv.style.display = 'none';
          seriesLineTypeDiv.style.display = 'none';
          this._shadowRoot.getElementById('seriesLineType-dropdown').value = 'curve';
          this._shadowRoot.getElementById('seriesType-dropdown').value = ''
        }
      });

      // Initialize visibility of seriesType and seriesLineType based on initial seriesLayout-dropdown value
      this._shadowRoot.getElementById('seriesLayout-dropdown').dispatchEvent(new Event('change'));
    }

    async onCustomWidgetAfterUpdate (changedProps) {

      if (changedProps.seriesLayout !== undefined && changedProps.seriesLayout !== null && changedProps.seriesLayout !== '') {
        let seriesLayout = changedProps.seriesLayout;
        this._shadowRoot.getElementById('seriesLayout-dropdown').value = seriesLayout
      } else {
        let seriesLayout = 'orthogonal';
        this._shadowRoot.getElementById('seriesLayout-dropdown').value = seriesLayout
      }

      if (changedProps.treeNodeLineWidth !== undefined && changedProps.treeNodeLineWidth !== null && changedProps.treeNodeLineWidth !== '') {
        let treeNodeLineWidth = changedProps.treeNodeLineWidth;
        this._shadowRoot.getElementById('treeNodeLineWidth-dropdown').value = treeNodeLineWidth
      } else {
        let treeNodeLineWidth = 2;
        this._shadowRoot.getElementById('treeNodeLineWidth-dropdown').value = treeNodeLineWidth
      }

      if (changedProps.seriesLineType !== undefined && changedProps.seriesLineType !== null && changedProps.seriesLineType !== '') {
        let seriesLineType = changedProps.seriesLineType;
        this._shadowRoot.getElementById('seriesLineType-dropdown').value = seriesLineType
      } else {
        let seriesLineType = 'curve';
        this._shadowRoot.getElementById('seriesLineType-dropdown').value = seriesLineType
      }

      if (changedProps.seriesType !== undefined && changedProps.seriesType !== null && changedProps.seriesType !== '') {
        let seriesType = changedProps.seriesType;
        this._shadowRoot.getElementById('seriesType-dropdown').value = seriesType
      } else {
        let seriesType = 'LR';
        this._shadowRoot.getElementById('seriesType-dropdown').value = seriesType
      }

      if (changedProps.nodeHighLigbt) {
        this._shadowRoot.getElementById('nodeHighLigbt-input').value = changedProps.nodeHighLigbt
      } 

      if (changedProps.treeStructName) {
        this._shadowRoot.getElementById('nodeName-input').value = changedProps.treeStructName
      } 

      if (changedProps.nodeFontsize !== undefined && changedProps.nodeFontsize !== null && changedProps.nodeFontsize !== '') {
        let nodeFontsize = changedProps.nodeFontsize;
        this._shadowRoot.getElementById('nodeFontsize-dropdown').value = nodeFontsize
      } else {
        let nodeFontsize = 10;
        this._shadowRoot.getElementById('nodeFontsize-dropdown').value = nodeFontsize
      }

      if (changedProps.treeNodeType !== undefined && changedProps.treeNodeType !== null && changedProps.treeNodeType !== '') {
        let treeNodeType = changedProps.treeNodeType;
        this._shadowRoot.getElementById('treeNodeType-dropdown').value = treeNodeType
      } else {
        let treeNodeType = 'emptyCircle';
        this._shadowRoot.getElementById('treeNodeType-dropdown').value = treeNodeType
      }

      if (changedProps.treeNodeColor) {
        this._shadowRoot.getElementById('treeNodeColor-input').value = changedProps.treeNodeColor
      } 

      if (changedProps.nodeSymbolSize !== undefined && changedProps.nodeSymbolSize !== null && changedProps.nodeSymbolSize !== '') {
        let nodeSymbolSize = changedProps.nodeSymbolSize;
        this._shadowRoot.getElementById('nodeSymbolSize-dropdown').value = nodeSymbolSize;
      } else {
        let nodeSymbolSize = 9;
        this._shadowRoot.getElementById('nodeSymbolSize-dropdown').value = nodeSymbolSize;
      }
    }
  }

  customElements.define('com-sap-sac-en-tree-styling', Styling)
})()

