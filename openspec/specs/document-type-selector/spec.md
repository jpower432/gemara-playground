## ADDED Requirements

### Requirement: Display all Gemara document types
The document type selector SHALL list all Gemara schema definitions as human-readable options.

#### Scenario: User opens the document type dropdown
- **WHEN** user clicks the document type selector
- **THEN** a dropdown displays all supported types: Control Catalog, Threat Catalog, Capability Catalog, Guidance Catalog, Vector Catalog, Principle Catalog, Risk Catalog, Policy, Evaluation Log, Enforcement Log, Audit Log, Mapping Document

### Requirement: Map display names to CUE definitions
Each document type option SHALL map to the corresponding CUE definition name used in validation.

#### Scenario: User selects "Policy"
- **WHEN** user selects "Policy" from the document type dropdown
- **THEN** the system uses `#Policy` as the CUE definition in the next validation request

#### Scenario: User selects "Control Catalog"
- **WHEN** user selects "Control Catalog" from the document type dropdown
- **THEN** the system uses `#ControlCatalog` as the CUE definition in the next validation request

### Requirement: Document type auto-selects when tutorial loads
The document type selector SHALL auto-update when a tutorial example is loaded, matching the tutorial's declared document type.

#### Scenario: User loads a Threat Catalog tutorial
- **WHEN** user selects the Threat Catalog tutorial from the examples menu
- **THEN** the document type selector changes to "Threat Catalog"

### Requirement: Manual type change does not alter editor content
Changing the document type SHALL NOT modify editor content. It only affects which CUE definition is used for the next validation.

#### Scenario: User changes document type while editing
- **WHEN** user changes the document type selector from "Control Catalog" to "Policy"
- **THEN** editor content remains unchanged
- **AND** previous validation results are cleared

### Requirement: Document type is required for validation
The system SHALL NOT allow validation without a document type selected.

#### Scenario: No document type selected
- **WHEN** user clicks "Validate" without a document type selected
- **THEN** the document type selector is highlighted with an error indicator
- **AND** validation does not proceed
