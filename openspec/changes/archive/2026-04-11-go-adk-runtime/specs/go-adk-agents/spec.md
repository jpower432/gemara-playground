## ADDED Requirements

### Requirement: Go ADK runtime selection
All GIDE Declarative Agent CRDs SHALL specify `runtime: go` under `spec.declarative`.

#### Scenario: Orchestrator uses Go runtime
- **WHEN** the `gide-orchestrator` Agent CRD is inspected
- **THEN** `spec.declarative.runtime` is set to `go`

#### Scenario: Threat modeler uses Go runtime
- **WHEN** the `gide-threat-modeler` Agent CRD is inspected
- **THEN** `spec.declarative.runtime` is set to `go`

### Requirement: Go ADK MCP tool compatibility
GIDE agents running on the Go ADK runtime SHALL execute MCP tools identically to the Python runtime.

#### Scenario: Orchestrator calls oras-mcp tools
- **WHEN** the orchestrator invokes `list_repositories` via oras-mcp on Go runtime
- **THEN** the tool executes and returns results in the same format as Python runtime

#### Scenario: Threat modeler calls gemara-mcp tools
- **WHEN** the threat modeler invokes `author_gemara` via gemara-mcp on Go runtime
- **THEN** the tool executes and returns authored artifact YAML

### Requirement: Go ADK skill loading compatibility
GIDE agents with git-based skills SHALL load skills via the Go ADK `SkillsTool`.

#### Scenario: STRIDE skill loaded on Go runtime
- **WHEN** the `gide-threat-modeler` agent starts with Go runtime
- **THEN** the STRIDE skill at `skills/stride-threat-model/SKILL.md` is accessible via `SkillsTool`

### Requirement: Go ADK agent-as-tool compatibility
The orchestrator's `tools.type: Agent` delegation to the threat modeler SHALL function on Go runtime.

#### Scenario: Orchestrator delegates to threat modeler
- **WHEN** the orchestrator running on Go runtime delegates to `gide-threat-modeler` (also Go runtime)
- **THEN** the delegation succeeds and the orchestrator receives the specialist's response

### Requirement: Reduced resource requests
Agent pod resource requests SHALL be reduced to reflect the Go ADK's lower baseline.

#### Scenario: Go-appropriate resource limits
- **WHEN** the agent pods are scheduled in the kind cluster
- **THEN** memory requests are 64Mi or lower and CPU requests are 50m or lower
