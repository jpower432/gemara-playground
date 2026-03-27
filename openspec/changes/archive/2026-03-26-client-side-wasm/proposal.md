## Why

The playground requires a running Go server for validation, version fetching, and reference resolution. This creates an ongoing infrastructure burden — a container or VM must stay up, be monitored, and scale with traffic. Moving compute to the browser via WASM eliminates runtime infrastructure entirely, enabling static-site deployment (GitHub Pages, CDN) at zero cost and zero operational overhead.

## What Changes

- **BREAKING** Remove the Go HTTP server (`cmd/server/`) as the runtime entry point
- Add a WASM build target (`cmd/wasm/`) that compiles the CUE validation engine to `GOOS=js GOARCH=wasm`
- Add a build-time script that fetches Gemara schema versions and CUE definitions from `registry.cue.works`, bundling them as static assets
- Generate a static `versions.json` at build time instead of proxying the registry at runtime
- Port reference parsing and workspace resolution from Go to JavaScript, running entirely in the browser
- Rewire `app.js` to call WASM for validation and use JS for resolution (no `/api/*` calls)
- Add a `wasm_exec.js` runtime and WASM loading/initialization flow to the frontend
- Retain the Go codebase as build tooling (schema fetcher, WASM compiler) rather than a runtime server

## Capabilities

### New Capabilities

- `wasm-validation-bridge`: Compile CUE validation to WASM and expose it to browser JS via `syscall/js`
- `build-time-schema-bundler`: Fetch Gemara versions and CUE definitions from registry at build time, outputting static assets

### Modified Capabilities

- `schema-validation`: Validation moves from Go server API to browser-side WASM invocation
- `version-selector`: Version list loads from static `versions.json` instead of server proxy to registry
- `reference-parser`: YAML parsing and reference extraction moves from Go server to browser JS
- `workspace-resolver`: Reference resolution against tutorial documents moves from Go server to browser JS

## Impact

- `cmd/server/` — removed as runtime entry point (retained for local dev convenience if desired)
- `cmd/wasm/` — new WASM build entry point
- `internal/validate/` — reused inside WASM build (schema loading changes from runtime registry to pre-bundled files)
- `internal/resolve/`, `internal/handlers/`, `internal/registry/` — no longer needed at runtime; resolve logic ported to JS
- `web/src/app.js` — major rewrite to remove all `/api/*` fetch calls, add WASM initialization, add JS-based resolution
- `web/` — new static assets: `validate.wasm`, `wasm_exec.js`, `versions.json`, `schemas/` directory
- `scripts/` — new build-time schema fetcher script
- `Makefile` — new targets for WASM build, schema sync, and static site assembly
- `Dockerfile` — simplified or removed (static files need no container)
- First page load increases ~5-8MB (compressed WASM binary); requires loading state
