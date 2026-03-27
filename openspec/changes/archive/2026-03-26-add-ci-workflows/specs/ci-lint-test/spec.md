## ADDED Requirements

### Requirement: CI runs Go linting on code changes

The CI pipeline SHALL run `golangci-lint` against the full Go codebase on every pull request targeting `main` and on every push to `main`.

#### Scenario: Lint failure blocks merge

- **WHEN** a pull request contains Go code that violates a golangci-lint rule
- **THEN** the CI lint job SHALL fail and report annotations on the offending lines

#### Scenario: Lint passes on clean code

- **WHEN** a pull request contains Go code with no lint violations
- **THEN** the CI lint job SHALL pass

### Requirement: CI checks Go source formatting

The CI pipeline SHALL verify that all Go source files are formatted with `gofmt` and `goimports`. The check SHALL fail if any file differs from the canonical format.

#### Scenario: Unformatted file fails CI

- **WHEN** a pull request contains a `.go` file not formatted by `gofmt` or `goimports`
- **THEN** the CI format check job SHALL fail and list the unformatted files

#### Scenario: All files formatted

- **WHEN** all `.go` files in the repository match `gofmt` and `goimports` output
- **THEN** the CI format check job SHALL pass

### Requirement: CI runs Go tests with race detection

The CI pipeline SHALL execute `go test -race -cover ./...` on every pull request targeting `main` and on every push to `main`.

#### Scenario: Test failure blocks merge

- **WHEN** a pull request introduces a failing Go test
- **THEN** the CI test job SHALL fail and report the failing test output

#### Scenario: All tests pass

- **WHEN** all Go tests pass with race detection enabled
- **THEN** the CI test job SHALL pass

### Requirement: CI builds the Go binary

The CI pipeline SHALL verify the project compiles by running `go build ./cmd/server/`.

#### Scenario: Build failure blocks merge

- **WHEN** a pull request introduces a compilation error
- **THEN** the CI build step SHALL fail

#### Scenario: Build succeeds

- **WHEN** the Go project compiles without errors
- **THEN** the CI build step SHALL pass

### Requirement: All third-party Actions are SHA-pinned

Every `uses:` reference to a third-party GitHub Action (outside `actions/*`) SHALL specify a full commit SHA, not a tag or branch.

#### Scenario: Action reference uses tag

- **WHEN** a workflow file references a third-party Action by tag (e.g., `@v4`)
- **THEN** the reference SHALL be replaced with the corresponding commit SHA with a comment noting the version
