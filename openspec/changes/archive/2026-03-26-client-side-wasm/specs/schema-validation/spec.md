## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: Validation request includes version and definition

**Reason**: The server-side API contract (`POST /api/validate` with JSON body) is removed. Validation is now a direct WASM function call in the browser. Version and definition are still required by the UI but are resolved to a schema file path client-side.
**Migration**: The frontend fetches the schema file directly and calls the WASM function.

### Requirement: Validate button shows loading state

**Reason**: Replaced by the WASM initialization loading state requirement in the `wasm-validation-bridge` spec. Per-request loading state is no longer needed because validation is synchronous in WASM (no network round-trip).
**Migration**: Loading state applies to WASM initialization, not individual validation calls.
