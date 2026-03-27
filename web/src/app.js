// SPDX-License-Identifier: Apache-2.0

import { EditorView, basicSetup } from "codemirror";
import { yaml } from "@codemirror/lang-yaml";
import { oneDark } from "@codemirror/theme-one-dark";
import { search } from "@codemirror/search";
import { indexWorkspace, resolveDocument } from "./resolve.js";

const DOCUMENT_TYPES = [
  { name: "Control Catalog", definition: "#ControlCatalog" },
  { name: "Threat Catalog", definition: "#ThreatCatalog" },
  { name: "Capability Catalog", definition: "#CapabilityCatalog" },
  { name: "Guidance Catalog", definition: "#GuidanceCatalog" },
  { name: "Vector Catalog", definition: "#VectorCatalog" },
  { name: "Principle Catalog", definition: "#PrincipleCatalog" },
  { name: "Risk Catalog", definition: "#RiskCatalog" },
  { name: "Policy", definition: "#Policy" },
  { name: "Evaluation Log", definition: "#EvaluationLog" },
  { name: "Enforcement Log", definition: "#EnforcementLog" },
  { name: "Audit Log", definition: "#AuditLog" },
  { name: "Mapping Document", definition: "#MappingDocument" },
];

let editor;
let editorDirty = false;
let initialContent = "";
let wasmReady = false;
let workspace = null;

const doctypeSelect = document.getElementById("doctype-select");
const versionSelect = document.getElementById("version-select");
const exampleSelect = document.getElementById("example-select");
const validateBtn = document.getElementById("validate-btn");
const visualizeBtn = document.getElementById("visualize-btn");
const copyBtn = document.getElementById("copy-btn");
const validateTab = document.getElementById("validate-tab");
const visualizeView = document.getElementById("visualize-view");
const vizBackBtn = document.getElementById("viz-back-btn");
const vizTitle = document.getElementById("viz-title");
const vizGraph = document.getElementById("viz-graph");

function initEditor(content) {
  initialContent = content;
  editor = new EditorView({
    doc: content,
    extensions: [
      basicSetup,
      yaml(),
      oneDark,
      search(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          editorDirty = true;
        }
      }),
    ],
    parent: document.getElementById("editor"),
  });
}

function getEditorContent() {
  return editor.state.doc.toString();
}

function setEditorContent(content) {
  editor.dispatch({
    changes: { from: 0, to: editor.state.doc.length, insert: content },
  });
  initialContent = content;
  editorDirty = false;
}

