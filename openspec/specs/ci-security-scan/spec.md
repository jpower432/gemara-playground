### Requirement: CI scans Go dependencies for known vulnerabilities

The CI pipeline SHALL run `govulncheck` against the Go module on every pull request targeting `main` and on every push to `main`. It SHALL fail if any known vulnerability is found in the dependency graph.

#### Scenario: Vulnerable dependency detected

- **WHEN** a Go dependency has a known vulnerability in the Go vulnerability database
- **THEN** the CI security scan job SHALL fail and report the affected package and CVE

#### Scenario: No vulnerabilities found

- **WHEN** all Go dependencies are free of known vulnerabilities
- **THEN** the CI security scan job SHALL pass

### Requirement: CI lints the Dockerfile

The CI pipeline SHALL run `hadolint` against the project's `Dockerfile` on every pull request targeting `main` and on every push to `main`.

#### Scenario: Dockerfile violation detected

- **WHEN** the `Dockerfile` contains a rule violation (e.g., unpinned base image tag, missing `--no-install-recommends`)
- **THEN** the CI Dockerfile lint job SHALL fail and report the violation with the rule ID

#### Scenario: Dockerfile passes all rules

- **WHEN** the `Dockerfile` conforms to all hadolint rules
- **THEN** the CI Dockerfile lint job SHALL pass
