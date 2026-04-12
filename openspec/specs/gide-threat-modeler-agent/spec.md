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

### Requirement: Repository context grounding
The agent SHALL use GitHub MCP Server tools (`get_file_contents`, `search_code`) to pull repository architecture context before generating threats.

#### Scenario: User provides a repository
- **WHEN** the orchestrator delegates with a target repo reference
- **THEN** the agent uses github-mcp to fetch Dockerfiles, Kubernetes manifests, CI configs, and dependency files to ground the STRIDE analysis

#### Scenario: No repository provided
- **WHEN** the orchestrator delegates without a target repo reference
- **THEN** the agent performs abstract STRIDE analysis based on the description and notes that grounding was not available

### Requirement: Template-aware authoring
The agent SHALL use github-mcp to pull pre-packaged template artifacts from the template repo reference provided in the orchestrator's delegation message.

#### Scenario: Template available
- **WHEN** the delegation message includes a template repo path
- **THEN** the agent uses `get_file_contents` to fetch template Gemara YAML files and uses them as starting context for analysis

#### Scenario: No template provided
- **WHEN** the delegation message does not include a template repo path
- **THEN** the agent authors artifacts from scratch using repo context

### Requirement: ThreatCatalog authoring
The agent SHALL author valid Gemara ThreatCatalog YAML guided by gemara-mcp's `threat_assessment` prompt, then validate with `validate_gemara_artifact`.

#### Scenario: Successful authoring
- **WHEN** the agent completes STRIDE analysis
- **THEN** it writes ThreatCatalog YAML, validates with `validate_gemara_artifact`, and returns the valid YAML

#### Scenario: Validation failure with retry
- **WHEN** `validate_gemara_artifact` returns errors
- **THEN** the agent fixes the YAML and re-validates until the artifact passes or 3 attempts are exhausted

### Requirement: ControlCatalog authoring from threats
The agent SHALL be capable of generating a ControlCatalog that mitigates threats from an existing ThreatCatalog, with proper `threats` mappings in each control.

#### Scenario: Controls from threats
- **WHEN** the orchestrator delegates a request for controls along with threat modeling
- **THEN** the agent authors a ControlCatalog guided by gemara-mcp's `control_catalog` prompt, with `threats` entries referencing the ThreatCatalog's threat IDs

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

#### Scenario: Workflow reflects task-orchestrator pattern
- **WHEN** `agents/gide-threat-modeler.md` is inspected
- **THEN** it describes the agent as a task orchestrator that delegates domain knowledge to gemara-mcp, not as a domain expert that embeds STRIDE and schema knowledge

### Requirement: Allowed namespaces for orchestrator access
The agent CRD SHALL configure `allowedNamespaces` to permit the orchestrator in the `kagent` namespace to invoke it as a tool.

#### Scenario: Cross-agent invocation
- **WHEN** the orchestrator calls `gide-threat-modeler` as a tool
- **THEN** the invocation succeeds because `kagent` is in the allowed namespaces list

### Requirement: A2A skills metadata
The agent CRD SHALL declare A2A skills metadata describing threat assessment and control authoring capabilities.

#### Scenario: Agent card published
- **WHEN** the agent's `.well-known/agent.json` is queried
- **THEN** it lists skills for `threat-assessment` and `control-authoring` with descriptions, tags, and examples
