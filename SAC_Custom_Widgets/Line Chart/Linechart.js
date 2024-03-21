var getScriptPromisify = (src) => {
  return new Promise((resolve) => {
    $.getScript(src, resolve)
  })
}

const parseMetadata = metadata => {
  const { dimensions: dimensionsMap, mainStructureMembers: measuresMap } = metadata
  const dimensions = []
  for (const key in dimensionsMap) {
    const dimension = dimensionsMap[key]
    dimensions.push({ key, ...dimension })
  }
  const measures = []
  for (const key in measuresMap) {
    const measure = measuresMap[key]
    measures.push({ key, ...measure })
  }
  return { dimensions, measures, dimensionsMap, measuresMap }
}

(function () {
  const prepared = document.createElement('template')
  prepared.innerHTML = `
        <style>
        </style>
        <div id="root" style="width: 100%; height: 100%;">
        </div>
      `
  class LineSamplePrepped extends HTMLElement {
    constructor () {
      super()

      this._shadowRoot = this.attachShadow({ mode: 'open' })
      this._shadowRoot.appendChild(prepared.content.cloneNode(true))

      this._root = this._shadowRoot.getElementById('root')

      this._props = {}

      this.render()
    }

    onCustomWidgetResize (width, height) {
      this.render()
    }

    onCustomWidgetAfterUpdate (changedProps) {
      this.render()
    }

    async render () {
      const dataBinding = this.dataBinding
      if (!dataBinding || dataBinding.state !== 'success') { return }

      await getScriptPromisify(
        'https://cdn.staticfile.org/echarts/5.0.0/echarts.min.js'
      )

      const { data, metadata } = dataBinding
      const { dimensions, measures } = parseMetadata(metadata)
      // dimension
      const categoryData = []

      // measures
      const series = measures.map(measure => {
        return {
          data: [],
          key: measure.key,
          type: 'line',
          smooth: true
        }
      })

      data.forEach(row => {
        // dimension
        categoryData.push(dimensions.map(dimension => {
          return row[dimension.key].label
        }).join('/'))
        // measures
        series.forEach(series => {
          series.data.push(row[series.key].raw)
        })
      })

      const myChart = echarts.init(this._root, 'main')
      const option = {
        xAxis: {
          type: 'category',
          data: categoryData
        },
        yAxis: {
          type: 'value'
        },
        tooltip: {
          trigger: 'axis'
        },
        series
      }
      myChart.setOption(option)
    }
  }

  customElements.define('com-sap-sample-echarts-line_chart', LineSamplePrepped)
})()
