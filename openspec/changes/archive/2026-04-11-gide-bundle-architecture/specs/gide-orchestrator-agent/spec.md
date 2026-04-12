## MODIFIED Requirements

### Requirement: Orchestrator agent CRD
The system SHALL define a kagent Agent CRD named `gide-orchestrator` in the `kagent` namespace that routes user requests to specialist agents and manages Gemara bundle lifecycle.

#### Scenario: Agent resource applied
- **WHEN** the orchestrator Agent YAML is applied to the cluster
- **THEN** the kagent controller reports `Accepted: True` and `Ready: True` conditions

### Requirement: Agent-as-tool delegation
The orchestrator SHALL reference specialist agents as tools using kagent's `tools.type: Agent` mechanism. For this change, the only specialist is `gide-threat-modeler`.

#### Scenario: User requests threat modeling
- **WHEN** the user sends a message like "Analyze the threats for this Kubernetes admission controller"
- **THEN** the orchestrator delegates to `gide-threat-modeler` with template repo reference and target repo, and returns its response

#### Scenario: User requests unsupported capability
- **WHEN** the user requests a capability with no matching specialist (e.g., "Create a policy")
- **THEN** the orchestrator responds that the capability is not yet available and lists available specialists

#### Scenario: Delegation message format
- **WHEN** the orchestrator delegates to a specialist
- **THEN** the delegation message includes: user intent, template repo path (if available), target repo reference, and expected artifact types

### Requirement: Orchestrator system prompt
The orchestrator's system message SHALL describe the GIDE platform, the Gemara 7-layer model, bundle composition rules, available specialists, and use kagent prompt templates for shared fragments.

#### Scenario: Prompt includes layer model context
- **WHEN** the agent is initialized
- **THEN** the system message contains a summary of all 7 Gemara layers and which specialists handle which layers

#### Scenario: Prompt includes bundle composition table
- **WHEN** the agent is initialized
- **THEN** the system message contains a table mapping use cases to artifact types and OCI media types

#### Scenario: Prompt uses kagent prompt templates
- **WHEN** the agent is initialized
- **THEN** the system message includes `{{include "builtin/a2a-communication"}}` and `{{include "builtin/tool-usage-best-practices"}}`

### Requirement: ModelConfig reference
The orchestrator SHALL reference the `gide-model-config` ModelConfig (Anthropic via Vertex AI).

#### Scenario: Model configuration
- **WHEN** the orchestrator Agent is deployed
- **THEN** it references `modelConfig: gide-model-config` in its declarative spec

## ADDED Requirements

### Requirement: oras-mcp tool allocation
The orchestrator SHALL have oras-mcp tools for OCI registry operations including discovery, manifest inspection, and future push capability.

#### Scenario: oras-mcp tools available
- **WHEN** the orchestrator Agent CRD is inspected
- **THEN** it includes `tools.type: McpServer` referencing oras-mcp with tools: `list_repositories`, `list_tags`, `list_referrers`, `fetch_manifest`, `parse_reference`

#### Scenario: Specialist does not have oras-mcp
- **WHEN** the threat modeler Agent CRD is inspected
- **THEN** it does NOT include any oras-mcp tool references
