## MODIFIED Requirements

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

#### Scenario: Structured mission payload from dashboard
- **WHEN** the orchestrator receives a task message composed by the dashboard's `composeTask` function
- **THEN** it parses the template reference, target repository, and expected artifacts from the message and delegates to the correct specialist
