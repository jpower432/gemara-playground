## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: Index workspace documents on server startup

**Reason**: No server exists at runtime. Workspace indexing happens in the browser at page load by fetching and parsing tutorial YAML files.
**Migration**: The browser fetches tutorial files listed in `manifest.json` and builds the index in memory.
