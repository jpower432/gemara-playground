## MODIFIED Requirements

### Requirement: Editor content is preserved during validation
The editor SHALL NOT clear or modify user content when validation is triggered or when switching schema versions.

#### Scenario: User validates content
- **WHEN** user clicks the "Validate" button
- **THEN** editor content remains unchanged
- **AND** validation results appear in the Validate tab of the output panel

#### Scenario: User changes schema version
- **WHEN** user selects a different Gemara version from the version selector
- **THEN** editor content remains unchanged

#### Scenario: User visualizes content
- **WHEN** user clicks the "Visualize" button
- **THEN** editor content remains unchanged
- **AND** the relationship graph appears in the Visualize tab of the output panel

## ADDED Requirements

### Requirement: Output panel supports tab switching
The output panel SHALL have two tabs: "Validate" and "Visualize". Each tab preserves its own state independently.

#### Scenario: Switch from Validate to Visualize tab
- **WHEN** user clicks the "Visualize" tab after running validation
- **THEN** the Visualize tab content is shown
- **AND** switching back to "Validate" tab restores the previous validation results

#### Scenario: Switch tabs without running either action
- **WHEN** user switches to "Visualize" tab without having clicked Visualize
- **THEN** the tab shows a placeholder message prompting the user to click "Visualize"

### Requirement: Visualize button in toolbar
The toolbar SHALL include a "Visualize" button alongside the existing "Validate" button.

#### Scenario: User clicks Visualize button
- **WHEN** user clicks the "Visualize" button in the toolbar
- **THEN** the output panel switches to the Visualize tab
- **AND** the graph rendering is triggered
