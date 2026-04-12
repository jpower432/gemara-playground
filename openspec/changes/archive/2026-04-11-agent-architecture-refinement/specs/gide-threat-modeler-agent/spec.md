## MODIFIED Requirements

### Requirement: Threat modeler agent CRD
The system SHALL define a kagent Agent CRD named `gide-threat-modeler` in the `kagent` namespace with tools wired to gemara-mcp and github-mcp-server. The systemMessage SHALL follow the task-orchestrator pattern: thin workflow instructions that reference gemara-mcp prompts for domain guidance.

#### Scenario: Agent resource applied
- **WHEN** the threat modeler Agent YAML is applied to the cluster
- **THEN** the kagent controller reports `Accepted: True` and `Ready: True` conditions

#### Scenario: Go ADK runtime configured
- **WHEN** the threat modeler Agent CRD is inspected
- **THEN** `spec.declarative.runtime` is `go`

#### Scenario: Task-oriented systemMessage
- **WHEN** the threat modeler CRD systemMessage is inspected
- **THEN** it describes a workflow sequence (gather context → use gemara-mcp prompts → author YAML → validate → return) without duplicating artifact schema structure, STRIDE methodology details, or validation rules that gemara-mcp owns

### Requirement: gemara-mcp tool references
The threat modeler SHALL reference the correct gemara-mcp tool names as deployed.

#### Scenario: Correct tool names in CRD
- **WHEN** the threat modeler Agent CRD toolNames for gemara-mcp are inspected
- **THEN** they include `validate_gemara_artifact` and `migrate_gemara_artifact`

#### Scenario: No references to removed tools
- **WHEN** the threat modeler Agent CRD and agent docs are inspected
- **THEN** they do NOT reference `author_gemara`, `validate_gemara`, `repair_gemara`, or `convert_to_gemara`

### Requirement: gemara-mcp wizard prompt integration
The agent's systemMessage SHALL reference gemara-mcp wizard prompts by name for domain guidance during authoring.

#### Scenario: Wizard prompt references
- **WHEN** the systemMessage is inspected
- **THEN** it instructs the agent to use `threat_assessment` prompt for ThreatCatalog authoring and `control_catalog` prompt for ControlCatalog authoring

#### Scenario: No duplicated domain knowledge
- **WHEN** the systemMessage is compared to gemara-mcp prompt content
- **THEN** the systemMessage does NOT contain artifact field definitions, schema structure, or validation rules that gemara-mcp prompts already provide

### Requirement: Agent design doc accuracy
The `agents/gide-threat-modeler.md` file SHALL match the deployed CRD tool names and reflect the task-orchestrator architecture.

#### Scenario: Tool names match CRD
- **WHEN** `agents/gide-threat-modeler.md` is inspected
- **THEN** the gemara-mcp tools section lists `validate_gemara_artifact` and `migrate_gemara_artifact`

#### Scenario: Workflow reflects D9
- **WHEN** `agents/gide-threat-modeler.md` is inspected
- **THEN** it describes the agent as a task orchestrator that delegates domain knowledge to gemara-mcp, not as a domain expert that embeds STRIDE and schema knowledge
