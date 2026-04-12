## ADDED Requirements

### Requirement: Orchestrator agent CRD
The system SHALL define a kagent Agent CRD named `gide-orchestrator` in the `kagent` namespace that routes user requests to specialist agents.

#### Scenario: Agent resource applied
- **WHEN** the orchestrator Agent YAML is applied to the cluster
- **THEN** the kagent controller reports `Accepted: True` and `Ready: True` conditions

### Requirement: Agent-as-tool delegation
The orchestrator SHALL reference specialist agents as tools using kagent's `tools.type: Agent` mechanism. For this change, the only specialist is `gide-threat-modeler`.

#### Scenario: User requests threat modeling
- **WHEN** the user sends a message like "Analyze the threats for this Kubernetes admission controller"
- **THEN** the orchestrator delegates to `gide-threat-modeler` and returns its response

#### Scenario: User requests unsupported capability
- **WHEN** the user requests a capability with no matching specialist (e.g., "Create a policy")
- **THEN** the orchestrator responds that the capability is not yet available and lists available specialists

### Requirement: Orchestrator system prompt
The orchestrator's system message SHALL describe the GIDE platform, the Gemara 7-layer model at a high level, and the available specialist agents with their capabilities.

#### Scenario: Prompt includes layer model context
- **WHEN** the agent is initialized
- **THEN** the system message contains a summary of all 7 Gemara layers and which specialists handle which layers

### Requirement: ModelConfig reference
The orchestrator SHALL reference the `gide-model-config` ModelConfig (Anthropic via Vertex AI).

#### Scenario: Model configuration
- **WHEN** the orchestrator Agent is deployed
- **THEN** it references `modelConfig: gide-model-config` in its declarative spec
