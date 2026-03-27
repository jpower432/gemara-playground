## 1. Backend — Reference Parser

- [x] 1.1 Create `internal/resolve/` package with types: `Graph`, `Node`, `Edge`, `Reference`
- [x] 1.2 Implement YAML metadata extractor: parse `metadata.id`, `metadata.type`, `title` from raw YAML
- [x] 1.3 Implement document type inference from top-level keys when `metadata.type` is absent (e.g., `controls` → ControlCatalog, `threats` → ThreatCatalog)
- [x] 1.4 Implement reference extractor for `mapping-references[].id` (all document types)
- [x] 1.5 Implement reference extractor for ThreatCatalog fields: `imported-capabilities`, `imported-threats`, `threats[].capabilities`
- [x] 1.6 Implement reference extractor for ControlCatalog fields: `controls[].threats`, `controls[].threat-mappings`, `imports.controls`
- [x] 1.7 Implement reference extractor for Policy fields: `imports.catalogs`
- [x] 1.8 Implement reference extractor for RiskCatalog fields: `risks[].threats`
- [x] 1.9 Implement reference extractor for GuidanceCatalog fields: `guidelines[].see-also`
- [x] 1.10 Write tests for reference extraction across all document types using tutorial YAML files

## 2. Backend — Workspace Resolver

- [x] 2.1 Implement workspace indexer: read and index all YAML files in `web/tutorials/` by `metadata.id` at startup
- [x] 2.2 Implement layer assignment function mapping document types to Gemara layers (1, 2, 3)
- [x] 2.3 Implement resolution logic: match `reference-id` against workspace index, return full node for matches and stub node for misses
- [x] 2.4 Handle self-references: detect when `reference-id` matches the editor document's own `metadata.id`
- [x] 2.5 Handle ambiguous IDs: disambiguate when multiple workspace documents share `metadata.id` using reference field context
- [x] 2.6 Populate stub nodes with metadata from `mapping-references` (title, version, URL)
- [x] 2.7 Write tests for workspace resolution, self-references, and stub generation

## 3. Backend — Resolve API Endpoint

- [x] 3.1 Add `POST /api/resolve` handler accepting JSON body `{ "yaml": "..." }`
- [x] 3.2 Wire parser and resolver: parse YAML, extract references, resolve against workspace, return graph JSON
- [x] 3.3 Return HTTP 400 for unparseable YAML
- [x] 3.4 Register handler in `cmd/server/main.go` and pass workspace index
- [x] 3.5 Write handler tests for valid requests, invalid YAML, and empty content

## 4. Frontend — Output Panel Tab Switching

- [x] 4.1 Add tab bar to output panel with "Validate" and "Visualize" tabs
- [x] 4.2 Implement tab state preservation: each tab retains its content when switching
- [x] 4.3 Show placeholder message in Visualize tab before first visualization
- [x] 4.4 Style tab bar consistent with existing dark theme

## 5. Frontend — Visualize Button and Flow

- [x] 5.1 Add "Visualize" button to toolbar alongside Validate and Copy buttons
- [x] 5.2 Wire Visualize button to send `POST /api/resolve` with editor content
- [x] 5.3 Switch output panel to Visualize tab when Visualize button is clicked
- [x] 5.4 Show loading state on Visualize button during request
- [x] 5.5 Show error message in Visualize tab if resolve request fails

## 6. Frontend — Graph Rendering

- [x] 6.1 Add D3.js and dagre-d3 via CDN import map
- [x] 6.2 Implement graph renderer: create SVG with layered layout (Layer 1 / Layer 2 / Layer 3 columns)
- [x] 6.3 Render resolved nodes as solid boxes with title, type label, and accent color
- [x] 6.4 Render stub nodes as dashed, dimmed boxes with title and "external" label
- [x] 6.5 Render center node with distinct accent border and "editing" indicator
- [x] 6.6 Render edges between nodes with directional arrows
- [x] 6.7 Implement edge hover tooltip showing reference type and specific IDs
- [x] 6.8 Implement click handler on resolved nodes: load tutorial into editor with dirty-check and document type auto-select
- [x] 6.9 Add layer column labels ("Layer 1 — Guidance", "Layer 2 — Controls", "Layer 3 — Policy")

## 7. Integration and Polish

- [x] 7.1 End-to-end test: load Control Catalog tutorial, click Visualize, verify graph shows Threat Catalog and CCC nodes
- [x] 7.2 End-to-end test: click a resolved node in the graph, verify document loads into editor
- [x] 7.3 End-to-end test: load a document with no references, verify graph shows only the center node
- [x] 7.4 Lazy-load D3/dagre-d3 scripts on first Visualize tab activation to reduce initial page weight
