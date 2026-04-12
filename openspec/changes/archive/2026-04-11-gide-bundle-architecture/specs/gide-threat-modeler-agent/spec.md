## MODIFIED Requirements

### Requirement: Threat modeler agent CRD
The system SHALL define a kagent Agent CRD named `gide-threat-modeler` in the `kagent` namespace with tools wired to gemara-mcp and github-mcp-server, and a STRIDE skill loaded from a git ref.

#### Scenario: Agent resource applied
- **WHEN** the threat modeler Agent YAML is applied to the cluster
- **THEN** the kagent controller reports `Accepted: True` and `Ready: True` conditions

### Requirement: STRIDE-based analysis via kagent skill
The agent SHALL load the STRIDE methodology from a kagent git-based skill rather than embedding it in the system prompt.

#### Scenario: Skill loaded at startup
- **WHEN** the agent starts
- **THEN** the STRIDE skill is available at `/skills/stride-threat-model/SKILL.md` and the agent can read it to guide threat analysis

#### Scenario: Threat categorization
- **WHEN** the agent authors a ThreatCatalog
- **THEN** each threat entry includes a group corresponding to a STRIDE category, as instructed by the loaded skill

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
- **THEN** the agent authors artifacts from scratch using STRIDE skill and repo context

### Requirement: ThreatCatalog authoring
The agent SHALL use gemara-mcp's `author_gemara` tool to produce valid Gemara ThreatCatalog YAML, then validate it with `validate_gemara`.

#### Scenario: Successful authoring
- **WHEN** the agent completes STRIDE analysis
- **THEN** it calls `author_gemara` with threat data, then `validate_gemara` to confirm schema compliance, and returns the valid YAML

#### Scenario: Validation failure with repair
- **WHEN** `validate_gemara` returns errors
- **THEN** the agent calls `repair_gemara` with the error messages and re-validates until the artifact passes or 3 repair attempts are exhausted

### Requirement: ControlCatalog authoring from threats
The agent SHALL be capable of generating a ControlCatalog that mitigates threats from an existing ThreatCatalog, with proper `threats` mappings in each control.

#### Scenario: Controls from threats
- **WHEN** the orchestrator delegates a request for controls along with threat modeling
- **THEN** the agent uses `author_gemara` to produce a ControlCatalog with `threats` entries referencing the ThreatCatalog's threat IDs

### Requirement: Gemara-mcp wizard prompt integration
The agent SHALL use gemara-mcp's wizard prompts (`threat_assessment`, `control_catalog`) for structuring artifact authoring workflows.

#### Scenario: Wizard prompt selection
- **WHEN** the agent begins a threat modeling session
- **THEN** it uses the `threat_assessment` wizard prompt for ThreatCatalog authoring and the `control_catalog` wizard prompt for ControlCatalog authoring

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

## REMOVED Requirements

### Requirement: OCI inventory discovery
**Reason**: OCI registry operations move to the orchestrator per the bundle architecture redesign. The specialist no longer interacts with OCI registries.
**Migration**: Users requesting registry browsing are handled by the orchestrator directly via oras-mcp tools.
