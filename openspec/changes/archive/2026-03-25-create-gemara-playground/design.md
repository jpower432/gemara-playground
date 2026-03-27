## Context

No browser-based tool exists for authoring and validating Gemara YAML documents against CUE schemas. The Gemara project publishes schemas to the CUE Central Registry at `github.com/gemaraproj/gemara` (currently v1.0.0-rc.1). Validation today requires local installation of `go` and `cue` CLI, then running `cue vet -c -d '#<Definition>' github.com/gemaraproj/gemara@<version> <file>.yaml`. Existing tutorials at `gemara.openssf.org/tutorials/` provide complete YAML examples for Control Catalogs, Threat Catalogs, Guidance Catalogs, Policies, and Risk Catalogs.

The CUE Playground (`cuelang.org/play/`) is a general-purpose CUE language editor — it evaluates CUE code, not YAML-against-schema validation. It does not know about Gemara schemas, document types, or GRC domain concepts. This project fills that gap.

## Goals / Non-Goals

**Goals:**
- Browser-based YAML editor with syntax highlighting for authoring Gemara documents
- One-click validation of YAML against a user-selected Gemara schema definition and version
- Version selector defaulting to latest, populated from available Gemara releases
- Pre-loaded tutorial examples covering each Gemara document type
- Schema-type selector mapping to CUE definition names (`#ControlCatalog`, `#ThreatCatalog`, etc.)

**Non-Goals:**
- CUE code editing (the CUE Playground already exists for that)
- Generating or scaffolding YAML from schemas (future feature)
- User accounts, saving/sharing documents, or persistent storage
- Offline/WASM-only validation (requires server-side CUE)
- OSCAL or other non-Gemara schema support

## Decisions

### 1. Go API Server for Validation (not WASM)

**Choice:** Server-side Go API that runs `cue vet` via the Go CUE SDK.

**Rationale:** The CUE Playground's WASM approach has known stability issues (stuck at "loading WASM"). More critically, WASM CUE cannot resolve modules from the CUE Central Registry at runtime — it would need all schema versions pre-bundled. A Go backend can `cue vet` against any registry version on demand.

**Alternatives considered:**
- *WASM-only*: No server, but can't resolve registry modules and has stability concerns. Rejected.
- *Shelling out to `cue` CLI*: Simpler but less control over error formatting and version management. Rejected.
- *Python backend with subprocess*: Doesn't leverage Go SDK types. Contradicts "Go shop" convention. Rejected.

### 2. Static Frontend with CodeMirror Editor

**Choice:** Lightweight static SPA using vanilla TypeScript + CodeMirror 6 for the YAML editor. No heavy framework.

**Rationale:** This is a single-page tool with minimal state (editor content, selected version, selected type, validation result). React/Svelte would add build complexity without meaningful benefit. CodeMirror 6 provides YAML syntax highlighting, error gutters, and is the same editor used by the CUE Playground.

**Alternatives considered:**
- *Monaco Editor*: Heavier bundle, VS Code-style. Overkill for a playground. Rejected.
- *React + Monaco*: Full framework + heavy editor. Unnecessary complexity. Rejected.

### 3. Version List from CUE Registry API

**Choice:** Backend periodically fetches available versions of `github.com/gemaraproj/gemara` from the CUE Central Registry and caches them. Frontend requests the version list from our API.

**Rationale:** The CUE Registry uses a Go module proxy-compatible API. Versions can be listed via `GET https://registry.cue.works/mod/github.com/gemaraproj/gemara/@v/list`. Caching avoids hammering the registry on every page load.

### 4. Document Type Mapped to CUE Definitions

**Choice:** Dropdown maps human-readable names to CUE definition identifiers.

| Display Name | CUE Definition |
|---|---|
| Control Catalog | `#ControlCatalog` |
| Threat Catalog | `#ThreatCatalog` |
| Capability Catalog | `#CapabilityCatalog` |
| Guidance Catalog | `#GuidanceCatalog` |
| Vector Catalog | `#VectorCatalog` |
| Principle Catalog | `#PrincipleCatalog` |
| Risk Catalog | `#RiskCatalog` |
| Policy | `#Policy` |
| Evaluation Log | `#EvaluationLog` |
| Enforcement Log | `#EnforcementLog` |
| Audit Log | `#AuditLog` |
| Mapping Document | `#MappingDocument` |

When a tutorial is selected, the document type auto-selects to match.

### 5. Tutorial Content Bundled at Build Time

**Choice:** YAML examples from Gemara tutorials are vendored into the repository and served as static assets. Each example is tagged with its document type.

**Rationale:** Tutorial content changes infrequently. Vendoring avoids runtime dependency on `gemara.openssf.org`. A future enhancement could periodically sync from upstream.

### 6. Project Layout

```
gemara-playground/
├── cmd/server/          # Go API server entry point
├── internal/
│   ├── validate/        # CUE validation logic (Go SDK)
│   ├── registry/        # CUE Registry version fetcher + cache
│   └── handlers/        # HTTP handlers
├── web/                 # Static frontend
│   ├── index.html
│   ├── src/             # TypeScript source
│   └── tutorials/       # Vendored YAML tutorial examples
├── Makefile
├── go.mod
└── go.sum
```

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| CUE Registry API changes or is unavailable | Cache version list with TTL; fall back to last known list |
| Gemara schema breaking changes between versions | Version selector lets users pin; tutorials tagged to compatible versions |
| Server-side validation adds hosting cost | Go binary is lightweight; single container. Could explore WASM later if CUE stabilizes |
| Tutorial YAML drifts from upstream | Document vendoring process; add Makefile target to re-sync from `gemara.openssf.org` |
| CodeMirror bundle size | Tree-shake; only include YAML mode and error gutter extensions |
