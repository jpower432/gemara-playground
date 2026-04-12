## MODIFIED Requirements

### Requirement: Threat modeler agent CRD
The system SHALL define a kagent Agent CRD named `gide-threat-modeler` in the `kagent` namespace that performs STRIDE-based threat analysis and authors Gemara Layer 2 artifacts.

#### Scenario: Agent resource applied
- **WHEN** the threat modeler Agent YAML is applied to the cluster
- **THEN** the kagent controller reports `Accepted: True` and `Ready: True` conditions

#### Scenario: Go ADK runtime configured
- **WHEN** the threat modeler Agent CRD is inspected
- **THEN** `spec.declarative.runtime` is `go`

#### Scenario: STRIDE skill accessible via Go SkillsTool
- **WHEN** the threat modeler starts on Go runtime
- **THEN** the agent can read `/skills/stride-threat-model/SKILL.md` via the built-in `SkillsTool`
