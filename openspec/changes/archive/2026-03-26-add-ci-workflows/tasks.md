## 1. Workflow File Setup

- [x] 1.1 Create `.github/workflows/ci.yaml` with trigger config (on push to `main`, on pull_request targeting `main`)
- [x] 1.2 Define shared setup steps: checkout, Go toolchain install with caching

## 2. Lint and Format Job

- [x] 2.1 Add `lint` job using `golangci-lint/golangci-lint-action` pinned to commit SHA
- [x] 2.2 Add format check step running `gofmt -l .` and `goimports -l .`, failing if output is non-empty
- [x] 2.3 Install `goimports` in the format check step via `go install golang.org/x/tools/cmd/goimports@latest`

## 3. Test and Build Job

- [x] 3.1 Add `test` job running `go test -v -race -cover ./...`
- [x] 3.2 Add `build` step running `go build ./cmd/server/` to verify compilation

## 4. Security Scan Job

- [x] 4.1 Add `govulncheck` job using `golang/govulncheck-action` pinned to commit SHA
- [x] 4.2 Add `hadolint` job using `hadolint/hadolint-action` pinned to commit SHA targeting the `Dockerfile`

## 5. Action Pinning and Verification

- [x] 5.1 Pin all third-party Action `uses:` references to full commit SHAs with version comments
- [x] 5.2 Pin first-party `actions/checkout` and `actions/setup-go` to commit SHAs with version comments
- [x] 5.3 Verify workflow syntax is valid by running `actionlint` or manual review
