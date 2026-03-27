## ADDED Requirements

### Requirement: YAML syntax highlighting
The editor SHALL render YAML content with syntax highlighting (keys, values, strings, comments, indentation levels visually distinct).

#### Scenario: User types valid YAML
- **WHEN** user types YAML content into the editor
- **THEN** the editor highlights keys, string values, numeric values, booleans, and comments with distinct colors

#### Scenario: User types invalid YAML
- **WHEN** user types malformed YAML (e.g., bad indentation, missing colon)
- **THEN** the editor marks the error location with a visual indicator in the gutter

### Requirement: Editor loads with default content
The editor SHALL load with a default tutorial example pre-populated so the user can immediately hit "Validate" without writing anything.

#### Scenario: First page load
- **WHEN** user navigates to the playground URL
- **THEN** the editor contains a complete, valid Gemara YAML example (Control Catalog tutorial)
- **AND** the document type selector is set to the matching type

### Requirement: Editor supports standard editing operations
The editor SHALL support undo/redo, find/replace, line numbers, and bracket matching.

#### Scenario: User undoes a change
- **WHEN** user presses Ctrl+Z (or Cmd+Z on macOS)
- **THEN** the last edit is reverted

#### Scenario: User searches for text
- **WHEN** user presses Ctrl+F (or Cmd+F on macOS)
- **THEN** a search bar appears and highlights matches in the editor content

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
