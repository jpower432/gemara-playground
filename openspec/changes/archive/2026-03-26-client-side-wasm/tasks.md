## 1. Build-Time Schema Bundler

- [x] 1.1 Create `cmd/bundler/main.go` — CLI tool that queries `registry.cue.works` for Gemara versions and downloads CUE definitions for each version
- [x] 1.2 Output `web/versions.json` (sorted descending) and `web/schemas/<version>/` directories with `.cue` files
- [x] 1.3 Add `make sync-schemas` target that runs the bundler
- [x] 1.4 Run the bundler and commit the initial schema assets for current Gemara versions

## 2. WASM Validation Bridge

- [x] 2.1 Create `cmd/wasm/main.go` with `//go:build js && wasm` — registers a `ValidateYAML` function on a global JS API object via `syscall/js`
- [x] 2.2 Implement the validation function: accept YAML string + CUE schema string, use `load.Config.Overlay` to build an in-memory CUE module, validate, return `{valid, errors}` as a JS object
- [x] 2.3 Add `make build-wasm` target: `GOOS=js GOARCH=wasm go build -o web/validate.wasm ./cmd/wasm/`
- [x] 2.4 Copy `wasm_exec.js` from the Go SDK to `web/` as part of the build target
- [x] 2.5 Verify the WASM binary loads and the validation function is callable from a browser console

## 3. JavaScript Reference Parser and Resolver

- [x] 3.1 Create `web/src/resolve.js` — port `extractIdentity`, `inferDocType`, `extractMappingRefs`, and `extractAllReferences` from Go to JS using `js-yaml`
- [x] 3.2 Port workspace resolver logic: `findByID`, `disambiguate`, `resolveNode`, layer assignment, self-reference detection
- [x] 3.3 Add `js-yaml` to the import map in `index.html` (ESM from `esm.sh`)
- [x] 3.4 Implement `indexWorkspace()` — fetch `tutorials/manifest.json`, fetch each tutorial YAML, parse and index by `metadata.id`
- [x] 3.5 Implement `resolveDocument(yamlContent, workspaceIndex)` — return the same graph structure as the Go `/api/resolve` endpoint
- [x] 3.6 Write test cases verifying JS parser output matches Go parser output for each tutorial document

## 4. Frontend Rewire

- [x] 4.1 Add WASM initialization to `app.js`: load `wasm_exec.js`, instantiate `validate.wasm`, show loading state on Validate button until ready
- [x] 4.2 Replace `loadVersions()` to fetch `versions.json` instead of `/api/versions`
- [x] 4.3 Replace `handleValidate()` to fetch the schema `.cue` file from `schemas/<version>/<definition>.cue` and call the WASM validation function
- [x] 4.4 Replace `handleVisualize()` to call the JS `resolveDocument()` instead of `POST /api/resolve`
- [x] 4.5 Call `indexWorkspace()` at page init alongside `loadVersions()` and `loadTutorials()`
- [x] 4.6 Verify all user flows work end-to-end: validate, visualize, tutorial load, version switch, copy

## 5. Build Pipeline and Makefile

- [x] 5.1 Add composite `make build-static` target that runs `sync-schemas`, `build-wasm`, and assembles the `web/` directory as a deployable static site
- [x] 5.2 Add `make dev` alternative that uses the Go server for local development convenience
- [x] 5.3 Update `Dockerfile` to serve static files via a lightweight HTTP server (e.g., `nginx` or `caddy`) instead of the Go binary, or remove it in favor of GitHub Pages

## 6. CI Schema Freshness Workflow

- [x] 6.1 Add `.github/workflows/sync-schemas.yaml` — daily cron that runs `make sync-schemas`, diffs `versions.json`, and triggers rebuild + deploy if changed
- [x] 6.2 Pin all Actions to commit SHAs per the ci-lint-test spec

## 7. Cleanup

- [x] 7.1 Remove `internal/handlers/` HTTP handlers (validate, versions, resolve, CORS)
- [x] 7.2 Remove `internal/registry/` runtime registry client
- [x] 7.3 Remove `cmd/server/main.go` entry point (or retain as optional local dev mode)
- [x] 7.4 Update `README.md` with new build instructions, architecture overview, and deployment guide
