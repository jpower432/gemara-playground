## ADDED Requirements

### Requirement: Resolve references against tutorial workspace
The system SHALL resolve `reference-id` values by matching them against the `metadata.id` field of all tutorial YAML files in the workspace (`web/tutorials/`).

#### Scenario: Reference matches a tutorial document
- **WHEN** a parsed reference has `reference-id: SEC.SLAM.CM` and the workspace contains a Threat Catalog with `metadata.id: SEC.SLAM.CM`
- **THEN** the reference is resolved to a full node with the document's title, type, layer, and filename

#### Scenario: Reference does not match any workspace document
- **WHEN** a parsed reference has `reference-id: CCC` and no workspace document has `metadata.id: CCC`
- **THEN** the reference is an unresolved stub node with metadata from `mapping-references` (title, version, URL)

### Requirement: Index workspace documents on server startup
The system SHALL read and index all YAML files in `web/tutorials/` at startup, extracting `metadata.id`, `metadata.type`, and `title` for each document to enable fast resolution.

#### Scenario: Server starts with tutorial files present
- **WHEN** the server starts and `web/tutorials/` contains YAML files
- **THEN** each file is parsed and indexed by its `metadata.id`

#### Scenario: Multiple documents share the same metadata.id
- **WHEN** two workspace documents have the same `metadata.id` but different `metadata.type` values (e.g., ThreatCatalog and ControlCatalog both using `SEC.SLAM.CM`)
- **THEN** the resolver returns all matches and disambiguates using context from the reference field type (e.g., `threats` references resolve to ThreatCatalog, `imports.controls` resolves to ControlCatalog)

### Requirement: Self-references are identified
The system SHALL detect when a `reference-id` matches the editor document's own `metadata.id` and mark it as a self-reference rather than creating a duplicate node.

#### Scenario: Control Catalog references its own ID in threat-mappings
- **WHEN** a Control Catalog with `metadata.id: SEC.SLAM.CM` contains `threat-mappings[].reference-id: SEC.SLAM.CM`
- **THEN** the resolver identifies this as a self-reference and does not create a separate node

### Requirement: Determine Gemara layer for resolved nodes
The resolver SHALL assign a Gemara layer (1, 2, or 3) to each resolved node based on its document type.

#### Scenario: Layer assignment by document type
- **WHEN** a resolved node has type GuidanceCatalog or PrincipleCatalog
- **THEN** it is assigned Layer 1
- **WHEN** a resolved node has type ThreatCatalog, ControlCatalog, CapabilityCatalog, or VectorCatalog
- **THEN** it is assigned Layer 2
- **WHEN** a resolved node has type Policy, RiskCatalog, EvaluationLog, EnforcementLog, or AuditLog
- **THEN** it is assigned Layer 3
