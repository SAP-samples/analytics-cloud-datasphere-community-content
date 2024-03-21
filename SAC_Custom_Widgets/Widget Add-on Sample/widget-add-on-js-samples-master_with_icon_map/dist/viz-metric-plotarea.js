(function(){
    const MetricOverlayContainerTemplate = document.createElement('template');

    MetricOverlayContainerTemplate.innerHTML = `
        <style>
            .metric-overlay-container {
                position: relative;
                overflow: hidden;
                height: 100%;
            }
            .label-container {
                position: absolute;
                display: flex;
                height: 18px;
                flex-flow: row nowrap;
                align-items: center;
                justify-content: flex-start;
                background-color: transparent;
            }
            .label {
                text-overflow: ellipsis;
            }
            .label-icon {
                padding-right: 4px;
            }
            .common-label {
                position: absolute;
                display: flex;
                flex-flow: row nowrap;
                align-items: center;
            }
            .metric-number-row {
                position: absolute;
                display: flex;
                min-height: 30px;
                flex-flow: row nowrap;
                align-items: center;
                justify-content: flex-start;
                background-color: transparent;
                pointer-events: auto;
            }
            .metric-progress-bar, .metric-progress-track {
                position: absolute;
                left: 0px;
                opacity: 0;
                background-color: transparent;
            }
            .metric-progress-track {
                width: 0px;
                right: 0px;
            }
            .metric-progress-bar-inner  {
                height: 100%;
                opacity: 0;
                width: 0px;
            }
            .metric-number-row:hover .metric-progress-track {
                opacity: 1;
                width: 100%;
                background-color: #ccc;
                transition:
                    background-color .5s ease-in,
                    width .5s ease-in;
            }
            .metric-number-row:hover .metric-progress-bar {
                opacity: .7;
            }
            .metric-number-row:hover .metric-progress-bar-inner {
                opacity: 1;
                width: 100%;
                transition:
                    width .5s ease-in;
            }
            .metric-number-label {
                position: absolute;
                display: flex;
                flex-flow: column nowrap;
                flex: auto;
            }
            .metric-number {
                display: inline-block;
                flex: auto;
                vertical-align: middle;
            }
        </style>
        <div class="metric-overlay-container"/>
    `;

    const LabelTemplate = document.createElement('template');
    LabelTemplate.innerHTML = `
        <span class="label-container">
            <img class="label-icon"
                width="16"
                height="16"
            >
            <span class="label"></span>
        </span>
    `;

    const numberTemplate = document.createElement('template');
    numberTemplate.innerHTML = `
        <div class="metric-number-row">
            <div class="metric-number-label">
                <span class="metric-number"></span>
            </div>
            <div class="metric-progress-track">
            </div>
            <div class="metric-progress-bar">
                <div class="metric-progress-bar-inner"></div>
            </div>
        </div>
    `;

const metricIconMap = {
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
    'Price (fixed)': 'https://fp68static.cfapps.eu10-004.hana.ondemand.com/sap-icons/Price.png',
};

    class MetricPlotareaComponent extends HTMLElement {

        constructor() {
            super();

            // Set default values for user settings
            this._labelColor = '#666';
            this._numberBarColor = '#488ccc';
            this._numberTrackColor = '#ddd';
            this._max = 100;

            // Initialize shadow root and container element
            this._shadowRoot = this.attachShadow({ mode: 'open' });
            const container = MetricOverlayContainerTemplate.content.cloneNode(true);
            this._containerElement = container.querySelector('.metric-overlay-container');
            this._shadowRoot.appendChild(container);
        }

        /**
         * Render the plotarea of numeric chart
         * @returns
         */
        render() {
            // Render primary rows
            if (this._primaryRows && Array.isArray(this._primaryRows)) {
                this._primaryRows.forEach((row) => this.renderLabel(row.label));
                this._primaryRows.forEach((row) => this.renderNumber(row.number));
            }

            // Render secondary rows
            if (this._secondaryRows && Array.isArray(this._secondaryRows)) {
                this._secondaryRows.forEach((row) => this.renderLabel(row.label));
                this._secondaryRows.forEach((row) => this.renderSecondaryNumber(row.number));
            }
        }

        /**
         * Render a row label
         * @param {*} label
         * @returns
         */
        renderLabel(label) {
            if (!label) {
                return;
            }
            const { x, y, pointValue, formattedValue, fontSize } = label;

            // Clone the row label template
            const labelEl = LabelTemplate.content.cloneNode(true);
            const labelContainer = labelEl.querySelector('.label-container');
            const bgColor = 'transparent';
            labelContainer.setAttribute('style', `background-color: ${bgColor}; width: 100%; left: ${x}px; top: ${y}px; font-size: ${fontSize};`);
            this._containerElement.appendChild(labelEl);

            // Set label style
            const labelSpan = labelContainer.querySelector('.label');
            const _labelColor = this._labelColor;
            labelSpan.setAttribute('style', `color: ${_labelColor}`);
            labelSpan.innerHTML = formattedValue;

            // Set label icon
            const iconImg = labelContainer.querySelector('img');
            iconImg.setAttribute('src', metricIconMap[pointValue] || metricIconMap.City || metricIconMap.Info);
        }

        /**
         * Render a primary row number
         * @param {*} num
         * @returns
         */
        renderNumber(num) {
            if (!num) {
                return;
            }
            const { x, y, height, pointValue, formattedValue, fontSize } = num;

            // Clone the row number template
            const numEl = numberTemplate.content.cloneNode(true);
            const numContainer = numEl.querySelector('.metric-number-row');
            const numLabelEl = numEl.querySelector('.metric-number');
            numContainer.setAttribute('style', `width: 100%; left: ${x}px; top: ${y}px; font-size: ${fontSize};`);
            numLabelEl.textContent = formattedValue;
            this._containerElement.appendChild(numEl);

            // Render completion progress based on row value
            this.renderProgressBar(height, pointValue, numContainer);
        }

        /**
         * Render a value's completion progress
         * @param {*} height
         * @param {*} pointValue
         * @param {*} numContainer
         */
        renderProgressBar (
            height, pointValue, numContainer,
        ) {
            // Don't render progress bar for invalid point value
            if (isNaN(pointValue)) {
                return;
            }

            // Calculate the track height
            const trackHeight = Math.max(height * .15, 3);
            const heightStyle = `height: ${trackHeight}px; bottom: ${-trackHeight / 2}px;`;

            // Set progress track style
            const numberTrackColor = this._numberTrackColor;
            const numberTrackElement = numContainer.querySelector('.metric-progress-track');
            numberTrackElement.setAttribute(
                'style',
                `background-color: ${numberTrackColor}; ${heightStyle}`
            );

            // Calculate the progress percentage and set progress bar style
            const percentage = (pointValue / (this._max * 1000000)).toFixed(2);
            const numberBarElement = numContainer.querySelector('.metric-progress-bar');
            numberBarElement.setAttribute(
                'style',
                `width: ${percentage * 100}%; ${heightStyle}`
            );
            // numberBarInnerElement is used for progress bar animation
            const numberBarInnerElement = numContainer.querySelector('.metric-progress-bar-inner');
            const barColor = this._numberBarColor;
            numberBarInnerElement.setAttribute(
                'style',
                `background: ${barColor};`
            );
        }

        /**
         * Render a secondary row's number
         * @param {*} num
         * @returns
         */
        renderSecondaryNumber(num) {
            if (!num) {
                return;
            }

            // Clone the number template
            const { x, y, width, height, pointValue, formattedValue, fontSize } = num;
            const numEl = numberTemplate.content.cloneNode(true);
            const numContainer = numEl.querySelector('.metric-number-row');
            const numLabelEl = numEl.querySelector('.metric-number');
            const bgColor = 'transparent';
            numContainer.setAttribute('style', `background-color: ${bgColor}; width: ${width + 50}px; left: ${x}px; top: ${y}px; font-size: ${fontSize}; min-height: 16px;`);
            numLabelEl.textContent = formattedValue;
            this._containerElement.appendChild(numEl);

            // Render completion progress based on row value
            this.renderProgressBar(height, pointValue, numContainer);
        }

        /**
         * Set the extensionData to this web component.
         * Called by SAP Analytics Cloud widget add-on extension framework to pass the formatted
         * widget extension data to this web component.
         * @param {*} extensionData
         */
        setExtensionData(extensionData) {
            const {
                chartSize,
                chartType,
                primaryRows,
                secondaryRows,
            } = extensionData;
            this._size = chartSize;
            this._chartType = chartType;
            this._primaryRows = primaryRows;
            this._secondaryRows = secondaryRows;
            this.render();
        }

        /**
         * The row label color
         */
        set labelColor(value) {
            this._labelColor = value;
            this.render();
        }

        /**
         * The bar color of completion progress
         */
        set numberBarColor(value) {
            this._numberBarColor = value;
            this.render();
        }

        /**
         * The track color of completion progress
         */
        set numberTrackColor(value) {
            this._numberTrackColor = value;
            this.render();
        }

        /**
         * The target value of completion progress
         */
        set max(value) {
            this._max = value;
            this.render();
        }
    }

    customElements.define('viz-metric-plotarea', MetricPlotareaComponent);

})();
