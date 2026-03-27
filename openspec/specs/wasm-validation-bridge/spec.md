## Requirements

### Requirement: WASM binary exposes a validation function to JavaScript

The build SHALL produce a `validate.wasm` binary compiled with `GOOS=js GOARCH=wasm` that registers a JavaScript-callable function for validating YAML against a CUE schema.

#### Scenario: WASM loads and registers function

- **WHEN** the browser loads and instantiates `validate.wasm` with `wasm_exec.js`
- **THEN** a validation function is available on a global API object callable from JavaScript

### Requirement: Validation function accepts YAML and CUE schema source

The WASM validation function SHALL accept YAML content (string) and CUE schema source (string), evaluate the YAML against the schema using the CUE Go SDK, and return structured results.

#### Scenario: Valid YAML against schema

- **WHEN** the JS caller passes valid YAML and a matching CUE definition source
- **THEN** the function returns a result indicating the document is valid

#### Scenario: Invalid YAML against schema

- **WHEN** the JS caller passes YAML that violates the CUE schema constraints
- **THEN** the function returns a result with an array of errors containing field paths and messages

#### Scenario: Unparseable YAML

- **WHEN** the JS caller passes content that is not valid YAML
- **THEN** the function returns a result with a parse error

### Requirement: WASM uses in-memory schema loading

The WASM validation logic SHALL load CUE schemas via `load.Config.Overlay` from the string passed by JavaScript. It SHALL NOT access the network or filesystem from within WASM.

#### Scenario: Schema provided as string

- **WHEN** the JS caller passes a CUE schema definition as a string
- **THEN** the WASM function creates an in-memory CUE module overlay and evaluates against it without network calls

### Requirement: WASM initialization shows loading state

The frontend SHALL display a loading indicator while the WASM binary is being fetched and instantiated, and SHALL disable the Validate button until initialization completes.

#### Scenario: Page load with WASM not yet ready

- **WHEN** the page loads and WASM is still downloading or initializing
- **THEN** the Validate button is disabled and shows a loading indicator

#### Scenario: WASM initialization completes

- **WHEN** WASM finishes loading and the validation function is registered
- **THEN** the Validate button becomes enabled
