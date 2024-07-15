//model为juice，dimension为location，measure为gross margin

/* 异步获取js */
var getScriptPromisify = (src) => {
    return new Promise((resolve) => {
        $.getScript(src, resolve)
    })
}

/* 解析dataBinding中的metadata */
var parseMetadata = metadata => {
    const { dimensions: dimensionsMap, mainStructureMembers: measuresMap } = metadata
    const dimensions = []           //dimension数组，key为类似dimension_0，用来读取data对应项
    for (const key in dimensionsMap) {
        const dimension = dimensionsMap[key]
        dimensions.push({ key, ...dimension })
    }
    const measures = []             //mesaure数组，key为类似measure_0，用来读取data对应项
    for (const key in measuresMap) {
        const measure = measuresMap[key]
        measures.push({ key, ...measure })
    }
    return { dimensions, measures, dimensionsMap, measuresMap }
}

(function () {
    const template = document.createElement('template')
    template.innerHTML = `
          <style>
          </style>
          <div id="root" style="width: 100%; height: 100%;">
          </div>
        `
    class Main extends HTMLElement {
        constructor() {
            super()

            this._shadowRoot = this.attachShadow({ mode: 'open' })
            this._shadowRoot.appendChild(template.content.cloneNode(true))

            this._root = this._shadowRoot.getElementById('root')

            this._eChart = null
            this._selectedDataPoint = {}
            this.order = 'desc'
        }

        onCustomWidgetResize(width, height) {
            this.render()
        }

        onCustomWidgetAfterUpdate(changedProps) {
            this.render()
        }

        onCustomWidgetDestroy() {
            if (this._eChart && echarts) { echarts.dispose(this._eChart) }
        }

        changeOrder() {
            if (this.order == 'desc')
                this.order = 'asc'
            else
                this.order = 'desc'
            this.render()
        }

        getSelectedDataPoint() {
            return this._selectedDataPoint
        }

        async render() {
            const dataBinding = this.dataBinding
            if (!dataBinding || dataBinding.state !== 'success') { return }

            await getScriptPromisify('https://cdnjs.cloudflare.com/ajax/libs/echarts/5.0.0/echarts.min.js')

            const { data, metadata } = dataBinding
            const { dimensions, measures } = parseMetadata(metadata)
            // dimension
            const categoryData = []

            // measures
            const series = measures.map(measure => {
                return {
                    id: measure.id,
                    name: measure.label,
                    data: [],
                    key: measure.key,
                    type: 'bar'
                }
            })

            function asc(attribute) {
                return function (a, b) {
                    let value1 = a[attribute].raw
                    let value2 = b[attribute].raw
                    return value1 - value2
                }
            }

            function desc(attribute) {
                return function (a, b) {
                    let value1 = a[attribute].raw
                    let value2 = b[attribute].raw
                    return value2 - value1
                }
            }

            if (this.order == 'desc')
                data.sort(desc('measures_0'))
            else
                data.sort(asc('measures_0'))

            data.forEach(row => {
                categoryData.push(dimensions.map(dimension => {
                    return row[dimension.key].label
                }).join('/')) // dimension
                series.forEach(series => {
                    series.data.push(row[series.key].raw)
                }) // measures
            })

            const seriesPercentage = []
            series.forEach(series => {
                let accumulator = []
                let sum = series.data.reduce((accu, cur) => {
                    accumulator.push(accu)
                    return accu + cur
                })
                accumulator.push(sum)
                let result = accumulator.map(item => Math.round(item / sum * 10000) / 100)
                seriesPercentage.push({
                    name: series.name + ' Cumulative Frequencies',
                    data: result,
                    type: 'line',
                    yAxisIndex: 1,
                    tooltip: {
                        valueFormatter: value => value + '%'
                    }
                })
            })

            console.log('series', series)
            console.log('seriesPercentage', seriesPercentage)
            let seriesResult = [...series, ...seriesPercentage]

            if (this._eChart) { echarts.dispose(this._eChart) }
            const eChart = this._eChart = echarts.init(this._root, 'main')
            const option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        crossStyle: {
                            color: '#999'
                        }
                    }
                },
                xAxis: { type: 'category', data: categoryData },
                yAxis: [
                    {
                        type: 'value'
                    },
                    {
                        type: 'value',
                        axisLabel: {
                            formatter: '{value}%'
                        }
                    }
                ],
                series: seriesResult
            }
            eChart.setOption(option)
            eChart.on('click', (params) => {
                // https://echarts.apache.org/en/api.html#events.Mouse%20events
                const { seriesIndex, seriesName, dataIndex, data, name } = params   //见echarts文档中click事件的返回值
                this._selectedDataPoint = { seriesIndex, seriesName, dataIndex, data, name }
                this.dispatchEvent(new Event('onClick'))
            })
        }
    }

    customElements.define('com-sap-sac-pareto-eric-main', Main)
})()
