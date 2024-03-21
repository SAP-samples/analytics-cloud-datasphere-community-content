var getScriptPromisify = (src) => {
  return new Promise((resolve) => {
    $.getScript(src, resolve);
  });
};

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

  const template = document.createElement('template')
  template.innerHTML = `
  <style>
  </style>
  <div id="root" style="width: 100%; height: 100%;">
  </div>
  `
  class SampleRingKpi extends HTMLElement {
    constructor () {
      super()

      this._shadowRoot = this.attachShadow({ mode: 'open' })
      this._shadowRoot.appendChild(template.content.cloneNode(true))

      this._root = this._shadowRoot.getElementById('root')

      this._props = {}

      this._echart = undefined
      this.render()
    }

    onCustomWidgetResize (width, height) {
      this.render()
    }

    set myDataSource (dataBinding) {
      this._myDataSource = dataBinding
      this.render()
    }

    async render () {
      await getScriptPromisify("https://cdn.staticfile.org/echarts/5.3.0/echarts.min.js");
      
      this.dispose()

      if (!this._myDataSource || this._myDataSource.state !== 'success') {
        return
      }

      const { data, metadata } = this._myDataSource
      const { dimensions, measures } = parseMetadata(metadata)

      this._echart = echarts.init(this._root, 'wight')

      const option = {
        series: [
          {
            type: 'gauge',
            data: measures.map((measure, i) => {
              return {
                value: data[0][measure.key].raw,
                //name: measure.label,
                // title: {
                //   offsetCenter: ['-0%', `${-35 + i * 30}%`]
                // },
                detail: {
                  valueAnimation: true,
                  offsetCenter: ['0%', `0%`]
                }
              }
            }),
            startAngle: 90,
            endAngle: -270,
            pointer: {
              show: false
            },
            progress: {
              show: true,
              overlap: false,
              roundCap: false,
              clip: false,
              itemStyle: {
                borderWidth: 1,
                color:'#0070F2',
                borderColor: '#0070F2'
              }
            },
            axisLine: {
              lineStyle: {
                width:25
              }
            },
            splitLine: {
              show: false,
              distance: 0,
              length: 10
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: false,
              distance: 50
            },
            title: {
              fontSize: 14
            },
            detail: {
              width: 50,
              height: 14,
              fontSize: 30,
              color:'#1D2D3E',
              formatter: '{value}%'
            }
          }
        ]
      }
      this._echart.setOption(option)
    }

    dispose () {
      if (this._echart) {
        echarts.dispose(this._echart)
      }
    }
  }

  customElements.define('com-sap-sample-echarts-ring_kpi', SampleRingKpi)
})()
