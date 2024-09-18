var getScriptPromisify = (src) => {
  return new Promise((resolve) => {
    $.getScript(src, resolve)
  })
} 

var parseMetadata = metadata => {
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

var updateSymbol = (node, threshold) => {
  if (node.rawvalue > threshold) {
      node.itemStyle = {color : 'red'};
  }
  if (node.children && node.children.length > 0) {
      for (let i = 0; i < node.children.length; i++) {
          updateSymbol(node.children[i], threshold);
      }
  }
}

var convertToTree = (data, metadata) => {
    const rootNodes = Object.values(metadata.dimensions);
    const nodes = {};
    const root = {
        name: 'root',
        value: '',
        rawvalue: '',
        unit: '',
        children: []
    };

    rootNodes.forEach(rootNode => {
        const childNode = {
            name: rootNode.description,
            value: '',
            rawvalue: '',
            unit: '',
            children: []
        };

        data.forEach(item => {
            const dimensionKey = `dimensions_${rootNodes.indexOf(rootNode)}`;
            const { id, label, parentId } = item[dimensionKey];
            const value = item.measures_0.formatted;
            const rawValue = item.measures_0.raw;
            const unit = item.measures_0.unit;

            if (!nodes[id]) {
                nodes[id] = { name: label, children: [] };
            } else {
                nodes[id].name = label;
            }

            nodes[id].value = value;
            nodes[id].rawvalue = rawValue;
            nodes[id].unit = unit;

            if (parentId) {
                if (!nodes[parentId]) {
                    nodes[parentId] = { name: parentId, children: [] };
                }
                nodes[parentId].children.push(nodes[id]);
            } else {
                childNode.children.push(nodes[id]);
            }

        });
        root.children.push(childNode);
    });
    return root;
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
    constructor () {
      super()

      this._shadowRoot = this.attachShadow({ mode: 'open' })
      this._shadowRoot.appendChild(template.content.cloneNode(true))

      this._root = this._shadowRoot.getElementById('root')

      this._eChart = null
    }

    onCustomWidgetResize (width, height) {
      this.render()
    }

    onCustomWidgetAfterUpdate (changedProps) {
      this.render()
    }
  
    onCustomWidgetDestroy () {
      if (this._eChart && echarts) { echarts.dispose(this._eChart) }
    }

    setNodeHighLigbt (nodeHighLigbt) {
      this.nodeHighLigbt = nodeHighLigbt
      this.dispatchEvent(new CustomEvent('propertiesChanged', { detail: { properties: { nodeHighLigbt } } }))
      this.render()
    }

    setTreeNodeLineWidth (treeNodeLineWidth) {
      this.treeNodeLineWidth = treeNodeLineWidth
      this.dispatchEvent(new CustomEvent('propertiesChanged', { detail: { properties: { treeNodeLineWidth } } }))
      this.render()
    }

    setSeriesLineType (seriesLineType) {
      this.seriesLineType = seriesLineType
      this.dispatchEvent(new CustomEvent('propertiesChanged', { detail: { properties: { seriesLineType } } }))
      this.render()
    }

    setSeriesType (seriesType) {
      this.seriesType = seriesType
      this.dispatchEvent(new CustomEvent('propertiesChanged', { detail: { properties: { seriesType } } }))
      this.render()
    }

    setSeriesLayout (seriesLayout) {
      this.seriesLayout = seriesLayout
      this.dispatchEvent(new CustomEvent('propertiesChanged', { detail: { properties: { seriesLayout } } }))
      this.render()
    }

    setTreeStructName (treeStructName) {
      this.treeStructName = treeStructName
      this.dispatchEvent(new CustomEvent('propertiesChanged', { detail: { properties: { treeStructName } } }))
      this.render()
    }

    setNodeFontsize (nodeFontsize) {
      this.nodeFontsize = nodeFontsize
      this.dispatchEvent(new CustomEvent('propertiesChanged', { detail: { properties: { nodeFontsize } } }))
      this.render()
    }

    setTreeNodeType (treeNodeType) {
      this.treeNodeType = treeNodeType
      this.dispatchEvent(new CustomEvent('propertiesChanged', { detail: { properties: { treeNodeType } } }))
      this.render()
    }

    setnodeSymbolSize (nodeSymbolSize) {
      this.nodeSymbolSize = nodeSymbolSize
      this.dispatchEvent(new CustomEvent('propertiesChanged', { detail: { properties: { nodeSymbolSize } } }))
      this.render()
    }

    setTreeNodeColor (treeNodeColor) {
      this.treeNodeColor = treeNodeColor
      this.dispatchEvent(new CustomEvent('propertiesChanged', { detail: { properties: { treeNodeColor } } }))
      this.render()
    }

    getSelectedDataPoint () {
      return this._selectedDataPoint
    }


    async render () {
      const dataBinding = this.dataBinding
      if (!dataBinding || dataBinding.state !== 'success') { return }

      async function getScriptPromisify(url) {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = url;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
          document.head.appendChild(script);
        });
      }
    
      async function loadEcharts() {
        const cdnUrls = [
          "https://cdnjs.cloudflare.com/ajax/libs/echarts/5.0.0/echarts.min.js",
          "https://cdn.jsdelivr.net/npm/echarts@5.0.0/dist/echarts.min.js",
          "https://unpkg.com/echarts@5.0.0/dist/echarts.min.js",
          "https://cdn.staticfile.org/echarts/5.0.0/echarts.min.js"
        ];
    
        for (const url of cdnUrls) {
          try {
            await getScriptPromisify(url);
            console.log(`Loaded ECharts from ${url}`);
            return true;
          } catch (error) {
            console.warn(`Failed to load ECharts from ${url}`);
          }
        }
        throw new Error('All CDN sources failed to load ECharts.');
      }
    
      try {
        await loadEcharts();
      } catch (error) {
        console.error('Failed to load ECharts:', error);
      }


      const { data, metadata } = dataBinding
      console.log("dataBinding_data",data)
      console.log("dataBinding_metadata",metadata)

      const treeStruct = convertToTree(data, metadata);
      console.log("treeStruct:",treeStruct);
      
      treeStruct.name = this.treeStructName || 'root';
      updateSymbol(treeStruct);
      const tthreshold = parseInt(this.nodeHighLigbt || 500000, 10);
      updateSymbol(treeStruct, tthreshold);

      const option = {
        tooltip: {
            trigger: 'item',
            triggerOn: 'mousemove',
            formatter: function (params) {
              const node = params.data;
              return `<div>
                          <h4>${node.name}</h4>
                          <div>
                            Value: ${node.value}<br>
                            Unit: ${node.unit}
                          </div>
                      </div>`;
            }
        },
        series: [
          {
            type: 'tree',
            data: [treeStruct],
            roam: true,
            top: '5%',
            left: '10%',
            bottom: '7%',
            right: '20%',
            layout: this.seriesLayout || 'orthogonal',
            orient: this.seriesType || 'LR',
            symbol: this.treeNodeType || 'emptyCircle',
            symbolSize: this.nodeSymbolSize || 9,
            edgeShape: this.seriesLineType || 'curve',
            initialTreeDepth: 3,
            lineStyle: {
                width: this.treeNodeLineWidth || 2,
            },
            label: (() => {
              if (this.seriesLayout === 'radial') {
                  return {
                      fontSize: this.nodeFontsize || 9,
                      formatter: function(params) {
                          if (params.data.value !== undefined && params.data.value !== null) {
                              return params.data.name + '  ' + params.data.value;
                          } else {
                              return params.data.name;
                          }
                      }
                  };
              } else {
                    const baseLabel = {
                        fontSize: this.nodeFontsize || 10
                    };
                    let formatter;
                    
                    switch (this.seriesType) {
                        case 'RL':
                            formatter = function(params) {
                                if (params.data.value !== undefined && params.data.value !== null && params.data.value !== 0) {
                                    return params.data.name + '  ' + params.data.value;
                                } else {
                                    return params.data.name;
                                }
                            };
                            return Object.assign(baseLabel, {
                                position: 'right',
                                verticalAlign: 'middle',
                                align: 'left',
                                formatter
                            });
                        case 'LR':
                            formatter = function(params) {
                                if (params.data.value !== undefined && params.data.value !== null) {
                                    return params.data.name + '  ' + params.data.value;
                                } else {
                                    return params.data.name;
                                }
                            };
                            return Object.assign(baseLabel, {
                                position: 'left',
                                verticalAlign: 'middle',
                                align: 'right',
                                fontSize: this.nodeFontsize || 9,
                                formatter
                            });
                        case 'TB':
                            formatter = function(params) {
                                if (params.data.value !== undefined && params.data.value !== null) {
                                    return params.data.name + '  ' + params.data.value;
                                } else {
                                    return params.data.name;
                                }
                            };
                            return Object.assign(baseLabel, {
                                position: 'top',
                                rotate: -90,
                                verticalAlign: 'middle',
                                align: 'right',
                                fontSize: this.nodeFontsize || 9,
                                formatter
                            });
                        case 'BT':
                            formatter = function(params) {
                                if (params.data.value !== undefined && params.data.value !== null) {
                                    return params.data.name + '  ' + params.data.value;
                                } else {
                                    return params.data.name;
                                }
                            };
                            return Object.assign(baseLabel, {
                                position: 'bottom',
                                rotate: 90,
                                verticalAlign: 'middle',
                                align: 'right',
                                formatter
                            });
                        default:
                            formatter = function(params) {
                                if (params.data.value !== undefined && params.data.value !== null) {
                                    return params.data.name + '  ' + params.data.value;
                                } else {
                                    return params.data.name;
                                }
                            };
                            return Object.assign(baseLabel, {
                                position: 'left',
                                verticalAlign: 'middle',
                                align: 'right',
                                fontSize: this.nodeFontsize || 10,
                                formatter
                            });
                    }
              }
            })(),
            itemStyle: {
                color: this.treeNodeColor || '#99C3D6', 
            },
            leaves: {
                label: (() => {
                    if (this.seriesLayout === 'radial') {
                        return ;
                    } else {
                        switch (this.seriesType) {
                            case 'RL':
                                return {
                                    position: 'left',
                                    verticalAlign: 'middle',
                                    align: 'right'
                                };
                            case 'LR':
                                return {
                                    position: 'right',
                                    verticalAlign: 'middle',
                                    align: 'left'
                                };
                            case 'TB':
                                return {
                                    position: 'bottom',
                                    rotate: -90,
                                    verticalAlign: 'middle',
                                    align: 'left'
                                };
                            case 'BT':
                                return {
                                    position: 'top',
                                    rotate: 90,
                                    verticalAlign: 'middle',
                                    align: 'left'
                                };
                            default:
                                return {
                                    position: 'right',
                                    verticalAlign: 'middle',
                                    align: 'left'
                                };
                        }
                    }
                })()
            },
            emphasis: {
                focus: 'descendant'
            },
            expandAndCollapse: true,
            animationDuration: 550,
            animationDurationUpdate: 750
          }
        ]
      };
      console.log("option.series", option.series)
      console.log("this.nodeHighLigbt", this.nodeHighLigbt)

      if (this._eChart) { echarts.dispose(this._eChart) }
      const eChart = this._eChart = echarts.init(this._root, 'main')
      eChart.setOption(option) 

      eChart.on('click', (params) => {
        // https://echarts.apache.org/en/api.html#events.Mouse%20events
        const { seriesIndex, seriesName, dataIndex, data, name } = params
        this._selectedDataPoint = { seriesIndex, seriesName, dataIndex, data, name }

        this.dispatchEvent(new Event('onClick'))
      })
    }
  }

  customElements.define('com-sap-sac-en-tree-main', Main)
})()
