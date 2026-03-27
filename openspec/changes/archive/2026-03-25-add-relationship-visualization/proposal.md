## Why

Gemara documents form a traceable web across layers — Threat Catalogs reference capabilities, Control Catalogs reference threats, Policies import control catalogs, Risk Catalogs link back to threats. The playground validates individual files but gives no visibility into these cross-document relationships. Users authoring a Control Catalog cannot see which threats it mitigates or which policies consume it without manually tracing `reference-id` fields across files.

## What Changes

- New "Visualize" tab in the output panel (alongside validation results) that renders an interactive relationship graph
- New backend endpoint `POST /api/resolve` that parses a Gemara YAML document, extracts all `reference-id` and `mapping-references`, and resolves depth-1 references against the tutorial workspace
- Client-side graph rendering using a layered layout (Layer 1 / Layer 2 / Layer 3 columns) with interactive nodes and edges
- Resolved references shown as full nodes with title and ID; unresolvable external references shown as dimmed stub nodes with metadata from `mapping-references`
- Clicking a resolved node loads that document into the editor and auto-selects its document type

## Capabilities

### New Capabilities

- `reference-parser`: Backend logic to parse Gemara YAML and extract all cross-document references (mapping-references, imported-capabilities, imported-threats, threats, threat-mappings, imports)
- `relationship-graph`: Interactive graph visualization in the output panel showing how the current document connects to other Gemara artifacts, with Layer 1/2/3 layout and depth-1 resolution
- `workspace-resolver`: Resolution engine that matches `reference-id` values against loaded tutorial/workspace documents to build the relationship graph

### Modified Capabilities

- `yaml-editor`: Add "Visualize" tab toggle alongside existing validation output; clicking a resolved graph node loads that document into the editor

## Impact

- **Backend**: New `internal/resolve/` package and `POST /api/resolve` handler; tutorials directory becomes a resolution pool read by the backend
- **Frontend**: Output panel gains tab switching (Validate / Visualize); new graph rendering dependency (D3 or similar via CDN); new interaction flow for node clicks loading documents
- **Dependencies**: Graph layout library needed (client-side, CDN-hosted)
- **Existing behavior**: Validation flow unchanged; visualization is additive
