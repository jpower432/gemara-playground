## MODIFIED Requirements

### Requirement: Parse cross-document references from Gemara YAML

The system SHALL parse a Gemara YAML document in the browser using JavaScript and extract all cross-document references, including `mapping-references`, `imported-capabilities`, `imported-threats`, `threats`, `threat-mappings`, `imports`, and `see-also` fields. The parsing logic SHALL be a JavaScript port of the existing Go parser.

#### Scenario: Parse a Control Catalog with threat references

- **WHEN** the parser receives a Control Catalog YAML containing `controls[].threats[].reference-id` entries
- **THEN** it returns a list of references with source field path, reference ID, and referenced entry IDs

#### Scenario: Parse a Threat Catalog with imported capabilities and threats

- **WHEN** the parser receives a Threat Catalog YAML containing `imported-capabilities` and `imported-threats` entries
- **THEN** it returns references for each imported source with the reference ID and individual entry IDs

#### Scenario: Parse a Policy with catalog imports

- **WHEN** the parser receives a Policy YAML containing `imports.catalogs[].reference-id` entries
- **THEN** it returns references for each imported catalog with the reference ID

#### Scenario: Parse a Risk Catalog with threat references

- **WHEN** the parser receives a Risk Catalog YAML containing `risks[].threats[].reference-id` entries
- **THEN** it returns references for each threat source with the reference ID and entry IDs

#### Scenario: Parse a Guidance Catalog with see-also references

- **WHEN** the parser receives a Guidance Catalog YAML containing `guidelines[].see-also` entries
- **THEN** it returns internal cross-references between guidelines

### Requirement: Extract document identity from metadata

The parser SHALL extract the document's own identity (`metadata.id`, `metadata.type`, `title`) to identify the center node of the graph. When `metadata.type` is absent, the parser SHALL infer the type from top-level keys.

#### Scenario: Document has complete metadata

- **WHEN** the parser receives a YAML document with `metadata.id`, `metadata.type`, and `title` fields
- **THEN** it returns the document identity with all three fields populated

#### Scenario: Document has no metadata.type field

- **WHEN** the parser receives a YAML document without a `metadata.type` field
- **THEN** it infers the document type from the presence of top-level keys (e.g., `controls` implies ControlCatalog, `threats` implies ThreatCatalog)

### Requirement: Extract mapping-references metadata

The parser SHALL extract `mapping-references` entries to provide display metadata (title, version, URL) for stub nodes.

#### Scenario: Document has mapping-references

- **WHEN** the parser receives a YAML document with `metadata.mapping-references` entries
- **THEN** it returns each mapping reference with its ID, title, version, and URL

## REMOVED Requirements

### Requirement: Expose parser via API endpoint

**Reason**: The Go HTTP server and `POST /api/resolve` endpoint are removed. Parsing and resolution happen entirely in browser JavaScript.
**Migration**: The frontend calls the JS parser module directly instead of making an HTTP request.
