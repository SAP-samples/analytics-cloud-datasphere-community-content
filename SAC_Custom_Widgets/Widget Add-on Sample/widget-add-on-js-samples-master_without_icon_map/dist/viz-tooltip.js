const rowTemplate = document.createElement('template');
rowTemplate.innerHTML = `
    <div class="tooltip-row">
        <img class="entry-icon"
            width="22"
            height="22"
        >
        <div class="tooltip-row-label">
            <span class="entry-label"></span>
        </div>
    </div>
`;

const containerTemplate = document.createElement('template');
containerTemplate.innerHTML = `
    <style>
        :host {
            display: block;
            min-width: 80px;
            max-width: 250px;
            min-height: 24px;
        }

        .tooltip-container {
            padding: 12px;
            display: flex;
            min-width: 80px;
            min-height: 24px;
            flex-flow: column nowrap;
        }

        .price::before {
            font-family: SAP-icons;
            content: "\\E026";
        }

        .manager::before {
            font-family: SAP-icons;
            content: "\\E036";
        }

        .product::before {
            font-family: SAP-icons;
            content "\\E16D";
        }

        .location::before {
            font-family: SAP-icons;
            content "\\E021\";
        }

        .store::before {
            font-family: SAP-icons;
            content "\\E00F";
        }

        .tooltip-row {
            display: flex;
            min-height: 30px;
            flex-flow: row nowrap;
            align-items: center;
        }

        .tooltip-row-label {
            display: flex;
            flex-flow: column nowrap;
            flex: auto;
        }

        .tooltip-row-label progress {
            height: 6px;
            width: 100%;
            border-radius: 0;
        }

        .tooltip-row-label progress::-webkit-progress-bar {
            color: lightblue;
            background-color: #eee;
        }

        .tooltip-row-label progress::-webkit-progress-value {
            background-color: red;
        }

        .tooltip-row:not(:last-of-type) {
            border-bottom: solid 1px #e6e7e8;
        }

        .entry-icon {
            display: inline-block;
            padding-right: 12px;
        }

        .entry-label {
            display: inline-block;
            flex: auto;
            vertical-align: middle;
        }
    </style>
    <div class="tooltip-container">
    </div>

`;

const tooltipIconMap = {
    'Location': 'https://www.iconpacks.net/icons/2/free-icon-pin-location-4345.png',
    'Product': 'https://www.iconpacks.net/icons/3/free-delivery-box-icon-11395.png',
    'Sales Manager': 'https://www.iconpacks.net/icons/3/free-icon-manager-9843.png',
    'Date': 'https://www.iconpacks.net/icons/3/free-icon-calendar-11024.png',
    'Store': 'https://www.iconpacks.net/icons/3/free-icon-shop-11327.png',
    'Category': 'https://www.iconpacks.net/icons/2/free-icon-category-grid-5750.png',
    'Price (fixed)': 'https://www.iconpacks.net/icons/2/free-icon-price-label-2043.png',
    'Quantity Sold': 'https://www.iconpacks.net/icons/3/free-icon-packages-9285.png',
    'California': 'https://www.iconpacks.net/icons/3/free-hotel-icon-9215.png',
    'Nevada': 'https://www.iconpacks.net/icons/4/free-school-building-icon-12440.png',
    'Oregon': 'https://www.iconpacks.net/icons/2/free-hotel-icon-3453.png',
    'Carbonated Drinks': 'https://www.iconpacks.net/icons/2/free-martini-icon-1859.png',
    'Juices': 'https://www.iconpacks.net/icons/2/free-lemonade-icon-1853.png',
    'Alcohol': 'https://www.iconpacks.net/icons/2/free-wine-icon-2344.png',
    'Others': 'https://www.iconpacks.net/icons/2/free-icon-wine-toast-2345.png',
    'Gross Margin': 'https://www.iconpacks.net/icons/3/free-icon-gold-coins-6373.png',
    'Discount': 'https://www.iconpacks.net/icons/free-icons-6/free-red-sales-price-tag-or-discount-sticker-icon-18979.png',
    'Original Sales Price': 'https://www.iconpacks.net/icons/2/free-icon-euro-coin-2151.png',
    'City': 'https://www.iconpacks.net/icons/2/free-icon-hotel-3447.png',
    'Info': 'https://www.iconpacks.net/icons/free-icons-6/free-blue-information-button-icon-18667.png',
};

/**
 * Convert a tooltip extension data entry to a row on tooltip UI
 * @param {*} entry
 * @param {*} withPercentageBar
 * @param {*} max
 * @returns
 */
const tooltipEntryToRow = (
    entry,
    withPercentageBar = false,
    max = 100,
) => {
    const rowElement = rowTemplate.content.cloneNode(true);
    const iconEl = (rowElement).querySelector('.entry-icon');
    const labelEl = (rowElement).querySelector('.entry-label');
    iconEl.setAttribute('src', tooltipIconMap[entry.value] || tooltipIconMap[entry.title] || tooltipIconMap['Info']);
    iconEl.setAttribute('title', entry.title);
    labelEl.textContent = entry.value;

    // Draw a thresh hold percentage bar for a measure if needed
    if (withPercentageBar) {
        const numberRegexp = /[.0-9]+/;
        if (!numberRegexp.test(entry.value)) {
            return;
        }
        const percentageBar = document.createElement('progress');
        percentageBar.value = Number(/[.0-9]+/.exec(entry.value)[0]);
        percentageBar.max = max;
        const rowLabelDiv = (rowElement).querySelector('.tooltip-row-label');
        rowLabelDiv.appendChild(percentageBar);
    }

    return rowElement;
}

class VizTooltip extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(containerTemplate.content.cloneNode(true));

        this._tooltipContainer = this._shadowRoot.querySelector('.tooltip-container');

        // Set default values for user settings
        this._props = { };
        this._max = 100;
        this._color = 'lightblue';

        this.render();
    }

    /**
     * Render the custom tooltip
     */
    render() {
        this._tooltipContainer.innerHTML = '';

        // Render tooltip header
        if (this._props.header) {
            this._tooltipContainer.appendChild(tooltipEntryToRow(this._props.header, true, this._max));
        }

        // Render tooltip details
        if (this._props.details) {
            this._props.details?.forEach(detailsRow => {
                this._tooltipContainer.appendChild(tooltipEntryToRow(detailsRow));
            })
        }

        // Set thresh hold color
        if (this._color) {
            const percentageColorReg = /progress::\-webkit\-progress\-value\s+\{\s+background-color:\s+[#a-z0-9]+\s?;\s+}/;
            const styleElement = this._shadowRoot.querySelector('style');
            const styleContent = styleElement.textContent.replace(
                percentageColorReg,
                `progress::-webkit-progress-value { background-color: ${this._color}; }`
            );
            styleElement.innerHTML = styleContent;
        }
    }

    setExtensionData (value) {
        this._props = value;
        this.render();
    }

    /**
     * User settings of the max thresh hold value
     */
    set max(value) {
        this._max = value;
        this.render();
    }

    /**
     * User settings of the thresh hold color
     */
    set color(value) {
        this._color = value;
        this.render();
    }
}

customElements.define('viz-tooltip', VizTooltip);
