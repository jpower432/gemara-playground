## Requirements

### Requirement: Validate YAML against Gemara CUE schema

The system SHALL validate user-provided YAML content against the selected Gemara CUE schema definition and version by invoking the WASM validation function in the browser. The browser SHALL fetch the CUE schema file from `schemas/<version>/<Definition>.cue` and pass it along with the YAML content to the WASM function.

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

The WASM binary SHALL validate using the Go CUE SDK (`cuelang.org/go`) compiled to WebAssembly. The browser SHALL fetch the pre-bundled CUE schema file for the selected version and definition, then pass it to the WASM validation function which creates an in-memory CUE module via `load.Config.Overlay` and validates the YAML content.

#### Scenario: Browser invokes WASM validation

- **WHEN** the user clicks Validate with a selected version and definition
- **THEN** the browser fetches `schemas/<version>/<Definition>.cue`, passes it with the YAML to the WASM function, and displays the result

### Requirement: Validation feedback is displayed in an output panel

Validation results SHALL appear in a dedicated output panel below or beside the editor, not in a popup or alert.

#### Scenario: Successful validation

- **WHEN** validation succeeds
- **THEN** the output panel displays a green success indicator and message

#### Scenario: Failed validation

- **WHEN** validation fails
- **THEN** the output panel displays errors in a readable, scrollable format with monospaced text
