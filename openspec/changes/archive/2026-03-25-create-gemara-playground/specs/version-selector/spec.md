## ADDED Requirements

### Requirement: Display available Gemara schema versions
The version selector SHALL display a dropdown of available Gemara schema versions fetched from the CUE Central Registry.

#### Scenario: Page loads with versions available
- **WHEN** the playground page loads
- **THEN** the version dropdown is populated with available versions of `github.com/gemaraproj/gemara`
- **AND** versions are sorted in descending order (newest first)

#### Scenario: Registry is unreachable
- **WHEN** the backend cannot reach the CUE Central Registry
- **THEN** the version dropdown displays the last cached version list
- **AND** a subtle indicator shows the list may be stale

### Requirement: Default to latest version
The version selector SHALL default to the latest stable version of the Gemara schema.

#### Scenario: Page loads
- **WHEN** the playground page loads and versions are available
- **THEN** the latest version is pre-selected in the dropdown

### Requirement: Version change does not clear editor
Changing the selected version SHALL NOT modify the editor content. The user must explicitly re-validate.

#### Scenario: User switches version
- **WHEN** user selects a different version from the dropdown
- **THEN** editor content remains unchanged
- **AND** any previous validation results are cleared (since they no longer apply to the new version)

### Requirement: Backend caches version list
The backend SHALL cache the version list from the CUE Central Registry with a configurable TTL to avoid excessive upstream requests.

#### Scenario: Multiple clients request versions within cache TTL
- **WHEN** multiple requests for the version list arrive within the cache TTL
- **THEN** the backend returns the cached list without querying the registry again

#### Scenario: Cache expires
- **WHEN** a version list request arrives after the cache TTL has elapsed
- **THEN** the backend fetches a fresh list from the registry and updates the cache
