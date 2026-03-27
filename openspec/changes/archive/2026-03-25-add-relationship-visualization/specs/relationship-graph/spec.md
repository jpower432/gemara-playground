## ADDED Requirements

### Requirement: Render interactive layered graph
The system SHALL render an SVG graph in the Visualize tab with nodes arranged in three columns corresponding to Gemara Layers 1, 2, and 3. Edges SHALL connect nodes to show reference relationships.

#### Scenario: Graph with nodes across multiple layers
- **WHEN** the resolve API returns nodes spanning Layer 1, Layer 2, and Layer 3
- **THEN** the graph arranges nodes in three labeled columns (Layer 1 left, Layer 2 center, Layer 3 right)
- **AND** edges are drawn between connected nodes

#### Scenario: Graph with only Layer 2 and Layer 3 nodes
- **WHEN** the resolve API returns nodes in Layer 2 and Layer 3 only
- **THEN** the graph renders two columns with appropriate labels

### Requirement: Distinguish resolved and stub nodes visually
Resolved nodes SHALL appear as solid, fully colored nodes. Stub (unresolved) nodes SHALL appear dimmed with a dashed border.

#### Scenario: Resolved node display
- **WHEN** a node has `resolved: true`
- **THEN** it displays with a solid border, full color, document title, and document type label

#### Scenario: Stub node display
- **WHEN** a node has `resolved: false`
- **THEN** it displays with a dashed border, dimmed color, title from mapping-references metadata, and an "external" label

### Requirement: Highlight center node
The center node (the document currently in the editor) SHALL be visually distinct from other nodes.

#### Scenario: Center node styling
- **WHEN** the graph renders
- **THEN** the center node has an accent-colored border and a "Currently editing" indicator

### Requirement: Display edge labels on hover
Edges SHALL show detail information (reference type and specific IDs) when hovered.

#### Scenario: Hover over an edge
- **WHEN** user hovers over an edge connecting a Control Catalog to a Threat Catalog
- **THEN** a tooltip displays the edge type (e.g., "threats") and the specific IDs (e.g., "THR01, THR02, THR03")

### Requirement: Click resolved node to load document
Clicking a resolved node SHALL load that document into the editor, auto-select its document type, and switch to the Validate tab.

#### Scenario: Click a resolved tutorial node
- **WHEN** user clicks a resolved node for "Container Management Tool Security Threat Catalog"
- **THEN** the Threat Catalog tutorial YAML loads into the editor
- **AND** the document type selector changes to "Threat Catalog"
- **AND** the output panel switches to the Validate tab

#### Scenario: Click a resolved node with unsaved editor changes
- **WHEN** user has modified the editor content and clicks a resolved graph node
- **THEN** a confirmation prompt asks whether to discard changes before loading

#### Scenario: Click a stub node
- **WHEN** user clicks a stub (unresolved) node
- **THEN** nothing happens (stub nodes are not interactive)

### Requirement: Visualize button triggers graph rendering
The system SHALL render the graph when the user clicks a "Visualize" button, not automatically on every editor change.

#### Scenario: User clicks Visualize
- **WHEN** user clicks the "Visualize" button
- **THEN** the editor content is sent to `POST /api/resolve`
- **AND** the response is rendered as an interactive graph in the Visualize tab

#### Scenario: Visualize with empty editor
- **WHEN** user clicks "Visualize" with no content in the editor
- **THEN** the Visualize tab shows a message indicating no document to analyze

#### Scenario: Resolve request fails
- **WHEN** the `POST /api/resolve` request fails
- **THEN** the Visualize tab shows an error message
