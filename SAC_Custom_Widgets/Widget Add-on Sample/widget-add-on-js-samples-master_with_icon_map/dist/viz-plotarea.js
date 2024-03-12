(function(){
    const OverlayContainerTemplate = document.createElement('template');
    OverlayContainerTemplate.innerHTML = `
        <style>
            .chart-overlay-container {
                position: relative;
                pointer-events: none;
                overflow: hidden;
            }
            .series-data-marker-container {
                background-color: transparent;
            }
            .series-bar-column {
                width: 100%;
                height: 100%;
            }
            .axis-label-container {
                position: absolute;
                display: flex;
                height: 18px;
                flex-flow: row nowrap;
                align-items: center;
                justify-content: flex-end;
                background-color: transparent;
            }
            .axis-label {
                text-overflow: ellipsis;
            }
            .axis-label-icon {
                padding-left: 4px;
            }
            .common-label {
                position: absolute;
                display: flex;
                flex-flow: row nowrap;
                align-items: center;
            }
        </style>
        <div class="chart-overlay-container"/>
    `;

    const DataMarkerTemplate = document.createElement('template');
    DataMarkerTemplate.innerHTML = `<div class="series-data-marker-container">
    </div>`;

    const AxisLabelTemplate = document.createElement('template');
    AxisLabelTemplate.innerHTML = `
        <span class="axis-label-container">
            <span class="axis-label"></span>
            <img class="axis-label-icon"
                width="22"
                height="22"
            >
        </span>
    `;

    const plotareaIconMap = {
        'California': 'https://fp68static.cfapps.eu10-004.hana.ondemand.com/sap-icons/Location.png',
        'Nevada': 'https://fp68static.cfapps.eu10-004.hana.ondemand.com/sap-icons/Location.png',
        'Oregon': 'https://fp68static.cfapps.eu10-004.hana.ondemand.com/sap-icons/Location.png',
        'Carbonated Drinks': 'https://fp68static.cfapps.eu10-004.hana.ondemand.com/sap-icons/CarbonatedDrinks.png',
        'Juices': 'https://fp68static.cfapps.eu10-004.hana.ondemand.com/sap-icons/Juices.png',
        'Alcohol': 'https://fp68static.cfapps.eu10-004.hana.ondemand.com/sap-icons/Alcohol.png',
        'Others': 'https://fp68static.cfapps.eu10-004.hana.ondemand.com/sap-icons/Others.png',
        'Gross Margin': 'https://fp68static.cfapps.eu10-004.hana.ondemand.com/sap-icons/GrossMargin.png',
        'Discount': 'https://fp68static.cfapps.eu10-004.hana.ondemand.com/sap-icons/Discount.png',
        'Original Sales Price': 'https://fp68static.cfapps.eu10-004.hana.ondemand.com/sap-icons/Price.png',
        'City': 'https://fp68static.cfapps.eu10-004.hana.ondemand.com/sap-icons/City.png',
        'Info': 'https://fp68static.cfapps.eu10-004.hana.ondemand.com/sap-icons/Info.png',
    };

    const SVG_NS = 'http://www.w3.org/2000/svg';

    const setElementAttributes = (element, attribute) => {
        Object.entries(attribute || {}).forEach(([key, value]) => {
            element?.setAttribute(key, value);
        });
    };

    const getTextInMillian = (value) => {
        const numberValue = Number(value);
        if (isNaN(numberValue)) {
            return NaN;
        }
        const inMillian = (numberValue / 1000000).toFixed(0);
        return `${inMillian}M`;
    }

    class ChartPlotareaComponent extends HTMLElement {

        constructor() {
            super();

            // Set default values for user settings
            this._rounded = true;
            this._donutDataLabel = true;
            this._dataMarkerSize = 100;
            this._donutDataLabelSize = 100;
            this._axisLabelColor = '#333';

            // Initialize shadow root and container element
            this._shadowRoot = this.attachShadow({mode: 'open'});
            const container = OverlayContainerTemplate.content.cloneNode(true);
            this._containerElement = container.querySelector('.chart-overlay-container');
            this._shadowRoot.appendChild(container);
        }

        /**
         * Render the plotarea of chart
         * @returns
         */
        render() {
            this._containerElement.innerHTML = '';

            const supportedChartTypes = [
                'barcolumn',
                'stackedbar',
                'line',
                'area',
            ];

            if (!supportedChartTypes.includes(this._chartType)) {
                return;
            }

            const { width: chartWidth, height: chartHeight } = this._size;

            // Clip-path is used to prevent the chart elements are displayed out of viewing range
            const { y: clipPathY, height: clipPathHeight } = this._clipPath;
            this._containerElement.setAttribute(
                'style',
                `position: relative; pointer-events: none; overflow: hidden; width: ${chartWidth + 20}px; height: ${chartHeight}px; clip-path: inset(${clipPathY}px 0 ${chartHeight - clipPathY - clipPathHeight}px 0);`
            );

            this._series.forEach((singleSeries, index) => {
                let sampleDataInfo;

                // Sum up all data point values within a series.
                // This value is used to calculate percentage in donut data label
                const totalSeriesValue = (singleSeries.dataPoints || []).reduce(
                    (sum, current) => {
                        if (!sampleDataInfo) {
                            sampleDataInfo = current.dataInfo;
                        }
                        const labelInfo = current?.labelInfo || {};
                        const pointValue = labelInfo.pointValue;
                        sum += pointValue;
                        return sum;
                    },
                    0
                );

                // We use data marker size as default donut data label size
                const markerSize = this._chartType !== 'barcolumn' || !sampleDataInfo ?
                    undefined :
                    this._isHorizontal ? sampleDataInfo.height : sampleDataInfo.width;

                const options = {
                    color: singleSeries.color,
                    showAsTriangle: singleSeries.showAsTriangle,
                    isLast: index === 0,
                    totalSeriesValue,
                    markerSize,
                };
                // Render a single sesries
                this.renderASeries(singleSeries, options);
            });

            // Render x-axis labels
            this.renderAxisLabels(this._xAxisLabels);

            // Render y-axis labels
            this.renderAxisLabels(this._yAxisLabels);

            // Render x-axis stacked labels
            this.renderAxisStackLabels(this._xAxisStackLabels);

            // Render y-axys stacked labels
            this.renderAxisStackLabels(this._yAxisStackLabels);
        }

        /**
         * Render a single series
         * @param {*} singleSeries
         * @param {*} options
         */
        renderASeries(singleSeries, options) {
            singleSeries.dataPoints.forEach((dataPoint) => {
                const { dataInfo, labelInfo } = dataPoint;
                // Render the data marker for current data point
                this.renderData(dataInfo, options);

                // Render the data label for current data point
                this.renderLabel(labelInfo, options);
            });
        }

        /**
         * Render the data marker with given data marker info
         * @param {*} dataInfo
         * @param {*} options
         * @returns
         */
        renderData(dataInfo, options) {
            if (!dataInfo || dataInfo.hidden || dataInfo.outOfViewport) {
                // Don't render the data marker if it's hidden or out of current viewing range
                return;
            }
            let { x, y, width, height } = dataInfo;

            // Clone the data marker template
            const dataElement = DataMarkerTemplate.content.cloneNode(true);
            const barColumnContainer = dataElement.querySelector('.series-data-marker-container');

            // Calculate the increment of data marker based on user settings
            const increment = Math.max((this._dataMarkerSize - 100) / 100, -1);
            let roundedStyle = '';
            const originalWidth = width;
            const originalHeight = height;

            if (options?.showAsTriangle) {
                // Handle the "Show As" case selected on chart builder panel
                width = height = (Math.min(originalWidth, originalHeight) / 2) * (1 + increment);
                x = width === originalWidth ? x : x + (originalWidth - width) / 2;
                y = height === originalHeight ? y : y + (originalHeight - height) / 2;
                roundedStyle = `border-radius: ${height/2 + 3}px;`;
            } else {
                switch(this._chartType) {
                case 'barcolumn':
                case 'stackedbar':
                    if (this._isHorizontal) {
                        height = height * (1 + increment);
                        y = y - originalHeight * increment / 2;
                        if (this._chartType === 'stackedbar' && !options.isLast) {
                            // For stacked bar chart, only the last data marker in a series
                            // should be rounded
                            break;
                        }
                        roundedStyle = `border-radius: 0 ${height / 2}px ${height / 2}px 0;`;
                    } else {
                        width = width * (1 + increment);
                        x = x - originalWidth * increment / 2;
                        if (this._chartType === 'stackedbar' && !options.isLast) {
                            // For stacked column chart, only the last data marker in a series
                            // should be rounded
                            break;
                        }
                        roundedStyle = `border-radius: ${width / 2}px ${width / 2}px 0 0;`;
                    }
                    break;
                case 'line':
                case 'area':
                    width = width * (1 + increment);
                    height = height * (1 + increment);
                    x = x - width * increment / 2;
                    y = y - height * increment / 2;
                    // For line chart and area chart, data markers will be displayed as circles
                    roundedStyle = `border-radius: ${height/2}px;`;
                    break;
                }
            }

            const color = dataInfo.color || options.color;

            // Set data marker color
            const backgroundStyle = options?.showAsTriangle ?
                `border: ${color} solid 3px;` :
                `background-color: ${color};`;

            // If rounded is false, don't use the roundedStyle
            const barStyle = this._rounded ? `${backgroundStyle} ${roundedStyle}` : backgroundStyle;
            barColumnContainer.setAttribute(
                'style',
                `${barStyle} position: absolute; top: ${y}px; left: ${x}px; width: ${width}px; height: ${height}px;${dataInfo.opacity !== undefined ? `opacity: ${dataInfo.opacity};` : ''}`
            );
            this._containerElement.appendChild(dataElement);
        }

        /**
         * Render the data label with given data label info
         * @param {*} labelInfo
         * @param {*} options
         * @returns
         */
        renderLabel(labelInfo, options) {
            if (!labelInfo) {
                // We didn't check hidden and outOfViewport here because we want to display
                // every donut data label for the chart to have better visual effect
                return;
            }
            if (Array.isArray(labelInfo)) {
                // If labelInfo is an array, then render it recursively
                labelInfo.forEach((label) => {
                    this.renderLabel(label, options);
                });
                return;
            }
            const { x, y, width, height, varianceLabelType, color, fontSize, pointValue, hidden, outOfViewport } = labelInfo;

            const bgColor = 'transparent';

            // Set data label font color
            let labelColor = this._chartType.startsWith('stacked') ? '#666' : options.color;
            if (varianceLabelType !== undefined) {
                // Use the original variance label color
                labelColor = color;
            }
            let labelElement;

            // Donut data label is only available for bar/column chart
            if (this._donutDataLabel && this._chartType === 'barcolumn' && options.markerSize > 0 && !isNaN(options.totalSeriesValue)) {
                const markerSize = options.markerSize;

                // The ratio of current point value in total series value
                const ratio = pointValue / options.totalSeriesValue;

                labelElement = document.createElement('div');
                const left = this._isHorizontal ? x : x + width / 2 - markerSize / 2;
                const top = this._isHorizontal ? y + height / 2 - markerSize / 2 : y + height - markerSize;
                labelElement.setAttribute(
                    'style',
                    `background: transparent; position: absolute; top: ${top}px; left: ${left}px; width: ${markerSize}px; height: ${markerSize}px`
                );

                // Calculate the data label SVG donut chart size
                const donutLabelSizeRadio = this._donutDataLabelSize / 100;
                const labelSvg = document.createElementNS(SVG_NS, 'svg');
                const labelSvgSize = markerSize * donutLabelSizeRadio + 2;
                const positionOffset = (markerSize - labelSvgSize) / 2;

                const svgAttr = {
                    width: labelSvgSize,
                    height: labelSvgSize,
                    // Re-position the SVG donut chart size
                    transform: `translate(${positionOffset}, ${positionOffset})`
                };
                setElementAttributes(labelSvg, svgAttr);
                labelElement.appendChild(labelSvg);

                // Create a SVG group element
                const labelGroup = document.createElementNS(SVG_NS, 'g');
                labelSvg.appendChild(labelGroup);

                // Create a SVG circle element to display the donut background
                const circleElement = document.createElementNS(SVG_NS, 'circle');

                // Calculate the circle's position, radius and stroke width
                const strokeWidth = (markerSize * .12 * donutLabelSizeRadio);
                const circleRadius = (markerSize - strokeWidth) / 2 * donutLabelSizeRadio;
                const circleAttr = {
                    cx: labelSvgSize / 2,
                    cy: labelSvgSize / 2,
                    r: circleRadius,
                    fill: 'transparent',
                    stroke: '#ccc',
                    'stroke-width': strokeWidth,
                };
                setElementAttributes(circleElement, circleAttr);
                labelGroup.appendChild(circleElement);

                // Create a SVG path element to display the donut value
                const pathElement = document.createElementNS(SVG_NS, 'path');
                // Calculate the angle of donut value
                const theta = ratio > 0.5 ? - Math.PI * ratio : Math.PI * ratio;
                // We should draw the large arc for ratio that is bigger than 50%
                const largeArc = ratio > 0.5 ? 1 : 0;

                // Calculate the d property of the path element for the donut value
                const maxR = labelSvgSize / 2;
                const outterR = circleRadius + strokeWidth / 2; //maxR * donutLabelSizeRadio;
                const innerR = (outterR - strokeWidth);
                const dCommands = [];
                dCommands.push(`M ${maxR} ${maxR - outterR}`);
                dCommands.push(`a ${outterR} ${outterR} 0 ${largeArc} 1 ${outterR * Math.sin(theta)} ${outterR * (1 - Math.cos(theta))}`);
                dCommands.push(`l ${-strokeWidth * Math.sin(theta)} ${strokeWidth * Math.cos(theta)}`);
                dCommands.push(`A ${innerR} ${innerR} 0 ${largeArc} 0 ${maxR} ${maxR - innerR}`);
                dCommands.push(`Z`);
                const pathAttr = {
                    fill: labelColor,
                    d: dCommands.join(' '),
                };
                setElementAttributes(pathElement, pathAttr);
                labelGroup.appendChild(pathElement);

                // Create a SVG text element to display donut labels
                const textSize = (labelSvgSize - strokeWidth) / 4;
                const textElement = document.createElementNS(SVG_NS, 'text');
                const textAttr = {
                    'text-anchor': 'middle',
                    'font-size': textSize,
                    x: labelSvgSize / 2,
                    y: labelSvgSize / 2,
                };
                setElementAttributes(textElement, textAttr);

                // Create a SVG tspan element to display donut value in millians unit
                const textInMillian = getTextInMillian(pointValue);
                const textInMillianElement = document.createElementNS(SVG_NS, 'tspan');
                textInMillianElement.innerHTML = textInMillian;
                textElement.appendChild(textInMillianElement);

                // Create a SVG tspan element to display the percentage of donut value
                const textInPercentage = `${(ratio * 100).toFixed(0)}%`;
                const textInPercentageElement = document.createElementNS(SVG_NS, 'tspan');
                const textInPercentageAttr = {
                    x: labelSvgSize / 2,
                    dy: '1em'
                };
                setElementAttributes(textInPercentageElement, textInPercentageAttr);
                textInPercentageElement.innerHTML = textInPercentage;
                textElement.appendChild(textInPercentageElement);

                labelGroup.appendChild(textElement);
            } else {
                // Don't display the label if user don't want to use donut data label and
                // current label is hidden or out of viewing range
                if (hidden || outOfViewport) {
                    return;
                }

                // Create a HTML span element to display current data label
                labelElement = document.createElement('span');
                labelElement.classList.add('common-label');
                labelElement.setAttribute(
                    'style',
                    `background-color: ${bgColor}; position: absolute; top: ${y}px; left: ${x}px; width: ${width}px; height: ${height}px; color: ${labelColor}; font-size: ${fontSize};`
                );
                labelElement.innerHTML = labelInfo.formattedValue;
            }

            this._containerElement.appendChild(labelElement);
        }

        /**
         * Get icon based on name
         * @param {*} key
         */
        getIcon(name) {
            const customIconMap = this._customIconMap || {};
            return customIconMap[name] || plotareaIconMap[name];
        }

        /**
         * Render a single axis label
         * @param {*} label
         * @returns
         */
        renderAxisLabel(label) {
            if (!label) {
                return;
            }
            const { x, y, width, height, pointValue, formattedValue, fontSize } = label;
            const labelEl = AxisLabelTemplate.content.cloneNode(true);
            const labelContainer = labelEl.querySelector('.axis-label-container');
            const bgColor = 'transparent';
            labelContainer.setAttribute('style', `background-color: ${bgColor}; width: ${width + 36}px; left: ${x - 30}px; top: ${y - 2}px; font-size: ${fontSize};`);
            this._containerElement.appendChild(labelEl);

            const labelSpan = labelContainer.querySelector('.axis-label');
            const _axisLabelColor = this._axisLabelColor;
            labelSpan.setAttribute('style', `color: ${_axisLabelColor}`);
            labelSpan.innerHTML = formattedValue;

            const iconImg = labelContainer.querySelector('img');
            iconImg.setAttribute('src', this.getIcon(pointValue) || this.getIcon('City') || this.getIcon('Info'));
        };

        /**
         * Render axis labels with given axis label array
         * @param {*} axisLabels
         */
        renderAxisLabels(axisLabels) {
            if (axisLabels && !Array.isArray(axisLabels)) {
                this.renderAxisLabel(axisLabels);
            } else {
                axisLabels.forEach((labels) => this.renderAxisLabels(labels));
            }
        }

        /**
         * Render a stacked label with given stackedLabelInfo
         * @param {*} stackLabelInfo
         * @returns
         */
        renderAxisStackLabel(stackLabelInfo) {
            if (!stackLabelInfo) {
                return;
            }
            const stackLabelSpan = document.createElement('span');
            stackLabelSpan.classList.add('common-label');
            const axisLabelColor = this._axisLabelColor;
            const bgColor = 'transparent';
            const {
                x, y, width, height, formattedValue, fontSize
            } = stackLabelInfo;
            stackLabelSpan.setAttribute(
                'style',
                `background-color: ${bgColor}; color: ${axisLabelColor}; top: ${y}px; left: ${x}px; width: ${width}px; height: ${height}px; font-size: ${fontSize};`
            );
            stackLabelSpan.textContent = formattedValue;
            this._containerElement.appendChild(stackLabelSpan);
        }

        /**
         * Render stacked labels with given stack label array
         * @param {*} axisStackLabels
         * @returns
         */
        renderAxisStackLabels(axisStackLabels) {
            if (!axisStackLabels) {
                return;
            }
            if (axisStackLabels && !Array.isArray(axisStackLabels)) {
                this.renderAxisStackLabel(axisStackLabels);
            } else {
                axisStackLabels.forEach((stackLabels) => {
                    this.renderAxisStackLabels(stackLabels);
                });
            }
        }

        /**
         * Set the extensionData to this web component.
         * Called by SAP Analytics Cloud widget add-on extension framework to pass the formatted
         * widget extension data to this web component.
         * @param {*} extensionData
         */
        setExtensionData(extensionData) {
            const {
                chartType,
                isHorizontal,
                chartSize,
                clipPath,
                series,
                xAxisLabels,
                xAxisStackLabels,
                yAxisLabels,
                yAxisStackLabels,
            } = extensionData;
            this._size = chartSize;
            this._clipPath = clipPath;
            this._series = series;
            this._xAxisLabels = xAxisLabels;
            this._yAxisLabels = yAxisLabels;
            this._xAxisStackLabels = xAxisStackLabels;
            this._yAxisStackLabels = yAxisStackLabels;
            this._chartType = chartType;
            this._isHorizontal = isHorizontal;
            this.render();
        }

        /**
         * User settings to set if data marker should be rounded
         */
        set rounded(value) {
            this._rounded = value;
            this.render();
        }

        /**
         * User settings to set if data label should be displayed as a donut chart
         */
        set donutDataLabel(value) {
            this._donutDataLabel = value;
            this.render();
        }

        /**
         * User settings to set the donut data label size.
         * It's a percentagbe value, which means 100 is the original value
         */
        set donutDataLabelSize(value) {
            this._donutDataLabelSize = value;
            this.render();
        }

        /**
         * User settings to set the data markder size.
         * It's a percentagbe value, which means 100 is the original value
         */
        set dataMarkerSize(value) {
            this._dataMarkerSize = value;
            this.render();
        }

        /**
         * User settings to set the axis label color
         */
        set axisLabelColor(value) {
            this._axisLabelColor = value;
            this.render();
        }

        /**
         * Custom icons specified by user
         */
        set customIconMap(value) {
            this._customIconMap = value;
            this.render();
        }
    }

    customElements.define('viz-plotarea', ChartPlotareaComponent);
})();
