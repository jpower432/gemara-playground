## ADDED Requirements

### Requirement: Validate YAML against Gemara CUE schema
The system SHALL validate user-provided YAML content against the selected Gemara CUE schema definition and version by sending a request to the Go backend API.

#### Scenario: Valid YAML document
- **WHEN** user clicks "Validate" with valid YAML content matching the selected schema definition
- **THEN** the output panel displays a success message indicating the document is valid

#### Scenario: Invalid YAML document with schema violations
- **WHEN** user clicks "Validate" with YAML that violates the selected schema (e.g., missing required fields)
- **THEN** the output panel displays CUE validation errors with field paths and descriptions
- **AND** each error identifies the offending field and what constraint was violated

#### Scenario: Malformed YAML
- **WHEN** user clicks "Validate" with content that is not parseable as YAML
- **THEN** the output panel displays a YAML parse error with line number

### Requirement: Validation uses the Go CUE SDK
The backend SHALL validate using the Go CUE SDK (`cuelang.org/go`) by loading the Gemara module at the requested version from the CUE Central Registry and unifying the YAML content against the specified definition.

#### Scenario: Backend receives validation request
- **WHEN** the API receives a POST request with YAML content, a Gemara version, and a definition name
- **THEN** the backend loads `github.com/gemaraproj/gemara@<version>`, extracts the definition, validates the YAML, and returns structured results

### Requirement: Validation request includes version and definition
Each validation request SHALL specify the Gemara schema version and CUE definition name. The backend SHALL NOT assume defaults — the frontend is responsible for passing the user's selections.

#### Scenario: Request missing version or definition
- **WHEN** a validation request arrives without a version or definition field
- **THEN** the API returns an HTTP 400 error with a message indicating the missing field

### Requirement: Validation feedback is displayed in an output panel
Validation results SHALL appear in a dedicated output panel below or beside the editor, not in a popup or alert.

#### Scenario: Successful validation
- **WHEN** validation succeeds
- **THEN** the output panel displays a green success indicator and message

#### Scenario: Failed validation
- **WHEN** validation fails
- **THEN** the output panel displays errors in a readable, scrollable format with monospaced text

### Requirement: Validate button shows loading state
The "Validate" button SHALL indicate when a request is in flight and prevent duplicate submissions.

#### Scenario: Validation in progress
- **WHEN** user clicks "Validate" and the request is pending
- **THEN** the button displays a loading indicator and is disabled until the response arrives
