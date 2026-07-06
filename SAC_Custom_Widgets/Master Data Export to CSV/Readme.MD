# Dimension Master Data CSV Export

A SAP Analytics Cloud custom widget that exports dimension master data to CSV using the SAC Data Export Service (DES) OData API.

---

## Widget Details

| Field | Value |
|-------|-------|
| Widget ID | `custom.dimMasterExport` |
| Version | `1.0.1` |
| Custom element tag | `custom-dim-master-export` |
| Min. widget size | 460 × 580 px |

---

## Installation

1. Package `/manifest.json` and `/main.js` into a `.zip` file.
2. In SAC, go to **Stories → Custom Widgets** and upload the zip.
3. Or use the upload script: `node test_upload_widget.js`

> After uploading a new version, do a hard reload (Ctrl+Shift+R) on any open story tab to clear the browser's custom element cache.

---

## Adding the Widget to a Story

1. Open or create a **Canvas** story in SAC.
2. In the toolbar, go to **Insert → Add → Custom Widgets**.
3. Click **Custom Widgets** (click, not just hover) to expand the submenu.
4. Select **Dimension Master Data CSV Export**.
5. The widget appears on the canvas. Resize it to at least 460 × 580 px.

> There is no Builder panel — all configuration is done directly inside the widget at runtime.

---

## How to Use

All inputs are inside the widget itself on the canvas.

### Export a model-bound dimension

1. Wait for the **Model** dropdown to finish loading (shows *Loading available models…*).
2. Type part of the model name to filter, then select it from the list.
3. Wait for the **Dimension** dropdown to load, then select the dimension.
4. *(Optional)* Check **Include Hierarchy** to add parent-child columns.
5. *(Optional)* Enter column names in **Columns ($select)** or a row filter in **Filter ($filter)**.
6. Set a **Filename Prefix** if needed (default: `MasterData`).
7. Click **↓ Export CSV** to download the file.

### Export a public dimension

1. Check the **Public Dimension** checkbox — the Model and Dimension dropdowns are replaced by a single public dimension picker.
2. Click the **Public Dimension** field and wait for the list to load on first use.
3. Type to filter, then select the dimension.
4. Click **↓ Export CSV**.

### Discover available entity sets

Click **🔍 Discover** to list all OData entity sets available for the selected model/dimension. Useful for checking whether hierarchy export is supported before attempting it.

### Preview data

Click **👁 Preview (20 rows)** to fetch and display the first 20 rows before running a full export.

---

## Widget Fields Reference

| Field | Description |
|-------|-------------|
| Model | Searchable dropdown of all DES providers. Type to filter. |
| Dimension | Loaded after a model is selected. Type to filter. |
| Public Dimension | Replaces Model + Dimension when public dimension mode is checked. |
| Include Hierarchy | Fetches the `WithHierarchy` entity set for parent-child columns. Auto-disabled if not available. |
| Columns ($select) | Comma-separated column names to include. Empty = all columns. |
| Filter ($filter) | OData filter expression (e.g. `Country eq 'DE'`). Empty = all rows. |
| Filename Prefix | Prefix for the downloaded CSV filename. Default: `MasterData`. |

---

## Large Exports

For dimensions with more than 100,000 members, the widget automatically splits the output into multiple files (`_part1.csv`, `_part2.csv`, …) to prevent browser memory issues.

