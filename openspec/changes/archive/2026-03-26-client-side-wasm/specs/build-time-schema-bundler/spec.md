## ADDED Requirements

### Requirement: Fetch Gemara versions from the CUE registry at build time

The build pipeline SHALL query `registry.cue.works` for all available versions of `github.com/gemaraproj/gemara` and generate a `web/versions.json` file containing the version list sorted newest-first.

#### Scenario: Build with registry reachable

- **WHEN** the schema sync build step runs and the CUE registry is reachable
- **THEN** `web/versions.json` is generated with all available Gemara versions sorted descending

#### Scenario: Build with registry unreachable

- **WHEN** the schema sync build step runs and the CUE registry is unreachable
- **THEN** the build fails with a clear error message indicating the registry could not be reached

### Requirement: Download CUE definitions for each version

The build pipeline SHALL download the CUE schema definitions for each Gemara version and write them as static files under `web/schemas/<version>/`.

#### Scenario: Schema files generated for a version

- **WHEN** the build step processes Gemara version `v0.1.0`
- **THEN** CUE definition files are written to `web/schemas/v0.1.0/` with one file per definition type

### Requirement: Compile WASM binary at build time

The build pipeline SHALL compile the WASM entry point with `GOOS=js GOARCH=wasm go build` and output `web/validate.wasm`. It SHALL also copy the matching `wasm_exec.js` from the Go SDK to `web/`.

#### Scenario: WASM build completes

- **WHEN** `make build-wasm` is run
- **THEN** `web/validate.wasm` and `web/wasm_exec.js` are produced

### Requirement: Scheduled CI workflow checks for new versions

A GitHub Actions workflow SHALL run on a daily schedule to check for new Gemara versions. If new versions are found, it SHALL rebuild and redeploy the static site.

#### Scenario: New Gemara version published

- **WHEN** the daily CI cron runs and detects a new version not in the current `versions.json`
- **THEN** the workflow rebuilds the static site with updated schemas and deploys it

#### Scenario: No new versions

- **WHEN** the daily CI cron runs and no new versions are detected
- **THEN** the workflow exits without rebuilding or deploying
