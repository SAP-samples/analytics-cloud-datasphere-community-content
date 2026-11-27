/**
 * SAC Custom Widget: Dimension Master Data CSV Export  v1.0.1
 *
 * v1.0.1 changes:
 *   - Export: streaming CSV build — row objects discarded page-by-page, never held fully in RAM.
 *   - Export: auto-split into multiple files at 100,000 rows each (_part1, _part2, …).
 *     Prevents browser tab OOM crash on large dimensions (e.g. 1M+ master data rows).
 */

(function () {
  "use strict";

  // ── Styles ────────────────────────────────────────────────────────────────
  const STYLES = `
    :host {
      display: block;
      font-family: '72','SAP 72',Arial,sans-serif;
      min-width: 460px;
      min-height: 580px;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    .root {
      display: flex; flex-direction: column; gap: 10px;
      padding: 16px; height: 100%; font-size: 13px; color: #32363a;
      background: #fff; border: 1px solid #d9d9d9; border-radius: 6px;
      overflow: auto;
    }

    .hdr { display:flex; align-items:center; gap:8px; border-bottom:1px solid #e4e4e4; padding-bottom:10px; }
    .hdr svg { flex-shrink:0; }
    .hdr-title { font-size:14px; font-weight:700; color:#0a6ed1; flex:1; }
    .hdr-ver { font-size:10px; color:#8c8c8c; }

    .sec-title {
      font-size:10px; font-weight:700; color:#0a6ed1; text-transform:uppercase;
      letter-spacing:.4px; border-bottom:1px solid #e4e4e4; padding-bottom:4px;
      margin-top:4px;
    }

    .grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
    .full { grid-column: 1 / -1; }
    .fld { display:flex; flex-direction:column; gap:2px; }
    label { font-size:10px; font-weight:600; color:#6a6d70; text-transform:uppercase; letter-spacing:.3px; }

    /* ── Searchable combo ─────────────────────────────────────────────── */
    .combo { position:relative; }
    .combo-input {
      border:1px solid #c4c4c4; border-radius:4px; padding:5px 28px 5px 8px;
      font-size:12px; color:#32363a; background:#fff; outline:none; width:100%;
      transition:border-color .15s; cursor:text;
    }
    .combo-input:focus { border-color:#0a6ed1; }
    .combo-input:disabled { background:#f4f4f4; color:#8c8c8c; cursor:not-allowed; }
    .combo-arrow {
      position:absolute; right:6px; top:50%; transform:translateY(-50%);
      pointer-events:none; color:#8c8c8c; font-size:10px;
    }
    .combo-list {
      position:absolute; z-index:999; top:calc(100% + 2px); left:0; right:0;
      background:#fff; border:1px solid #c4c4c4; border-radius:4px;
      max-height:220px; overflow-y:auto; box-shadow:0 4px 12px rgba(0,0,0,.12);
    }
    .combo-list.hidden { display:none; }
    .combo-opt {
      padding:6px 10px; font-size:12px; cursor:pointer; white-space:nowrap;
      overflow:hidden; text-overflow:ellipsis;
    }
    .combo-opt:hover, .combo-opt.focused { background:#e8f3fc; }
    .combo-opt.selected { background:#d0e8f8; font-weight:600; }
    .combo-empty { padding:6px 10px; font-size:12px; color:#8c8c8c; font-style:italic; }

    input[type=text] {
      border:1px solid #c4c4c4; border-radius:4px; padding:5px 8px;
      font-size:12px; color:#32363a; background:#fff; outline:none; width:100%;
      transition:border-color .15s;
    }
    input[type=text]:focus { border-color:#0a6ed1; }
    .hint { font-size:10px; color:#8c8c8c; margin-top:1px; }
    .path { font-size:10px; color:#6a6d70; margin-top:2px; font-style:italic; }

    .tog { display:flex; align-items:center; gap:7px; }
    .tog label { text-transform:none; font-size:12px; color:#32363a; cursor:pointer; font-weight:400; letter-spacing:0; }
    input[type=checkbox] { width:14px; height:14px; accent-color:#0a6ed1; cursor:pointer; }
    input[type=checkbox]:disabled { cursor:not-allowed; opacity:0.5; }

    .btn-row { display:flex; gap:8px; flex-wrap:wrap; }
    .btn {
      border-radius:4px; padding:8px 14px; font-size:12px; font-weight:600;
      cursor:pointer; display:flex; align-items:center; gap:6px;
      transition:background .15s; border:1px solid transparent;
    }
    .btn:disabled { opacity:.55; cursor:not-allowed; }
    .btn-primary   { background:#0a6ed1; color:#fff; border-color:#0a6ed1; flex:1; justify-content:center; }
    .btn-primary:hover:not(:disabled)   { background:#0854a0; border-color:#0854a0; }
    .btn-secondary { background:#fff; color:#0a6ed1; border-color:#0a6ed1; }
    .btn-secondary:hover:not(:disabled) { background:#e8f3fc; }
    .btn-ghost     { background:#fff; color:#6a6d70; border-color:#c4c4c4; font-size:11px; padding:5px 10px; }
    .btn-ghost:hover:not(:disabled) { background:#f7f7f7; }

    .status {
      border-radius:4px; padding:7px 10px; font-size:12px;
      display:flex; align-items:center; gap:6px; min-height:32px;
    }
    .s-idle    { background:#f4f4f4; color:#6a6d70; }
    .s-loading { background:#e8f3fc; color:#0a6ed1; }
    .s-ok      { background:#f0faf0; color:#107e3e; }
    .s-err     { background:#fff5f5; color:#bb0000; }

    .prog-wrap { background:#e4e4e4; border-radius:4px; height:4px; overflow:hidden; }
    .prog-bar  { height:4px; background:#0a6ed1; border-radius:4px; transition:width .3s; }

    .tbl-wrap { overflow:auto; border:1px solid #e4e4e4; border-radius:4px; max-height:200px; flex:1; }
    table { border-collapse:collapse; width:100%; font-size:11px; }
    th { background:#0a6ed1; color:#fff; padding:5px 8px; text-align:left; white-space:nowrap; position:sticky; top:0; font-weight:600; }
    td { padding:4px 8px; border-bottom:1px solid #f0f0f0; white-space:nowrap; max-width:180px; overflow:hidden; text-overflow:ellipsis; }
    tr:hover td { background:#f7f8f9; }
    .tbl-info { font-size:11px; color:#6a6d70; text-align:right; margin-top:3px; }

    .spin { display:inline-block; width:12px; height:12px; flex-shrink:0; border:2px solid currentColor; border-right-color:transparent; border-radius:50%; animation:spin .6s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .hidden { display:none !important; }
  `;

  // ── Template ─────────────────────────────────────────────────────────────
  const TPL = `
  <div class="root">

    <div class="hdr">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
           stroke="#0a6ed1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      <span class="hdr-title">Dim Master Data Export</span>
      <span class="hdr-ver">v1.0.1</span>
    </div>

    <div class="sec-title">Dimension Source</div>

    <div class="grid">

      <div class="fld full">
        <div class="tog">
          <input type="checkbox" id="chkPublic"/>
          <label for="chkPublic">Public Dimension (no model needed)</label>
        </div>
      </div>

      <!-- Model combo (hidden in public mode) -->
      <div class="fld full" id="grpModel">
        <label>Model <span style="color:#e9730c">*</span></label>
        <div class="combo" id="comboModel">
          <input class="combo-input" id="inpModel" placeholder="Type to search models…" autocomplete="off" disabled/>
          <span class="combo-arrow">▾</span>
          <div class="combo-list hidden" id="lstModel"></div>
        </div>
        <div class="hint" id="hintModel">Loading available models…</div>
        <div class="path hidden" id="pathModel"></div>
      </div>

      <!-- Dimension combo (hidden in public mode) -->
      <div class="fld full" id="grpDim">
        <label>Dimension <span style="color:#e9730c">*</span></label>
        <div class="combo" id="comboDim">
          <input class="combo-input" id="inpDim" placeholder="Select a model first…" autocomplete="off" disabled/>
          <span class="combo-arrow">▾</span>
          <div class="combo-list hidden" id="lstDim"></div>
        </div>
        <div class="hint" id="hintDim">Select a model to load its dimensions.</div>
      </div>

      <!-- Public dimension combo (shown only in public mode) -->
      <div class="fld full hidden" id="grpPubDim">
        <label>Public Dimension <span style="color:#e9730c">*</span></label>
        <div class="combo" id="comboPubDim">
          <input class="combo-input" id="inpPubDim" placeholder="Click to load public dimensions…" autocomplete="off" disabled/>
          <span class="combo-arrow">▾</span>
          <div class="combo-list hidden" id="lstPubDim"></div>
        </div>
        <div class="hint" id="hintPubDim">Click the field to load available public dimensions.</div>
        <div class="path hidden" id="pathPubDim"></div>
      </div>

    </div>

    <div class="sec-title">Export Options</div>
    <div class="grid">
      <div class="fld full">
        <div class="tog">
          <input type="checkbox" id="chkHier"/>
          <label for="chkHier" id="lblHier">Include Hierarchy (adds PARENTID, PREVID, ORDERID columns)</label>
        </div>
      </div>
      <div class="fld full">
        <label for="inpSel">Columns ($select) &#8211; optional</label>
        <input type="text" id="inpSel" placeholder="ID,Description,ParentID  (empty = all columns)"/>
      </div>
      <div class="fld full">
        <label for="inpFlt">Filter ($filter) &#8211; optional</label>
        <input type="text" id="inpFlt" placeholder="e.g. ParentID eq 'ROOT'"/>
      </div>
      <div class="fld">
        <label for="inpPfx">Filename Prefix</label>
        <input type="text" id="inpPfx" value="MasterData"/>
      </div>
      <div class="fld" style="align-self:flex-end">
        <button class="btn btn-ghost" id="btnDiscover">&#128269; Discover Entity Sets</button>
      </div>
    </div>

    <div class="btn-row">
      <button class="btn btn-secondary" id="btnPreview">&#128065; Preview (20)</button>
      <button class="btn btn-primary"   id="btnExport">&#8595; Export CSV</button>
    </div>

    <div class="status s-idle" id="statusBar">
      <span id="statusIco">&#8505;</span>
      <span id="statusTxt">Select a model and dimension, then click Export CSV.</span>
    </div>
    <div class="prog-wrap hidden" id="progWrap">
      <div class="prog-bar" id="progBar" style="width:0%"></div>
    </div>

    <div id="previewSec" class="hidden">
      <div class="tbl-wrap"><table id="previewTbl"></table></div>
      <div class="tbl-info" id="tblInfo"></div>
    </div>

  </div>`;

  // ── Combo helper ─────────────────────────────────────────────────────────
  class Combo {
    constructor(root, inputId, listId) {
      this._inp  = root.querySelector('#' + inputId);
      this._lst  = root.querySelector('#' + listId);
      this._items  = [];   // { value, label, title }
      this._value  = '';
      this._open   = false;
      this._focusIdx = -1;
      this.onChange = null;
      this._wire();
    }
    _wire() {
      this._inp.addEventListener('input',   () => this._filter());
      this._inp.addEventListener('focus',   () => this._show());
      this._inp.addEventListener('mousedown', e => { if (this._open) { e.preventDefault(); this._hide(); } else this._show(); });
      this._inp.addEventListener('keydown',  e => this._key(e));
      document.addEventListener('mousedown', e => {
        if (!this._inp.contains(e.target) && !this._lst.contains(e.target)) this._hide();
      });
    }
    setItems(items) {
      this._items = items;
      this._render(items);
    }
    setValue(v, label) {
      this._value = v;
      this._inp.value = label || (this._items.find(i => i.value === v)?.label ?? v);
      this._render(this._items);
    }
    getValue() { return this._value; }
    enable(v) { this._inp.disabled = !v; if (!v) { this._hide(); } }
    reset(placeholder) {
      this._value = ''; this._inp.value = '';
      if (placeholder) this._inp.placeholder = placeholder;
      this._render([]);
    }
    _show() {
      if (this._inp.disabled) return;
      this._open = true;
      this._filter();
      this._lst.classList.remove('hidden');
    }
    _hide() {
      this._open = false;
      this._lst.classList.add('hidden');
      this._focusIdx = -1;
      // If no valid selection, restore label
      if (!this._value) this._inp.value = '';
      else {
        const found = this._items.find(i => i.value === this._value);
        if (found) this._inp.value = found.label;
      }
    }
    _filter() {
      const q = this._inp.value.toLowerCase();
      const filtered = q
        ? this._items.filter(i => i.label.toLowerCase().includes(q))
        : this._items;
      this._render(filtered);
      if (!this._open) { this._open = true; this._lst.classList.remove('hidden'); }
    }
    _render(items) {
      if (items.length === 0) {
        this._lst.innerHTML = '<div class="combo-empty">No results</div>';
        return;
      }
      this._lst.innerHTML = items.map((item, i) =>
        `<div class="combo-opt${item.value === this._value ? ' selected' : ''}" data-v="${esc(item.value)}" data-l="${esc(item.label)}" title="${esc(item.title || item.label)}" data-i="${i}">${esc(item.label)}</div>`
      ).join('');
      this._lst.querySelectorAll('.combo-opt').forEach(el => {
        el.addEventListener('mousedown', e => {
          e.preventDefault();
          this._select(el.dataset.v, el.dataset.l);
        });
      });
    }
    _select(value, label) {
      const old = this._value;
      this._value  = value;
      this._inp.value = label;
      this._render(this._items);
      this._hide();
      if (old !== value && this.onChange) this.onChange(value, label);
    }
    _key(e) {
      const opts = this._lst.querySelectorAll('.combo-opt');
      if (e.key === 'ArrowDown') {
        e.preventDefault(); this._show();
        this._focusIdx = Math.min(this._focusIdx + 1, opts.length - 1);
        this._applyFocus(opts);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this._focusIdx = Math.max(this._focusIdx - 1, 0);
        this._applyFocus(opts);
      } else if (e.key === 'Enter' && this._focusIdx >= 0 && opts[this._focusIdx]) {
        e.preventDefault();
        const el = opts[this._focusIdx];
        this._select(el.dataset.v, el.dataset.l);
      } else if (e.key === 'Escape') {
        this._hide();
      }
    }
    _applyFocus(opts) {
      opts.forEach(o => o.classList.remove('focused'));
      if (opts[this._focusIdx]) {
        opts[this._focusIdx].classList.add('focused');
        opts[this._focusIdx].scrollIntoView({ block: 'nearest' });
      }
    }
  }

  // ── Web Component ─────────────────────────────────────────────────────────
  class DimMasterExport extends HTMLElement {

    constructor() {
      super();
      this._root = this.attachShadow({ mode: "open" });
      this._abort = null;
      this._pubDimsLoaded = false;
      this._modelItems     = [];
      this._dimItems       = [];
      this._pubDimItems    = [];
      this._availEntitySets = [];  // entity sets for selected model
    }

    onCustomWidgetBeforeUpdate() {}
    onCustomWidgetAfterUpdate() { this._syncProperties(); }
    onCustomWidgetResize() {}

    connectedCallback() {
      this._render();
      this._wireAll();
      this._syncProperties();
      this._loadModels();
    }

    disconnectedCallback() { if (this._abort) this._abort.abort(); }

    _render() {
      const s = document.createElement("style");
      s.textContent = STYLES;
      const d = document.createElement("div");
      d.innerHTML = TPL;
      this._root.appendChild(s);
      this._root.appendChild(d.firstElementChild);
    }

    _q(sel) { return this._root.querySelector(sel); }

    _syncProperties() {
      const fill = (id, val) => { const el = this._q(id); if (el && val) el.value = val; };
      fill("#inpSel", this.selectColumns    || "");
      fill("#inpFlt", this.filterExpression || "");
      fill("#inpPfx", this.filenamePrefix   || "MasterData");
      const isPublic = !!this.isPublicDimension;
      if (this._q("#chkPublic")) this._q("#chkPublic").checked = isPublic;
      if (this._q("#chkHier"))   this._q("#chkHier").checked   = !!this.includeHierarchy;
      this._applyPublicMode(isPublic);
    }

    _wireAll() {
      this._q("#btnExport").addEventListener("click",   () => this._doExport());
      this._q("#btnPreview").addEventListener("click",  () => this._doPreview());
      this._q("#btnDiscover").addEventListener("click", () => this._doDiscover());

      this._q("#chkPublic").addEventListener("change", e => {
        this._applyPublicMode(e.target.checked);
        if (e.target.checked && !this._pubDimsLoaded) this._loadPublicDims();
      });

      // Model combo
      this._comboModel = new Combo(this._root, 'inpModel', 'lstModel');
      this._comboModel.onChange = (v, l) => this._onModelSelected(v, l);

      // Dim combo — wire onChange to update hierarchy checkbox
      this._comboDim = new Combo(this._root, 'inpDim', 'lstDim');
      this._comboDim.onChange = () => this._updateHierarchyCheckbox();

      // Public dim combo — lazy load on first open, fetch path on selection
      this._comboPubDim = new Combo(this._root, 'inpPubDim', 'lstPubDim');
      this._comboPubDim.onChange = (v) => this._fetchAndSetPubDimPath(v).catch(() => {});
      this._q('#inpPubDim').addEventListener('focus', () => {
        if (!this._pubDimsLoaded) this._loadPublicDims();
      });
    }

    _applyPublicMode(isPublic) {
      const grpModel  = this._q("#grpModel");
      const grpDim    = this._q("#grpDim");
      const grpPubDim = this._q("#grpPubDim");
      if (grpModel)  grpModel.style.display  = isPublic ? "none" : "";
      if (grpDim)    grpDim.style.display    = isPublic ? "none" : "";
      if (grpPubDim) grpPubDim.classList.toggle("hidden", !isPublic);
      // Clear path line when switching modes
      if (!isPublic) {
        const pathEl = this._q('#pathPubDim');
        if (pathEl) { pathEl.textContent = ''; pathEl.classList.add('hidden'); }
      }
    }

    // ── Model loading ──────────────────────────────────────────────────────

    async _loadModels() {
      const hint = this._q("#hintModel");
      if (hint) hint.textContent = "Loading available models…";
      try {
        const url = "/api/v1/dataexport/administration/Namespaces(NamespaceID='sac')/Providers"
          + "?$format=json&$orderby=ProviderName";
        const r = await fetch(url, { headers: { Accept: "application/json" }, credentials: "include" });
        if (!r.ok) throw new Error("HTTP " + r.status);
        const data = await r.json();
        const list = data.value || [];

        this._modelItems = list.map(p => {
          const name = p.ProviderName || p.ProviderID;
          const desc = (p.Description || "").trim();
          const extra = desc && desc !== name && !desc.startsWith(name)
            ? " — " + desc.slice(0, 60) : "";
          return { value: p.ProviderID, label: name + extra, title: `${name}\nID: ${p.ProviderID}${desc ? '\n'+desc : ''}` };
        });
        this._comboModel.setItems(this._modelItems);
        this._comboModel.enable(true);
        this._q('#inpModel').placeholder = 'Type to search ' + list.length + ' models…';
        if (hint) hint.textContent = list.length + " models available.";

        if (this.providerId) {
          const match = this._modelItems.find(i => i.value === this.providerId || i.label.startsWith(this.providerId));
          if (match) { this._comboModel.setValue(match.value, match.label); await this._onModelSelected(match.value, match.label); }
        }
        this._setStatus("idle", "Select a model and dimension, then click Export CSV.", false);
      } catch (ex) {
        if (hint) hint.textContent = "Could not load models. Check permissions.";
        this._setStatus("err", "Could not load models: " + ex.message, false);
      }
    }

    async _onModelSelected(guid, label) {
      // Clear inline path when a new model is selected
      const pathEl = this._q('#pathModel');
      if (pathEl) { pathEl.textContent = ''; pathEl.classList.add('hidden'); }

      // Reset dim combo
      this._comboDim.reset("Loading dimensions…");
      this._comboDim.enable(false);
      this._q('#inpDim').placeholder = "Loading dimensions…";
      const hintDim = this._q("#hintDim");
      if (hintDim) hintDim.textContent = "Loading…";

      // Reset hierarchy checkbox
      this._availEntitySets = [];
      this._updateHierarchyCheckbox();

      // Fetch and set folder path as tooltip (fire-and-forget, caches result)
      this._fetchAndSetModelPath(guid).catch(() => {});

      if (!guid) return;

      this._setStatus("loading", "Loading dimensions…", true);

      // Load entity sets (dimensions + hierarchy availability)
      await this._loadDimensions(guid);
    }

    async _loadDimensions(guid) {
      const hintDim = this._q("#hintDim");
      try {
        const metaUrl = "/api/v1/dataexport/providers/sac/" + encodeURIComponent(guid) + "/$metadata";
        const r = await fetch(metaUrl, { headers: { Accept: "application/xml" }, credentials: "include" });
        if (!r.ok) throw new Error("HTTP " + r.status);
        const xml = await r.text();

        // Extract all entity sets
        const re = /EntitySet Name="([^"]+)"/g;
        let m;
        const all = [];
        while ((m = re.exec(xml)) !== null) all.push(m[1]);
        this._availEntitySets = all;
        this._updateHierarchyCheckbox();

        // Dimension sets = those ending in Master (not WithHierarchy)
        const masters = all.filter(s => s.endsWith("Master") && !s.includes("WithHierarchy"));

        this._dimItems = masters.map(es => {
          const dimName = es.replace(/Master$/, "");
          const hasHier = all.includes(dimName + "MasterWithHierarchy");
          return { value: dimName, label: dimName + (hasHier ? "" : " ⚠ no hierarchy"), title: dimName + (hasHier ? " (hierarchy available)" : " (no hierarchy entity set)") };
        });

        this._comboDim.setItems(this._dimItems);
        this._comboDim.enable(true);
        this._q('#inpDim').placeholder = 'Type to search ' + masters.length + ' dimensions…';
        if (hintDim) hintDim.textContent = masters.length + " dimension(s) found.";

        if (this.dimensionId && masters.includes(this.dimensionId)) {
          const item = this._dimItems.find(i => i.value === this.dimensionId);
          if (item) this._comboDim.setValue(item.value, item.label);
        }

        this._setStatus("ok", masters.length + " dimension(s) loaded. Select one.", false);
      } catch (ex) {
        this._comboDim.reset("— failed to load —");
        if (hintDim) hintDim.textContent = "Could not load dimensions.";
        this._setStatus("err", "Could not load dimensions: " + ex.message, false);
      }
    }

    _updateHierarchyCheckbox() {
      const dimVal = this._comboDim?.getValue() || "";
      const chk = this._q("#chkHier");
      const lbl = this._q("#lblHier");
      if (!chk) return;
      if (!dimVal || this._availEntitySets.length === 0) {
        chk.disabled = false;
        if (lbl) lbl.textContent = "Include Hierarchy (adds PARENTID, PREVID, ORDERID columns)";
        return;
      }
      const hasHier = this._availEntitySets.includes(dimVal + "MasterWithHierarchy");
      chk.disabled = !hasHier;
      if (!hasHier) {
        chk.checked = false;
        if (lbl) lbl.textContent = "Include Hierarchy — not available for this dimension";
      } else {
        if (lbl) lbl.textContent = "Include Hierarchy (adds PARENTID, PREVID, ORDERID columns)";
      }
    }

    // ── Folder path enrichment (background, results in tooltip titles) ─────────

    // ── Folder path (per-selection, lazy, cached) ────────────────────────────

    async _buildFolderPaths() {
      // No-op: paths are now fetched per-selection in _fetchAndSetModelPath
    }

    // Fetch and cache path + description for a single model GUID, then show inline
    async _fetchAndSetModelPath(guid) {
      if (!guid) return;
      const pathEl = this._q('#pathModel');

      // Show cached result immediately if available
      if (this._modelPathMap?.[guid]) {
        if (pathEl) { pathEl.textContent = this._modelPathMap[guid]; pathEl.classList.remove('hidden'); }
        this._q('#inpModel').title = this._modelPathMap[guid];
        return;
      }
      try {
        // Step 1: get the model's resource entry (includes description + parentFolderResourceId)
        const r1 = await fetch(
          "/api/v1/filerepository/Resources?%24format=json&%24top=1&%24filter=resourceId%20eq%20'"
            + encodeURIComponent(guid) + "'",
          { credentials: "include", headers: { Accept: "application/json" } }
        );
        if (!r1.ok) return;
        const d1 = await r1.json();
        const item = (d1.value || [])[0];
        if (!item) return;

        // Step 2: walk up folder chain (up to 4 levels)
        const folderCache = {};
        const getFolder = async (id) => {
          if (!id || id === "PUBLIC" || id === "PRIVATE" || id === "DATAACTIONS") return null;
          if (folderCache[id]) return folderCache[id];
          const r = await fetch(
            "/api/v1/filerepository/Resources?%24format=json&%24top=1&%24filter=resourceId%20eq%20'"
              + encodeURIComponent(id) + "'",
            { credentials: "include", headers: { Accept: "application/json" } }
          );
          if (!r.ok) return null;
          const d = await r.json();
          const f = (d.value || [])[0] || null;
          if (f) folderCache[id] = f;
          return f;
        };

        const parts = [];
        let parentId = item.parentFolderResourceId;
        for (let depth = 0; depth < 5; depth++) {
          if (!parentId) break;
          if (parentId === "PUBLIC")  { parts.unshift("Public Files"); break; }
          if (parentId === "PRIVATE") { parts.unshift("My Files");     break; }
          const folder = await getFolder(parentId);
          if (!folder) break;
          parts.unshift(folder.name);
          parentId = folder.parentFolderResourceId;
        }

        const pathStr = parts.join(" / ");
        const desc = (item.description || "").trim();
        const display = [desc ? "📄 " + desc : "", pathStr ? "📁 " + pathStr : ""].filter(Boolean).join("  ·  ");
        if (!display) return;

        if (!this._modelPathMap) this._modelPathMap = {};
        this._modelPathMap[guid] = display;

        if (pathEl) { pathEl.textContent = display; pathEl.classList.remove('hidden'); }
        this._q('#inpModel').title = display;

        // Enrich this model's combo option title too
        this._updateComboTitleForSelected(guid);
      } catch {}
    }

    _updateComboTitleForSelected(guid) {
      const idx = this._modelItems.findIndex(i => i.value === guid);
      if (idx < 0) return;
      const display = this._modelPathMap?.[guid];
      if (!display) return;
      if (!this._modelItems[idx].title.includes("📁")) {
        this._modelItems[idx] = {
          ...this._modelItems[idx],
          title: this._modelItems[idx].title + "\n" + display
        };
        this._comboModel.setItems(this._modelItems);
      }
    }

    // Returns path string for a model GUID from the cache, or '' if not yet fetched
    _getModelPath(guid) {
      return this._modelPathMap?.[guid] || '';
    }

    // Fetch folder path + description for a public dimension ProviderID and display it
    async _fetchAndSetPubDimPath(providerID) {
      if (!providerID) return;
      const pathEl = this._q('#pathPubDim');

      // Show cached result immediately if available
      if (this._pubDimPathMap?.[providerID]) {
        if (pathEl) { pathEl.textContent = this._pubDimPathMap[providerID]; pathEl.classList.remove('hidden'); }
        return;
      }

      try {
        const r = await fetch(
          "/api/v1/filerepository/Resources?%24format=json&%24top=1&%24filter=resourceId%20eq%20'"
            + encodeURIComponent(providerID) + "'",
          { credentials: "include", headers: { Accept: "application/json" } }
        );
        if (!r.ok) return;
        const d = await r.json();
        const item = (d.value || [])[0];
        if (!item) return;

        // Build folder path by walking up parentFolderResourceId
        const folderCache = {};
        const getFolder = async (id) => {
          if (!id || id === "PUBLIC" || id === "PRIVATE") return null;
          if (folderCache[id]) return folderCache[id];
          const r2 = await fetch(
            "/api/v1/filerepository/Resources?%24format=json&%24top=1&%24filter=resourceId%20eq%20'"
              + encodeURIComponent(id) + "'",
            { credentials: "include", headers: { Accept: "application/json" } }
          );
          if (!r2.ok) return null;
          const d2 = await r2.json();
          const f = (d2.value || [])[0] || null;
          if (f) folderCache[id] = f;
          return f;
        };

        const parts = [];
        let parentId = item.parentFolderResourceId;
        for (let depth = 0; depth < 5; depth++) {
          if (!parentId) break;
          if (parentId === "PUBLIC")  { parts.unshift("Public Files"); break; }
          if (parentId === "PRIVATE") { parts.unshift("My Files");     break; }
          const folder = await getFolder(parentId);
          if (!folder) break;
          parts.unshift(folder.name);
          parentId = folder.parentFolderResourceId;
        }

        const pathStr = parts.join(" / ");
        const desc = (item.description || "").trim();
        const display = [desc ? "📄 " + desc : "", pathStr ? "📁 " + pathStr : ""].filter(Boolean).join("  ·  ");
        if (!display) return;

        if (!this._pubDimPathMap) this._pubDimPathMap = {};
        this._pubDimPathMap[providerID] = display;

        if (pathEl) { pathEl.textContent = display; pathEl.classList.remove('hidden'); }
        this._q('#inpPubDim').title = display;
      } catch {}
    }

    // ── Public dimension loading ──────────────────────────────────────────────

    async _loadPublicDims() {
      if (this._pubDimsLoaded) return;
      const hint = this._q("#hintPubDim");
      this._comboPubDim.reset("Loading public dimensions…");
      this._comboPubDim.enable(false);
      if (hint) hint.textContent = "Loading…";
      this._setStatus("loading", "Loading public dimensions…", true);
      try {
        const url = "/api/v1/dataexport/administration/Namespaces(NamespaceID='sac_public_dimensions')/Providers"
          + "?$format=json&$orderby=ProviderName";
        const r = await fetch(url, { headers: { Accept: "application/json" }, credentials: "include" });
        if (!r.ok) throw new Error("HTTP " + r.status);
        const data = await r.json();
        const list = data.value || [];

        this._pubDimItems = list.map(p => {
          const name = p.ProviderName || p.ProviderID;
          const parts = p.ProviderID.split(':');
          const ns = parts.length >= 2 ? parts[1] : '';
          const nsLabel = ns && ns !== name ? ' [' + ns + ']' : '';
          const desc = (p.Description || "").trim();
          const descExtra = desc && desc !== name && !desc.startsWith(name + ' -') ? " — " + desc.slice(0, 50) : "";
          return { value: p.ProviderID, label: name + nsLabel + descExtra, title: `${name}\nID: ${p.ProviderID}${desc ? '\n'+desc : ''}` };
        });
        this._comboPubDim.setItems(this._pubDimItems);
        this._comboPubDim.enable(true);
        this._q('#inpPubDim').placeholder = 'Type to search ' + list.length + ' public dimensions…';
        if (hint) hint.textContent = list.length + " public dimension(s) available.";
        this._pubDimsLoaded = true;

        if (this.dimensionId) {
          const match = this._pubDimItems.find(i => i.value === this.dimensionId || i.label.startsWith(this.dimensionId));
          if (match) this._comboPubDim.setValue(match.value, match.label);
        }
        this._setStatus("ok", list.length + " public dimensions loaded.", false);
      } catch (ex) {
        this._comboPubDim.reset("— failed to load —");
        if (hint) hint.textContent = "Could not load public dimensions.";
        this._setStatus("err", "Could not load public dimensions: " + ex.message, false);
      }
    }

    // ── Config / validation ───────────────────────────────────────────────────

    _cfg() {
      const v = id => (this._q(id) || {}).value || "";
      const isPublic = this._q("#chkPublic").checked;
      const incHier  = this._q("#chkHier").checked && !this._q("#chkHier").disabled;
      return {
        isPublic,
        incHier,
        pv:  isPublic ? "" : (this._comboModel?.getValue() || this.providerId || ""),
        dim: isPublic ? (this._comboPubDim?.getValue() || this.dimensionId || "")
                      : (this._comboDim?.getValue()    || this.dimensionId || ""),
        sel: v("#inpSel") || this.selectColumns    || "",
        flt: v("#inpFlt") || this.filterExpression || "",
        pfx: v("#inpPfx") || this.filenamePrefix   || "MasterData",
      };
    }

    _validate(c) {
      if (!c.dim) return c.isPublic ? "Select a Public Dimension." : "Select a Dimension.";
      if (!c.isPublic && !c.pv) return "Select a Model.";
      return null;
    }

    _url(c, extra) {
      let base;
      if (c.isPublic) {
        const es = "PublicDimensionData" + (c.incHier ? "WithHierarchy" : "");
        base = "/api/v1/dataexport/providers/sac_public_dimensions/" + enc(c.dim) + "/" + es;
      } else {
        const es = enc(c.dim) + (c.incHier ? "MasterWithHierarchy" : "Master");
        base = "/api/v1/dataexport/providers/sac/" + enc(c.pv) + "/" + es;
      }
      const p = new URLSearchParams({ "$format": "json" });
      if (c.sel) p.set("$select", c.sel);
      if (c.flt) p.set("$filter", c.flt);
      if (extra) Object.entries(extra).forEach(([k, v]) => p.set(k, v));
      return base + "?" + p;
    }

    // ── Fetch helpers ─────────────────────────────────────────────────────────

    async _csrf() {
      try {
        const r = await fetch("/api/v1/dataexport/administration/Namespaces",
          { headers: { "X-CSRF-Token": "Fetch" }, credentials: "include" });
        const t = r.headers.get("X-CSRF-Token") || r.headers.get("x-csrf-token") || "";
        if (t && t !== "Fetch") return t;
      } catch {}
      return "";
    }

    async _page(url, token, signal) {
      const r = await fetch(url, {
        headers: { Accept: "application/json", "X-CSRF-Token": token },
        credentials: "include", signal,
      });
      if (r.status === 401) throw new Error("HTTP 401 – Not authenticated.");
      if (r.status === 403) throw new Error("HTTP 403 – Forbidden.");
      if (r.status === 404) throw new Error("HTTP 404 – Entity set not found: " + url.split("?")[0]);
      if (!r.ok) {
        let body = "";
        try { body = await r.text(); } catch {}
        // Friendly messages for known SAC DES errors
        if (body.includes("SQL Statement cannot be prepared")) {
          throw new Error("The Data Export Service cannot access this dimension (SQL error 1205). " +
            "This dimension exists in SAC but its DES export provider is not configured on this tenant. " +
            "Please try a different dimension, or check with your SAC administrator.");
        }
        if (body.includes("Entity Set Name does not exist")) {
          const isHierUrl = url.includes("WithHierarchy");
          throw new Error(isHierUrl
            ? "Hierarchy not available for this dimension. Uncheck 'Include Hierarchy' and try again."
            : "Entity set not found: " + url.split("?")[0]);
        }
        let msg = "HTTP " + r.status + " " + r.statusText;
        if (body) {
          // Try to extract a clean error message from JSON
          try {
            const j = JSON.parse(body);
            const m = j.error?.message || j.message || "";
            if (m) msg += " – " + m.slice(0, 150);
            else msg += " – " + body.slice(0, 150);
          } catch { msg += " – " + body.slice(0, 150); }
        }
        throw new Error(msg);
      }
      return r.json();
    }

    // ── UI helpers ────────────────────────────────────────────────────────────

    _setStatus(type, text, spin) {
      const bar = this._q("#statusBar"), ico = this._q("#statusIco"), txt = this._q("#statusTxt");
      if (!bar) return;
      bar.className = "status s-" + type;
      ico.innerHTML = spin
        ? '<span class="spin"></span>'
        : ({ ok: "&#10003;", err: "&#10007;", idle: "&#8505;" }[type] || "&#8505;");
      txt.textContent = text;
    }

    _setProgress(pct) {
      const w = this._q("#progWrap"), b = this._q("#progBar");
      if (!w || !b) return;
      if (!pct) { w.classList.add("hidden"); return; }
      w.classList.remove("hidden");
      b.style.width = Math.min(pct, 100) + "%";
    }

    _setBusy(v) {
      ["#btnExport", "#btnPreview", "#btnDiscover"].forEach(id => {
        const b = this._q(id); if (b) b.disabled = v;
      });
    }

    // ── Actions ───────────────────────────────────────────────────────────────

    async _doPreview() {
      const c = this._cfg();
      const e = this._validate(c);
      if (e) { this._setStatus("err", e, false); return; }
      this._setBusy(true);
      this._setStatus("loading", "Loading preview…", true);
      this._setProgress(20);
      this._q("#previewSec").classList.add("hidden");
      try {
        const token = await this._csrf();
        this._abort = new AbortController();
        this._setProgress(50);
        const json = await this._page(this._url(c, { "$top": "20" }), token, this._abort.signal);
        const rows = json.value || [];
        this._setProgress(100);
        this._renderTable(rows, json["@odata.count"]);
        this._setStatus("ok", "Preview: " + rows.length + " rows" + (json["@odata.count"] ? " of ~" + json["@odata.count"] + " total" : "") + ".", false);
      } catch (ex) {
        if (ex.name !== "AbortError") this._setStatus("err", ex.message, false);
      } finally {
        this._setBusy(false);
        setTimeout(() => this._setProgress(0), 700);
      }
    }

    async _doExport() {
      const ROWS_PER_FILE = 100000;   // split threshold — one file per 100k rows

      const c = this._cfg();
      const e = this._validate(c);
      if (e) { this._setStatus("err", e, false); return; }
      this._setBusy(true);
      this._q("#previewSec").classList.add("hidden");
      this._setProgress(5);
      this._setStatus("loading", "Authenticating…", true);
      this._abort = new AbortController();
      const signal = this._abort.signal;

      try {
        const token = await this._csrf();
        let url = this._url(c);

        // Streaming state — only CSV lines are accumulated, not row objects
        let headers   = null;       // column names, set from first batch
        let lines     = [];         // CSV lines for the current file part
        let totalRows = 0;          // grand total rows fetched
        let partRows  = 0;          // rows in the current part
        let partNum   = 0;          // current part number (1-based, 0 = not started)
        let total     = null;       // @odata.count if available
        let page      = 0;
        let previewRows = [];       // keep first 20 rows for the preview table

        const ts       = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
        const baseName = c.pfx + "_" + c.dim + (c.incHier ? "_WithHierarchy" : "") + "_" + ts;

        // Flush the current lines buffer as a CSV file download
        const flushPart = () => {
          partNum++;
          const header = headers.join(",");
          const csv    = header + "\r\n" + lines.join("\r\n");
          const fname  = baseName + "_part" + partNum + ".csv";
          _download(csv, fname);
          lines = [];
          partRows = 0;
        };

        while (url) {
          page++;
          this._setStatus("loading", "Fetching page " + page + "… (" + totalRows + " rows so far)", true);
          const json  = await this._page(url, token, signal);
          if (total == null && json["@odata.count"]) total = json["@odata.count"];
          const batch = json.value || [];
          if (!batch.length) break;

          // Set headers from first batch
          if (!headers) {
            headers = Object.keys(batch[0]).filter(k => !k.startsWith("@") && !k.startsWith("#"));
          }

          // Collect first 20 rows for preview (object form, discarded after)
          if (previewRows.length < 20) {
            const needed = 20 - previewRows.length;
            previewRows = previewRows.concat(batch.slice(0, needed));
          }

          // Convert batch to CSV lines immediately, then discard the objects
          for (const row of batch) {
            lines.push(headers.map(h => _csvCell(row[h])).join(","));
            partRows++;
            totalRows++;

            // Auto-flush when part threshold reached mid-batch
            if (partRows >= ROWS_PER_FILE) flushPart();
          }

          const pct = total
            ? Math.min(95, 5 + Math.round((totalRows / total) * 90))
            : Math.min(90, 5 + page * 8);
          this._setProgress(pct);

          url = json["@odata.nextLink"] || null;
        }

        if (totalRows === 0) {
          this._setStatus("ok", "Export complete – 0 rows.", false);
          this._setProgress(0); this._setBusy(false); return;
        }

        // Flush final (or only) part
        this._setStatus("loading", "Building CSV (" + totalRows + " rows)…", true);
        this._setProgress(97);
        flushPart();

        const fileDesc = partNum === 1
          ? baseName + "_part1.csv"
          : partNum + " files (" + baseName + "_part1–" + partNum + ".csv)";

        this._setProgress(100);
        this._setStatus("ok", "Exported " + totalRows + " rows → " + fileDesc, false);
        this._renderTable(previewRows, totalRows);

      } catch (ex) {
        if (ex.name !== "AbortError") { this._setStatus("err", "Error: " + ex.message, false); console.error("[DimExport]", ex); }
      } finally {
        this._setBusy(false);
        setTimeout(() => this._setProgress(0), 1500);
      }
    }

    async _doDiscover() {
      const guid = this._comboModel?.getValue();
      if (!guid) { this._setStatus("err", "Select a model first.", false); return; }
      this._setBusy(true);
      this._setStatus("loading", "Looking up entity sets…", true);
      try {
        const r = await fetch("/api/v1/dataexport/providers/sac/" + encodeURIComponent(guid) + "/$metadata",
          { headers: { Accept: "application/json,application/xml" }, credentials: "include" });
        if (!r.ok) throw new Error("HTTP " + r.status);
        const xml  = await r.text();
        const sets = [], re = /EntitySet Name="([^"]+)"/g;
        let m;
        while ((m = re.exec(xml)) !== null) sets.push(m[1]);
        this._availEntitySets = sets;
        this._updateHierarchyCheckbox();
        this._setStatus("ok", "GUID: " + guid + " | Entity sets: " + (sets.join(", ") || "(none found)"), false);
      } catch (ex) {
        this._setStatus("err", "Discover failed: " + ex.message, false);
      } finally { this._setBusy(false); }
    }

    _renderTable(rows, total) {
      const sec = this._q("#previewSec"), tbl = this._q("#previewTbl"), inf = this._q("#tblInfo");
      if (!rows.length) { sec.classList.add("hidden"); return; }
      const hdrs = Object.keys(rows[0]).filter(k => !k.startsWith("@") && !k.startsWith("#"));
      let html = "<thead><tr>" + hdrs.map(h => "<th>" + esc(h) + "</th>").join("") + "</tr></thead><tbody>";
      rows.forEach(r => {
        html += "<tr>" + hdrs.map(h => "<td title=\"" + esc(String(r[h] ?? "")) + "\">" + esc(String(r[h] ?? "")) + "</td>").join("") + "</tr>";
      });
      html += "</tbody>";
      tbl.innerHTML = html;
      inf.textContent = "Showing " + rows.length + " rows" + (total ? " (total: " + total + ")" : "");
      sec.classList.remove("hidden");
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  const enc = s => encodeURIComponent(s || "");
  const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

  // Quote a single CSV cell value
  function _csvCell(v) {
    if (v == null) return "";
    const s = String(v);
    return (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r"))
      ? '"' + s.replace(/"/g, '""') + '"'
      : s;
  }

  function _download(csv, name) {
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement("a"), { href: url, download: name, style: "display:none" });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  if (!customElements.get("custom-dim-master-export")) {
    customElements.define("custom-dim-master-export", DimMasterExport);
  }

})();
