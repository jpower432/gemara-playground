## Requirements

### Requirement: Display available Gemara schema versions

The version selector SHALL display a dropdown of available Gemara schema versions loaded from a static `versions.json` file bundled with the site at build time.

#### Scenario: Page loads with versions available

- **WHEN** the playground page loads
- **THEN** the version dropdown is populated with versions from `versions.json`
- **AND** versions are sorted in descending order (newest first)

#### Scenario: versions.json fails to load

- **WHEN** the browser fails to fetch `versions.json`
- **THEN** the version dropdown displays an error state indicating versions could not be loaded

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
