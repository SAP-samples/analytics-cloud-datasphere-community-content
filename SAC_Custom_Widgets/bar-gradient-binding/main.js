var getScriptPromisify = (src) => {
  return new Promise(resolve => {
    $.getScript(src, resolve)
  })
}

(function () {
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

  const parseDataBinding = (dataBinding) => {
    const { data, metadata } = dataBinding
    const { dimensions, measures } = parseMetadata(metadata)

    // dimension
    const categoryData = []
    // measures
    const series = measures.map(measure => {
      return {
        data: [],
        key: measure.key
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
    return { data: series[0].data, dataAxis: categoryData }
  }
  const getOption = (dataBinding) => {
    const { data, dataAxis } = parseDataBinding(dataBinding)
    let yMax = 0
    data.forEach(y => {
      yMax = Math.max(y, yMax)
    })
    const dataShadow = []
    for (let i = 0; i < data.length; i++) {
      dataShadow.push(yMax)
    }
    const option = {
      title: {
        text: 'Feature Sample: Gradient Color, Shadow, Click Zoom'
      },
      xAxis: {
        data: dataAxis,
        axisLabel: {
          inside: true,
          color: '#000'
        },
        axisTick: {
          show: false
        },
        axisLine: {
          show: false
        },
        z: 10
      },
      yAxis: {
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          formatter: '{value} Million',
          color: '#999'
        }
      },
      dataZoom: [
        {
          type: 'inside'
        }
      ],
      series: [
        {
          type: 'bar',
          showBackground: true,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#2378f7' },
                { offset: 0.7, color: '#2378f7' },
                { offset: 1, color: '#83bff6' }
              ])
            }
          },
          data: data
        }
      ]
    }
    return { option, data, dataAxis }
  }

  const template = document.createElement('template')
  template.innerHTML = `
      <style>
      </style>
      <div id="root" style="width: 100%; height: 100%;">
      </div>
    `
  class Main extends HTMLElement {
    constructor () {
      super()

      this._shadowRoot = this.attachShadow({ mode: 'open' })
      this._shadowRoot.appendChild(template.content.cloneNode(true))

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
      if (!window.echarts) {
        await getScriptPromisify('https://cdn.bootcdn.net/ajax/libs/echarts/5.0.0/echarts.min.js')
      }

      if (this._myChart) {
        echarts.dispose(this._myChart)
      }
      if (!this.myDataBinding || this.myDataBinding.state !== 'success') { return }

      const myChart = this._myChart = echarts.init(this._root)
      const { option, data, dataAxis } = getOption(this.myDataBinding)
      myChart.setOption(option)

      // Enable data zoom when user click bar.
      const zoomSize = 6
      myChart.on('click', function (params) {
        console.log(dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)])
        myChart.dispatchAction({
          type: 'dataZoom',
          startValue: dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)],
          endValue:
            dataAxis[Math.min(params.dataIndex + zoomSize / 2, data.length - 1)]
        })
      })
    }
  }

  customElements.define('com-sap-sample-echarts-bar-gradient-binding', Main)
})()
