## MODIFIED Requirements

### Requirement: Orchestrator agent CRD
The system SHALL define a kagent Agent CRD named `gide-orchestrator` in the `kagent` namespace that routes user requests to specialist agents and manages Gemara bundle lifecycle.

#### Scenario: Agent resource applied
- **WHEN** the orchestrator Agent YAML is applied to the cluster
- **THEN** the kagent controller reports `Accepted: True` and `Ready: True` conditions

#### Scenario: Go ADK runtime configured
- **WHEN** the orchestrator Agent CRD is inspected
- **THEN** `spec.declarative.runtime` is `go`
