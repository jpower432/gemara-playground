## ADDED Requirements

### Requirement: Provide pre-loaded tutorial examples
The playground SHALL include a set of tutorial YAML examples covering Gemara document types, sourced from the official Gemara tutorials.

#### Scenario: User selects a tutorial from the examples menu
- **WHEN** user selects "Control Catalog" from the examples dropdown
- **THEN** the editor loads the complete Control Catalog tutorial YAML
- **AND** the document type selector auto-selects "Control Catalog"

#### Scenario: User selects Threat Catalog tutorial
- **WHEN** user selects "Threat Catalog" from the examples dropdown
- **THEN** the editor loads the Threat Catalog tutorial YAML
- **AND** the document type selector auto-selects "Threat Catalog"

### Requirement: Each tutorial is tagged with its document type
Every tutorial example SHALL declare which Gemara schema definition it validates against, so the document type selector can auto-set when a tutorial is loaded.

#### Scenario: Tutorial metadata includes document type
- **WHEN** the frontend loads the list of available tutorials
- **THEN** each tutorial entry includes a display name, a brief description, and the associated CUE definition name

### Requirement: Tutorials are vendored at build time
Tutorial YAML files SHALL be stored in the repository under `web/tutorials/` and served as static assets. They SHALL NOT be fetched from `gemara.openssf.org` at runtime.

#### Scenario: Playground loads without network to gemara.openssf.org
- **WHEN** `gemara.openssf.org` is unreachable
- **THEN** tutorials still load because they are bundled with the application

### Requirement: Loading a tutorial warns if editor has unsaved changes
The system SHALL warn the user before replacing editor content with a tutorial example if the editor contains modifications.

#### Scenario: User has modified editor content and selects a tutorial
- **WHEN** user has typed into the editor and then selects a tutorial
- **THEN** a confirmation prompt asks whether to discard changes
- **AND** if the user confirms, the tutorial loads; if not, the editor remains unchanged

#### Scenario: Editor contains default/unmodified content
- **WHEN** user has not modified the editor and selects a tutorial
- **THEN** the tutorial loads immediately without a prompt
