## Context

The Gemara Playground currently validates individual YAML documents against CUE schemas. Gemara's layered model (Layer 1: Guidance, Layer 2: Controls/Threats, Layer 3: Policy/Risk) relies heavily on cross-document references via `reference-id` fields and `mapping-references` metadata. Users authoring or reviewing documents have no way to see these relationships without manually tracing IDs across files.

The playground already bundles 5 tutorial YAML files that reference each other (Threat Catalog, Control Catalog, Guidance Catalog, Policy, Risk Catalog). These form a ready-made resolution pool.

## Goals / Non-Goals

**Goals:**
- Interactive graph visualization showing depth-1 cross-document relationships from the editor document
- Auto-resolution of `reference-id` values against the bundled tutorial workspace
- Layered layout reflecting Gemara's Layer 1/2/3 architecture
- Unresolvable external references displayed as stub nodes with metadata
- Clicking a resolved node loads that document into the editor

**Non-Goals:**
- Depth-2+ resolution (future: expand-on-click)
- Explicit multi-file workspace / user-uploaded document sets (future)
- Auto-fetch from arbitrary URLs (future: only when URL points to raw YAML)
- Real-time graph updates as user types (graph refreshes on explicit action)
- Editing documents from within the graph view

## Decisions

### 1. Backend Reference Parser + Resolver

**Choice:** New `internal/resolve/` package that parses Gemara YAML and extracts references, then resolves them against tutorial files on disk.

**Rationale:** Reference extraction requires understanding Gemara's structure (which fields contain `reference-id`, how `mapping-references` work). Doing this server-side keeps the client thin and reuses the Go YAML parsing already in the project. The tutorial files are already served from `web/tutorials/` — the backend reads and indexes them by `metadata.id` on startup.

**Alternatives considered:**
- *Client-side parsing*: Would require shipping a YAML parser to the browser and duplicating Gemara structure knowledge. Rejected.
- *Embedding resolution in the validate endpoint*: Conflates two concerns. Rejected — separate endpoint is cleaner.

### 2. Reference Extraction Fields

**Choice:** Extract references from these Gemara YAML fields:

| Field Path | Found In | References |
|:---|:---|:---|
| `mapping-references[].id` | All types | Declares external document IDs |
| `imported-capabilities[].reference-id` | ThreatCatalog | External CapabilityCatalogs |
| `imported-threats[].reference-id` | ThreatCatalog | External ThreatCatalogs |
| `threats[].capabilities[].reference-id` | ThreatCatalog | Capability sources |
| `controls[].threats[].reference-id` | ControlCatalog | Threat sources |
| `controls[].threat-mappings[].reference-id` | ControlCatalog | Threat sources |
| `imports.controls[].reference-id` | ControlCatalog | External ControlCatalogs |
| `imports.catalogs[].reference-id` | Policy | ControlCatalogs |
| `risks[].threats[].reference-id` | RiskCatalog | Threat sources |
| `guidelines[].see-also[]` | GuidanceCatalog | Internal guideline refs |

**Rationale:** These are all the cross-document reference patterns in the current Gemara schema. The parser must handle all of them to produce a complete graph.

### 3. Resolution Strategy (Depth-1, Workspace-First)

**Choice:** Three-tier resolution:
1. **Workspace match**: Compare `reference-id` against `metadata.id` of all tutorial YAML files. If matched, include full node with title, type, and internal structure summary.
2. **Self-reference**: If `reference-id` matches the editor document's own `metadata.id`, mark as self-referential (common for threat/control catalogs sharing an ID namespace).
3. **Stub**: If unresolved, create a stub node using `mapping-references` metadata (title, version, URL) for display.

**Rationale:** Workspace match covers the tutorial scenario (all 5 tutorials reference each other via `SEC.SLAM.CM` and `CCC`). Stubs with mapping-reference metadata are still informative — users see the relationship exists even without the full document. Depth limit of 1 prevents unbounded resolution and keeps the graph readable.

