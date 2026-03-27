# Gemara Playground

> **THIS REPOSITORY WAS BUILT WITH THE ASSISTANCE OF AI TOOLING AND IS FOR TESTING AND EXPERIMENTATION ONLY.**
> It is not an official project, not production-ready, and not maintained. Code, configurations, and CI workflows may be incomplete, incorrect, or insecure. Do not use this in any production or compliance context. If you are looking for the Gemara specification, visit [gemara.openssf.org](https://gemara.openssf.org/).

Browser-based YAML editor with schema validation for [Gemara](https://gemara.openssf.org/) documents. Validate Control Catalogs, Threat Catalogs, Policies, and other Gemara document types against CUE schemas — entirely in your browser via WebAssembly.

## Architecture

The playground runs as a **static site** with zero server-side runtime. All validation happens client-side:

- **WASM validation**: Go CUE SDK compiled to WebAssembly validates YAML against pre-exported Gemara schemas
- **Static schemas**: A build-time bundler fetches Gemara CUE definitions from the CUE Central Registry and exports them as self-contained `.cue` files
- **Client-side resolve**: Cross-document reference parsing and workspace resolution run in JavaScript

## Features

- YAML editor with syntax highlighting (CodeMirror 6)
- Client-side validation via WASM (no server round-trips)
- Version selector from pre-bundled schema versions
- Document type selector for all 12 Gemara schema definitions
- Relationship visualization with cross-document reference graph
- Pre-loaded tutorial examples from Gemara docs

## Quick Start

```bash
make dev
```

Open `http://localhost:8080`.

## Deployment

Pushes to `main` automatically build and deploy to GitHub Pages via the [deploy workflow](.github/workflows/deploy.yaml). The workflow compiles the WASM binary, fetches schemas, and uploads the `web/` directory.

To enable: go to **Settings > Pages** in the repository and set the source to **GitHub Actions**.

## Build Targets

| Target | Description |
|:---|:---|
| `make sync-schemas` | Fetch Gemara schemas from CUE registry to `web/schemas/` |
| `make build-wasm` | Compile WASM binary and copy `wasm_exec.js` |
| `make build-static` | Full static site build (schemas + WASM) |
| `make dev` | Build static site and start local Python HTTP server |
| `make test` | Run Go tests |
| `make lint` | Run golangci-lint |
| `make clean` | Remove generated artifacts |

## Docker

```bash
docker build -t gemara-playground .
docker run -p 8080:80 gemara-playground
```

## Schema Freshness

A [daily CI workflow](.github/workflows/sync-schemas.yaml) checks the CUE registry for new Gemara versions and opens a PR when updates are available.

## License

[Apache License 2.0](LICENSE)
