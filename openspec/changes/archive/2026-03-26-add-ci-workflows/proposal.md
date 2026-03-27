## Why

The repository has no automated checks. Code merges to `main` without linting, testing, vulnerability scanning, or format verification. This increases the risk of regressions, style drift, and shipping known vulnerabilities.

## What Changes

- Add a GitHub Actions CI workflow triggered on pull requests and pushes to `main`
- Run Go linting via `golangci-lint` (aligns with existing `make lint`)
- Run Go tests with race detection and coverage (aligns with existing `make test`)
- Run Go vulnerability scanning via `govulncheck`
- Run Dockerfile linting via `hadolint`
- Run `gofmt`/`goimports` format checks
- Pin all third-party GitHub Actions to full commit SHAs

## Capabilities

### New Capabilities

- `ci-lint-test`: Go linting, formatting, and test execution in CI
- `ci-security-scan`: SAST and dependency vulnerability scanning in CI

### Modified Capabilities

## Impact

- New `.github/workflows/` directory with workflow YAML files
- Requires `golangci-lint` config (existing `.golangci.yml` or defaults)
- No changes to application code or APIs
- Contributors will need passing CI before merge