function clearChildren(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function populateDocTypes() {
  for (const dt of DOCUMENT_TYPES) {
    const opt = document.createElement("option");
    opt.value = dt.definition;
    opt.textContent = dt.name;
    doctypeSelect.appendChild(opt);
  }
}

async function loadVersions() {
  try {
    const resp = await fetch("versions.json");
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const versions = await resp.json();

    versionSelect.innerHTML = "";
    for (const v of versions) {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      versionSelect.appendChild(opt);
    }
  } catch {
    versionSelect.innerHTML = '<option value="">Failed to load versions</option>';
  }
}

async function loadTutorials() {
  try {
    const resp = await fetch("tutorials/manifest.json");
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const tutorials = await resp.json();

    for (const t of tutorials) {
      const opt = document.createElement("option");
      opt.value = t.filename;
      opt.dataset.definition = t.definition;
      opt.textContent = t.name;
      exampleSelect.appendChild(opt);
    }

    return tutorials;
  } catch {
    return [];
  }
}

async function loadTutorialFile(filename, definition) {
  try {
    const resp = await fetch(`tutorials/${filename}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const content = await resp.text();
    setEditorContent(content);

    if (definition) {
      doctypeSelect.value = definition;
    }
    clearOutput();
  } catch (err) {
    showError("Failed to load tutorial: " + err.message);
  }
}

function showVisualizeView(title) {
  vizTitle.textContent = title || "Relationship Graph";
  visualizeView.hidden = false;
}

function hideVisualizeView() {
  visualizeView.hidden = true;
}

function clearOutput() {
  validateTab.innerHTML = `
    <div class="output-placeholder">
      Click <strong>Validate</strong> to check your document against the selected Gemara schema.
    </div>`;
}

function showSuccess() {
  validateTab.innerHTML = `
    <div class="output-success">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
      </svg>
      Document is valid
    </div>`;
}

function showErrors(errors) {
  clearChildren(validateTab);
  const container = document.createElement("div");
  container.className = "output-errors";

  const header = document.createElement("div");
  header.className = "output-errors-header";
  header.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/></svg>`;
  header.appendChild(
    document.createTextNode(` ${errors.length} error${errors.length !== 1 ? "s" : ""} found`),
  );
  container.appendChild(header);

  for (const e of errors) {
    const item = document.createElement("div");
    item.className = "output-error-item";
    if (e.path) {
      const pathEl = document.createElement("span");
      pathEl.className = "error-path";
      pathEl.textContent = e.path;
      item.appendChild(pathEl);
    }
    const msgEl = document.createElement("span");
    msgEl.className = "error-message";
    msgEl.textContent = e.message;
    item.appendChild(msgEl);
    container.appendChild(item);
  }

  validateTab.appendChild(container);
}

function showError(message) {
  showErrors([{ message }]);
}

async function handleValidate() {
  const definition = doctypeSelect.value;
  if (!definition) {
    doctypeSelect.classList.add("error");
    setTimeout(() => doctypeSelect.classList.remove("error"), 600);
    return;
  }

  const version = versionSelect.value;
  if (!version) {
    versionSelect.classList.add("error");
    setTimeout(() => versionSelect.classList.remove("error"), 600);
    return;
  }

  if (!wasmReady) {
    showError("Validation engine is still loading. Please wait.");
    return;
  }

  const yamlContent = getEditorContent();
  const defName = definition.replace("#", "");

  validateBtn.disabled = true;
  validateBtn.innerHTML = '<span class="spinner"></span> Validating…';

  try {
    const schemaResp = await fetch(`schemas/${version}/${defName}.cue`);
    if (!schemaResp.ok) {
      showError(`Schema not available for ${version} ${definition}`);
      return;
    }
    const schemaSource = await schemaResp.text();

    const result = window.GemaraPlayground.validateYAML(yamlContent, schemaSource);
    if (result.valid) {
      showSuccess();
    } else {
      const errors = [];
      for (let i = 0; i < result.errors.length; i++) {
        errors.push({ path: result.errors[i].path, message: result.errors[i].message });
      }
      showErrors(errors);
    }
  } catch (err) {
    showError("Validation failed: " + err.message);
  } finally {
    validateBtn.disabled = false;
    validateBtn.textContent = "Validate";
  }
}

const COPY_ICON = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5.5" y="5.5" width="8" height="8" rx="1"/><path d="M10.5 5.5V3.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2"/></svg>`;
const CHECK_ICON = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3.5 8.5 6.5 11.5 12.5 4.5"/></svg>`;

function showCopiedFeedback() {
  copyBtn.classList.add("copied");
  copyBtn.innerHTML = `${CHECK_ICON} Copied!`;
  setTimeout(() => {
    copyBtn.innerHTML = `${COPY_ICON} Copy`;
    copyBtn.classList.remove("copied");
  }, 2000);
}

async function handleCopy() {
  const content = getEditorContent();
  try {
    await navigator.clipboard.writeText(content);
    showCopiedFeedback();
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = content;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    showCopiedFeedback();
  }
}

async function handleVisualize() {
  const yamlContent = getEditorContent();
  if (!yamlContent.trim()) {
    vizGraph.innerHTML = `<div class="output-placeholder">No document to analyze. Write or load a Gemara YAML document first.</div>`;
    showVisualizeView();
    return;
  }

  vizGraph.innerHTML = `<div class="output-placeholder">Analyzing relationships…</div>`;
  showVisualizeView("Analyzing…");
  visualizeBtn.disabled = true;
  visualizeBtn.innerHTML = '<span class="spinner"></span> Analyzing…';

  try {
    const ws = workspace || { docs: [], findByID: () => [] };
    const result = resolveDocument(yamlContent, ws);

    const centerLabel = result.center?.title || result.center?.id || "Document";
    showVisualizeView(`Relationships: ${centerLabel}`);
    renderGraph(result);
  } catch (err) {
    clearChildren(vizGraph);
    const errWrap = document.createElement("div");
    errWrap.className = "output-errors";
    const errHeader = document.createElement("div");
    errHeader.className = "output-errors-header";
    errHeader.textContent = "Resolve failed: " + err.message;
    errWrap.appendChild(errHeader);
    vizGraph.appendChild(errWrap);
    vizTitle.textContent = "Error";
  } finally {
    visualizeBtn.disabled = false;
    visualizeBtn.textContent = "Visualize";
  }
}

const LAYER_LABELS = { 1: "Layer 1 — Guidance", 2: "Layer 2 — Controls", 3: "Layer 3 — Policy" };
const LAYER_COLORS = { 1: "#a78bfa", 2: "#6c8cff", 3: "#f59e0b" };

function renderGraph(graph) {
  const NS = "http://www.w3.org/2000/svg";
  const allNodes = [graph.center, ...graph.nodes];

  const layerGroups = {};
  for (const node of allNodes) {
    const layer = node.layer || 0;
    if (!layerGroups[layer]) layerGroups[layer] = [];
    layerGroups[layer].push(node);
  }

  const sortedLayers = Object.keys(layerGroups).map(Number).sort((a, b) => a - b);
  const colWidth = 240;
  const nodeHeight = 60;
  const nodeSpacingY = 28;
  const layerPadding = 60;
  const topPadding = 50;
  const nodePadX = 14;

  const colPositions = {};
  sortedLayers.forEach((layer, i) => {
    colPositions[layer] = layerPadding + i * (colWidth + layerPadding);
  });

  const nodePositions = {};
  let maxY = 0;
  for (const layer of sortedLayers) {
    const nodes = layerGroups[layer];
    nodes.forEach((node, i) => {
      const x = colPositions[layer];
      const y = topPadding + i * (nodeHeight + nodeSpacingY);
      nodePositions[node.id] = { x, y, node };
      if (y + nodeHeight > maxY) maxY = y + nodeHeight;
    });
  }

  const svgWidth = sortedLayers.length * (colWidth + layerPadding) + layerPadding;
  const svgHeight = maxY + 30;

  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
  svg.style.cssText = `width:100%;height:100%;min-height:${svgHeight}px`;

  for (const layer of sortedLayers) {
    if (layer === 0) continue;
    const x = colPositions[layer] + colWidth / 2;
    const label = LAYER_LABELS[layer] || `Layer ${layer}`;
    const text = document.createElementNS(NS, "text");
    text.classList.add("graph-layer-label");
    text.setAttribute("x", String(x));
    text.setAttribute("y", "18");
    text.setAttribute("text-anchor", "middle");
    text.textContent = label;
    svg.appendChild(text);
  }

  const defs = document.createElementNS(NS, "defs");
  const marker = document.createElementNS(NS, "marker");
  marker.setAttribute("id", "arrowhead");
  marker.setAttribute("markerWidth", "8");
  marker.setAttribute("markerHeight", "6");
  marker.setAttribute("refX", "8");
  marker.setAttribute("refY", "3");
  marker.setAttribute("orient", "auto");
  const polygon = document.createElementNS(NS, "polygon");
  polygon.setAttribute("points", "0 0, 8 3, 0 6");
  polygon.setAttribute("fill", "#2e3345");
  marker.appendChild(polygon);
  defs.appendChild(marker);
  svg.appendChild(defs);

  for (const edge of graph.edges) {
    const from = nodePositions[edge.source];
    const to = nodePositions[edge.target];
    if (!from || !to || edge.source === edge.target) continue;

    const x1 = from.x + colWidth / 2;
    const y1 = from.y + nodeHeight / 2;
    const x2 = to.x + colWidth / 2;
    const y2 = to.y + nodeHeight / 2;

    const details = edge.details && edge.details.length > 0
      ? edge.details.join(", ")
      : "";
    const tooltip = `${edge.type}${details ? ": " + details : ""}`;

    const g = document.createElementNS(NS, "g");
    g.classList.add("graph-edge");
    const line = document.createElementNS(NS, "line");
    line.setAttribute("x1", String(x1));
    line.setAttribute("y1", String(y1));
    line.setAttribute("x2", String(x2));
    line.setAttribute("y2", String(y2));
    line.setAttribute("marker-end", "url(#arrowhead)");
    g.appendChild(line);
    const title = document.createElementNS(NS, "title");
    title.textContent = tooltip;
    g.appendChild(title);
    svg.appendChild(g);
  }

  for (const [id, pos] of Object.entries(nodePositions)) {
    const node = pos.node;
    const isCenter = id === graph.center.id && node.type === graph.center.type;
    const cls = isCenter ? "center" : node.resolved ? "resolved" : "stub";
    const color = node.layer ? LAYER_COLORS[node.layer] || "#6c8cff" : "#555";

    const titleText = truncate(node.title || node.id, 30);
    const typeLabel = isCenter
      ? `${node.type || ""} (editing)`
      : node.resolved ? node.type || "" : "external";

    const g = document.createElementNS(NS, "g");
    g.classList.add("graph-node", cls);
    g.setAttribute("transform", `translate(${pos.x},${pos.y})`);
    if (node.resolved && !isCenter && node.filename) {
      g.dataset.filename = node.filename;
      g.dataset.definition = definitionForType(node.type);
      g.style.cursor = "pointer";
    }

    const rect = document.createElementNS(NS, "rect");
    rect.setAttribute("width", String(colWidth));
    rect.setAttribute("height", String(nodeHeight));
    if (isCenter) rect.setAttribute("stroke", color);
    g.appendChild(rect);

    const titleEl = document.createElementNS(NS, "text");
    titleEl.classList.add("node-title");
    titleEl.setAttribute("x", String(nodePadX));
    titleEl.setAttribute("y", "26");
    titleEl.textContent = titleText;
    g.appendChild(titleEl);

    const typeEl = document.createElementNS(NS, "text");
    typeEl.classList.add("node-type");
    typeEl.setAttribute("x", String(nodePadX));
    typeEl.setAttribute("y", "44");
    typeEl.textContent = typeLabel;
    g.appendChild(typeEl);

    svg.appendChild(g);
  }

  clearChildren(vizGraph);
  const container = document.createElement("div");
  container.className = "graph-container";
  container.appendChild(svg);
  vizGraph.appendChild(container);

  vizGraph.querySelectorAll(".graph-node.resolved[data-filename]").forEach((el) => {
    el.addEventListener("click", () => {
      const filename = el.dataset.filename;
      const definition = el.dataset.definition;
      if (editorDirty) {
        if (!confirm("You have unsaved changes. Load this document anyway?")) return;
      }
      loadTutorialFile(filename, definition);
      hideVisualizeView();
    });
  });
}

function truncate(str, max) {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

function definitionForType(type) {
  const match = DOCUMENT_TYPES.find((dt) => dt.name.replace(/ /g, "") === type || dt.definition === `#${type}`);
  return match ? match.definition : "";
}

function handleExampleChange() {
  const selected = exampleSelect.options[exampleSelect.selectedIndex];
  if (!selected || !selected.value) return;

  const filename = selected.value;
  const definition = selected.dataset.definition;

  if (editorDirty) {
    if (!confirm("You have unsaved changes. Load this tutorial anyway?")) {
      exampleSelect.value = "";
      return;
    }
  }

  loadTutorialFile(filename, definition);
}

doctypeSelect.addEventListener("change", clearOutput);
versionSelect.addEventListener("change", clearOutput);
exampleSelect.addEventListener("change", handleExampleChange);
validateBtn.addEventListener("click", handleValidate);
visualizeBtn.addEventListener("click", handleVisualize);
copyBtn.addEventListener("click", handleCopy);
vizBackBtn.addEventListener("click", hideVisualizeView);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !visualizeView.hidden) {
    hideVisualizeView();
  }
});

const DEFAULT_YAML = `# Gemara Playground
# Select a tutorial from the Examples dropdown, or start typing your own YAML.
#
# Then choose a Document Type and Version, and click Validate.
`;

async function verifyIntegrity(buffer, expectedHex) {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  if (hashHex !== expectedHex) {
    throw new Error("WASM integrity check failed: hash mismatch");
  }
}

async function initWasm() {
  try {
    validateBtn.disabled = true;
    validateBtn.textContent = "Loading…";

    const [wasmResp, hashResp] = await Promise.all([
      fetch("validate.wasm"),
      fetch("validate.wasm.sha256"),
    ]);
    if (!wasmResp.ok) throw new Error(`WASM fetch failed: HTTP ${wasmResp.status}`);

    const wasmBytes = await wasmResp.arrayBuffer();

    if (hashResp.ok) {
      const expectedHash = (await hashResp.text()).trim();
      await verifyIntegrity(wasmBytes, expectedHash);
    }

    const go = new Go();
    const result = await WebAssembly.instantiate(wasmBytes, go.importObject);
    go.run(result.instance);
    wasmReady = true;
    validateBtn.disabled = false;
    validateBtn.textContent = "Validate";
  } catch (err) {
    console.error("WASM init failed:", err);
    validateBtn.textContent = "Validate (unavailable)";
  }
}

async function buildWorkspaceIndex(tutorials) {
  const tutorialDocs = [];
  for (const t of tutorials) {
    try {
      const resp = await fetch(`tutorials/${t.filename}`);
      if (!resp.ok) continue;
      tutorialDocs.push({ filename: t.filename, content: await resp.text() });
    } catch {
      continue;
    }
  }
  workspace = indexWorkspace(tutorialDocs);
}

async function init() {
  populateDocTypes();
  initEditor(DEFAULT_YAML);

  const [, tutorials] = await Promise.all([
    loadVersions(),
    loadTutorials(),
    initWasm(),
  ]);

  const manifest = await fetch("tutorials/manifest.json")
    .then((r) => r.json())
    .catch(() => []);

  if (manifest.length > 0) {
    await buildWorkspaceIndex(manifest);
    const first = manifest[0];
    await loadTutorialFile(first.filename, first.definition);
    exampleSelect.value = first.filename;
  }
}

init();
