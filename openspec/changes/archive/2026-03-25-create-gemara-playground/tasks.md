## 1. Project Scaffolding

- [x] 1.1 Initialize Go module (`go mod init`) and create project directory layout (`cmd/server/`, `internal/validate/`, `internal/registry/`, `internal/handlers/`, `web/`, `web/src/`, `web/tutorials/`)
- [x] 1.2 Create `Makefile` with targets: `build`, `run`, `dev`, `test`, `lint`, `sync-tutorials`
- [x] 1.3 Add standard repo files: `README.md`, `LICENSE` (Apache-2.0), `.gitignore`
- [x] 1.4 Add CUE Go SDK dependency (`cuelang.org/go`)

## 2. Backend — CUE Registry Version Fetcher

- [x] 2.1 Implement `internal/registry/` package: fetch version list from `registry.cue.works` module proxy API for `github.com/gemaraproj/gemara`
- [x] 2.2 Add in-memory cache with configurable TTL for the version list
- [x] 2.3 Add `GET /api/versions` handler that returns the cached version list as JSON (sorted descending)
- [x] 2.4 Write tests for version fetching and cache expiry

## 3. Backend — Schema Validation API

- [x] 3.1 Implement `internal/validate/` package: accept YAML string, Gemara version, and CUE definition name; load the Gemara module at that version via Go CUE SDK; validate YAML against the definition
- [x] 3.2 Return structured validation result: success boolean, list of errors with field paths and messages
- [x] 3.3 Add `POST /api/validate` handler that accepts JSON body `{ "yaml": "...", "version": "...", "definition": "..." }` and returns validation results
- [x] 3.4 Return HTTP 400 for missing `version` or `definition` fields; return HTTP 400 for unparseable YAML with line number
- [x] 3.5 Write tests for valid documents, schema violations, malformed YAML, and missing request fields

## 4. Backend — Server Setup

- [x] 4.1 Create `cmd/server/main.go` entry point: wire handlers, configure CORS, serve static files from `web/`
- [x] 4.2 Add configuration via environment variables: port, cache TTL, allowed origins
- [x] 4.3 Add `Dockerfile` for container build (multi-stage: Go build + minimal runtime)

## 5. Frontend — Editor and Layout

- [x] 5.1 Create `web/index.html` with layout: header (title, selectors, validate button), editor panel, output panel
- [x] 5.2 Integrate CodeMirror 6 with YAML language support (`@codemirror/lang-yaml`), line numbers, bracket matching, search/replace
- [x] 5.3 Style the editor and output panel with a clean, modern dark/light theme
- [x] 5.4 Load default tutorial content (Control Catalog) into editor on first page load

## 6. Frontend — Document Type Selector

- [x] 6.1 Build document type dropdown mapping display names to CUE definitions (all 12 types from design)
- [x] 6.2 Auto-select document type when a tutorial is loaded
- [x] 6.3 Clear validation results when document type changes
- [x] 6.4 Prevent validation if no document type is selected (highlight selector with error)

## 7. Frontend — Version Selector

- [x] 7.1 Fetch version list from `GET /api/versions` on page load and populate dropdown
- [x] 7.2 Default selection to latest (first in list)
- [x] 7.3 Clear validation results when version changes; preserve editor content
- [x] 7.4 Show fallback message if version list request fails

## 8. Frontend — Validation Flow

- [x] 8.1 Wire "Validate" button to `POST /api/validate` with editor content, selected version, and selected definition
- [x] 8.2 Show loading spinner on button and disable it during request
- [x] 8.3 Display success state in output panel (green indicator + message)
- [x] 8.4 Display error state in output panel (scrollable, monospaced error list with field paths)
- [x] 8.5 Display YAML parse errors with line number

## 9. Frontend — Tutorial Examples

- [x] 9.1 Create tutorial manifest (`web/tutorials/manifest.json`) listing each example: name, description, filename, CUE definition
- [x] 9.2 Vendor tutorial YAML files from Gemara docs into `web/tutorials/`
- [x] 9.3 Build examples dropdown that loads tutorials from manifest
- [x] 9.4 Implement dirty-check: prompt user before replacing modified editor content with a tutorial

## 10. Integration and Polish

- [x] 10.1 End-to-end test: load page, select tutorial, validate, verify success
- [x] 10.2 End-to-end test: load page, enter invalid YAML, validate, verify error display
- [x] 10.3 Add link to Gemara docs, CUE Playground, and GitHub repo in the header/footer
- [x] 10.4 Add `Makefile` target `sync-tutorials` to re-vendor tutorial YAML from upstream