### 4. Graph Layout: Layered Dagre via D3

**Choice:** D3.js for rendering with dagre-d3 for automatic layered layout. Nodes arranged in three columns (Layer 1, Layer 2, Layer 3) with edges drawn between them.

**Rationale:** Gemara's layer model provides a natural layout axis. Dagre produces clean hierarchical layouts without manual positioning. D3 is the standard for interactive SVG graphs and is available via CDN (no npm required). The graph is small enough (typically 3-8 nodes at depth 1) that performance is not a concern.

**Alternatives considered:**
- *Force-directed layout*: Good for arbitrary graphs, but loses the layer structure that makes Gemara relationships meaningful. Rejected.
- *Elk.js*: More powerful layout engine, but heavier and less common via CDN. Rejected for v1.
- *Canvas rendering*: Harder to make interactive (click, hover). SVG via D3 is better for small graphs. Rejected.

### 5. Output Panel Tab Switching

**Choice:** Add tab bar to output panel with "Validate" and "Visualize" tabs. Each tab preserves its state — switching tabs does not re-run validation or re-fetch the graph.

**Rationale:** Users need both views. Tabs avoid layout changes and keep the single-panel output design. The Validate tab retains existing behavior. The Visualize tab renders on explicit click of a "Visualize" button (analogous to the Validate button).

### 6. Node Interaction: Click to Load

**Choice:** Clicking a resolved graph node loads that tutorial document into the editor, auto-selects its document type, and clears validation results. Stub nodes are not clickable (no document to load). A confirmation prompt appears if the editor has unsaved changes.

**Rationale:** Reuses the existing tutorial-loading flow (same dirty-check, same document type auto-selection). Makes the graph a navigation tool, not just a static picture.

### 7. Graph Data Model (API Response)

**Choice:** `POST /api/resolve` returns a JSON graph:

```json
{
  "center": {
    "id": "SEC.SLAM.CM",
    "title": "Container Management Tool Security Control Catalog",
    "type": "ControlCatalog",
    "layer": 2
  },
  "nodes": [
    {
      "id": "SEC.SLAM.CM-threats",
      "title": "Container Management Tool Security Threat Catalog",
      "type": "ThreatCatalog",
      "layer": 2,
      "resolved": true,
      "filename": "threat-catalog.yaml"
    },
    {
      "id": "CCC",
      "title": "Common Cloud Controls Core",
      "type": null,
      "layer": null,
      "resolved": false,
      "url": "https://github.com/finos/common-cloud-controls/releases"
    }
  ],
  "edges": [
    {
      "source": "SEC.SLAM.CM",
      "target": "SEC.SLAM.CM-threats",
      "type": "threats",
      "details": ["THR01", "THR02", "THR03", "THR04"]
    },
    {
      "source": "SEC.SLAM.CM",
      "target": "CCC",
      "type": "imports",
      "details": ["CCC.Core.CTL42"]
    }
  ]
}
```

**Rationale:** Separating nodes and edges allows the client to render with any graph library. The `resolved` flag and `filename` enable click-to-load. The `layer` field drives column placement. Edge `details` provide hover information showing which specific IDs created the relationship.

## Risks / Trade-offs

| Risk | Mitigation |
|:---|:---|
| Tutorial workspace may not contain documents matching user's custom `reference-id` values | Stub nodes show the reference exists with metadata from `mapping-references`; future: explicit workspace upload |
| Gemara schema adds new reference fields in future versions | Reference extraction fields are centralized in one parser function; straightforward to extend |
| D3 + dagre-d3 CDN bundle size adds page weight | Only loaded when Visualize tab is first activated (lazy load); both libraries are well-cached |
| Graph becomes cluttered with many references | Depth-1 limit caps node count; typical documents produce 3-8 nodes |
| Self-referencing IDs (threat catalog and control catalog share `SEC.SLAM.CM`) cause ambiguous resolution | Resolver distinguishes by document type when multiple workspace docs share an ID |
