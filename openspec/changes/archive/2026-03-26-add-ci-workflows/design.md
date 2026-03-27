## Context

The gemara-playground repository is a Go 1.25 project with a vanilla JS frontend, built with `go build`, tested with `go test`, and linted with `golangci-lint`. A `Makefile` centralizes these commands (`make test`, `make lint`, `make build`). A `Dockerfile` exists for container builds. No CI/CD pipeline exists today — all quality checks are manual and local-only.

## Goals / Non-Goals

**Goals:**

- Automate linting, formatting, testing, and vulnerability scanning on every PR and push to `main`
- Pin all third-party Actions to commit SHAs to prevent supply-chain attacks
- Reuse existing Makefile targets where possible
- Keep workflow files minimal and maintainable

**Non-Goals:**

- Container image builds or publishing (separate concern)
- Deployment automation
- Frontend-specific linting or testing (no JS framework tooling in scope)
- Code coverage reporting to external services
- Branch protection rule configuration (manual admin task)

## Decisions

**Decision 1: Single workflow file vs. multiple**

Use a single workflow file with multiple jobs. The lint/format, test, and security scan jobs are tightly related and share the same trigger conditions. A single file reduces duplication and is easier to maintain for a project of this size.

Alternative considered: Separate workflow files per concern. Rejected because it adds file sprawl without meaningful isolation benefit at this scale.

**Decision 2: golangci-lint via official Action vs. Makefile**

Use the official `golangci-lint/golangci-lint-action` (pinned to SHA). It provides caching, version pinning, and GitHub annotations out of the box. The Makefile `lint` target remains for local use.

Alternative considered: `make lint` in CI. Rejected because it requires manual golangci-lint installation and lacks annotation integration.

**Decision 3: govulncheck for vulnerability scanning**

Use `golang/govulncheck-action` (pinned to SHA) for Go dependency vulnerability scanning. It is maintained by the Go team and checks against the Go vulnerability database.

Alternative considered: Trivy, Snyk. Rejected because govulncheck is purpose-built for Go modules, zero-config, and avoids adding external service dependencies.

**Decision 4: hadolint for Dockerfile linting**

Use `hadolint/hadolint-action` (pinned to SHA) to lint the Dockerfile. It catches common Dockerfile anti-patterns and enforces best practices.

Alternative considered: Trivy Dockerfile scanning. Rejected because hadolint is the de facto standard for Dockerfile linting and is more focused.

**Decision 5: Format check approach**

Run `gofmt -l` and `goimports -l` in a shell step and fail if they produce output. This avoids additional Action dependencies and is straightforward.

## Risks / Trade-offs

- **[SHA pinning maintenance]** → Dependabot or Renovate can automate SHA updates. Manual updates are acceptable for a small repo.
- **[golangci-lint version drift]** → Pin the version in the Action config. Update intentionally.
- **[CI minutes cost]** → All jobs use `ubuntu-latest` and Go caching to minimize runtime. Expected total under 3 minutes.
- **[No frontend checks]** → The JS frontend is minimal (single file, no build step). Linting can be added later if the frontend grows.
