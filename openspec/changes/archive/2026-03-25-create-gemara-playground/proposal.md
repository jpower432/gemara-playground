## Why

No browser-based tool exists for authoring and validating Gemara YAML documents. Users must install `go`, `cue`, and run CLI commands locally just to check if their Control Catalog or Policy is schema-valid. This friction slows adoption — especially for GRC practitioners who aren't developers. Playground-style tools (Rego, Cedar, OpenFGA, Go) have proven that lowering the barrier to "try it now" accelerates community growth and learning.

## What Changes

- New web application: browser-based YAML editor with Gemara schema validation
- Gemara schema version selector pulling available versions from the CUE Central Registry, defaulting to latest
- Seeded tutorial content from existing Gemara tutorials (Control Catalog, Threat Assessment, Guidance, Policy, Risk Catalog)
- One-click "Validate" button that runs `cue vet` against the selected schema definition and version
- Schema-type selector so users pick the document type (e.g., `#ControlCatalog`, `#ThreatCatalog`, `#Policy`) and the correct validation command is constructed

## Capabilities

### New Capabilities

- `yaml-editor`: Browser-based YAML editor with syntax highlighting and error display
- `schema-validation`: Server-side or WASM-based CUE validation of YAML against Gemara schemas
- `version-selector`: Fetch and display available Gemara schema versions from the CUE Central Registry
- `tutorial-content`: Pre-loaded example YAML documents sourced from Gemara tutorials
- `document-type-selector`: Choose which Gemara schema definition to validate against

### Modified Capabilities

_(none — greenfield project)_

## Impact

- **Dependencies:** CUE tooling (WASM or server-side), Gemara schema module from CUE Registry
- **Infrastructure:** Static frontend hosting + validation backend (or client-side WASM)
- **Upstream:** Tutorial YAML content sourced from `gemara.openssf.org/tutorials/`; schema versions from `registry.cue.works`
- **Community:** Linked from Gemara docs as the recommended "try it" entry point
