## Requirements

### Requirement: Resolve references against tutorial workspace

The system SHALL resolve `reference-id` values by matching them against the `metadata.id` field of all tutorial YAML files. Tutorial documents SHALL be fetched by the browser from `tutorials/manifest.json` and the corresponding YAML files, then indexed in memory for resolution.

#### Scenario: Reference matches a tutorial document

- **WHEN** a parsed reference has `reference-id: SEC.SLAM.CM` and the workspace contains a Threat Catalog with `metadata.id: SEC.SLAM.CM`
- **THEN** the reference is resolved to a full node with the document's title, type, layer, and filename

#### Scenario: Reference does not match any workspace document

- **WHEN** a parsed reference has `reference-id: CCC` and no workspace document has `metadata.id: CCC`
- **THEN** the reference is an unresolved stub node with metadata from `mapping-references` (title, version, URL)

### Requirement: Index workspace documents in the browser

The system SHALL read and parse all tutorial YAML files listed in `tutorials/manifest.json` at page load, extracting `metadata.id`, `metadata.type`, and `title` for each document to enable fast resolution.

#### Scenario: Page loads with tutorial files available

- **WHEN** the page loads and `tutorials/manifest.json` lists tutorial files
- **THEN** each listed tutorial YAML file is fetched, parsed, and indexed by its `metadata.id`

#### Scenario: Multiple documents share the same metadata.id

- **WHEN** two workspace documents have the same `metadata.id` but different `metadata.type` values
- **THEN** the resolver returns all matches and disambiguates using context from the reference field type

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
