## Context

The gemara-playground is a Go 1.25 server that serves a vanilla JS frontend and exposes three API endpoints: `/api/versions` (proxy to CUE registry), `/api/validate` (CUE SDK validation), and `/api/resolve` (YAML reference resolution). The frontend uses CodeMirror via ESM imports from `esm.sh`. The CUE playground at `cuelang.org/play` demonstrates a proven pattern for compiling the CUE Go SDK to WASM and running it in the browser via `GOOS=js GOARCH=wasm`.

## Goals / Non-Goals

**Goals:**

- Eliminate all runtime server infrastructure — the playground runs as a fully static site
- Validate Gemara YAML against CUE schemas entirely in the browser via WASM
- Fetch schema versions and CUE definitions at build time, serve as static assets
- Port reference parsing and resolution to JavaScript for browser-side execution
- Deployable to GitHub Pages, Netlify, S3, or any static file host
- Retain the Go codebase as build tooling

**Non-Goals:**

- Rewriting the CUE evaluation engine (we compile the existing Go SDK to WASM)
- Supporting offline-first with service workers (future enhancement)
- Changing the user-facing UI or interaction patterns
- Migrating the frontend to a JS framework (stays vanilla JS with ESM imports)
- Supporting dynamic schema version discovery at browse time

## Decisions

**Decision 1: WASM bridge via `syscall/js` (CUE playground pattern)**

Use the same pattern as the CUE playground: a Go `main` package with `//go:build js && wasm` that registers a JS-callable function via `syscall/js`. The function accepts YAML content + CUE schema source, evaluates using `cuelang.org/go`, and returns validation results.

Alternative considered: Go `wasip1` target. Rejected because `wasip1` does not have `syscall/js` bindings for DOM/browser interop. The `GOOS=js GOARCH=wasm` target with `wasm_exec.js` is proven in production by the CUE playground.

**Decision 2: Pre-bundled schemas as static `.cue` files (not embedded in WASM)**

Serve schema files as separate static assets at `schemas/<version>/<Definition>.cue`. The browser fetches the needed schema file on validate, passes it to the WASM function. This avoids recompiling the WASM binary when new Gemara versions are released — only the schema assets and `versions.json` need updating.

Alternative considered: `//go:embed` schemas into the WASM binary. Rejected because it couples schema updates to WASM recompilation, increasing the binary size per version and requiring a full rebuild for every new Gemara release.

**Decision 3: `load.Config.Overlay` for in-memory schema loading**

Inside WASM, use CUE's `load.Config.Overlay` (as the CUE playground does) to provide the schema source from memory rather than the filesystem or OCI registry. The browser fetches the `.cue` file, passes it as a string to the WASM function, which creates an in-memory overlay. No network access from WASM is needed.

Alternative considered: Using `modconfig.NewRegistry` inside WASM to fetch from the registry at runtime. Rejected because OCI registries do not serve CORS headers, and network access from Go WASM is unreliable.

**Decision 4: Port resolve/parser to JavaScript using js-yaml**

Port the reference parser and workspace resolver from Go to JavaScript. The logic is structural YAML walking (~330 lines of Go) with no CUE dependency. Use `js-yaml` (loaded via ESM from `esm.sh`, consistent with the existing CodeMirror pattern) for YAML parsing. Tutorial documents are already static files the browser can fetch.

Alternative considered: Running the resolve logic in WASM too. Rejected because it adds unnecessary WASM complexity for logic that is simple YAML traversal. JS is the natural fit and avoids increasing the WASM binary size.

**Decision 5: Build-time schema fetcher as a Go CLI tool**

Create a Go CLI tool (or script using `go run`) that queries `registry.cue.works` for available Gemara versions, downloads each version's CUE definitions, and writes them to `web/schemas/<version>/`. Also generates `web/versions.json`. This runs in CI or locally via `make sync-schemas`.

Alternative considered: Shell script with `curl`. Rejected because the OCI registry API requires content negotiation and manifest parsing that the existing Go `registry` package already handles.

**Decision 6: Daily cron GitHub Actions workflow for schema freshness**

Add a scheduled CI workflow that runs the schema fetcher daily, and if new versions are detected, rebuilds and redeploys the static site. Acceptable latency for a developer tool.

Alternative considered: Webhook from Gemara repo. Rejected as over-engineering for the release cadence and requiring cross-repo coordination.

## Risks / Trade-offs

- **[WASM binary size ~15-30MB uncompressed, ~5-8MB with brotli]** → Acceptable for a developer tool. Add a loading spinner during WASM initialization. CDN compression handles the rest.
- **[New Gemara versions require rebuild]** → Mitigated by daily cron CI workflow. Manual trigger also available.
- **[Go WASM debugging is limited]** → The WASM surface is small (single validation function). Errors are returned as structured data to JS. Use `console.log` from Go via `syscall/js` for diagnostics.
- **[js-yaml parsing fidelity vs Go yaml.v3]** → Both handle standard YAML. The resolve logic only reads simple structures (maps, lists, strings). No edge cases expected.
- **[Two languages to maintain (Go build tooling + JS runtime)]** → The Go surface shrinks to WASM bridge + schema fetcher. The JS surface is self-contained resolve logic. Clear boundary.

## Migration Plan

1. Build WASM bridge and schema bundler alongside existing server (both work simultaneously)
2. Add JS resolve module alongside existing Go handlers
3. Rewire `app.js` to use WASM + JS resolve (feature flag or separate HTML entry point for testing)
4. Validate parity between server and client-side results
5. Remove server-side API handlers and `cmd/server/` entry point
6. Update deployment to static-site target
