## ADDED Requirements

### Requirement: Threat modeler agent CRD
The system SHALL define a kagent Agent CRD named `gide-threat-modeler` in the `kagent` namespace with tools wired to gemara-mcp, oras-mcp, and github-mcp-server.

#### Scenario: Agent resource applied
- **WHEN** the threat modeler Agent YAML is applied to the cluster
- **THEN** the kagent controller reports `Accepted: True` and `Ready: True` conditions

### Requirement: STRIDE-based system prompt
The agent's system message SHALL embed the STRIDE threat modeling methodology (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) and instruct the agent to categorize threats by STRIDE category.

#### Scenario: Threat categorization
- **WHEN** the agent authors a ThreatCatalog
- **THEN** each threat entry includes a group corresponding to a STRIDE category

### Requirement: Repository context grounding
The agent SHALL use GitHub MCP Server tools (`get_file_contents`, `search_code`) to pull repository architecture context before generating threats.

#### Scenario: User provides a repository
- **WHEN** the user says "Analyze threats for github.com/org/repo"
- **THEN** the agent uses github-mcp to fetch Dockerfiles, Kubernetes manifests, CI configs, and dependency files to ground the STRIDE analysis

#### Scenario: No repository provided
- **WHEN** the user describes a system without a repository reference
- **THEN** the agent performs abstract STRIDE analysis based on the description and notes that grounding was not available

### Requirement: ThreatCatalog authoring
The agent SHALL use gemara-mcp's `author_gemara` tool to produce valid Gemara ThreatCatalog YAML, then validate it with `validate_gemara`.

#### Scenario: Successful authoring
- **WHEN** the agent completes STRIDE analysis
- **THEN** it calls `author_gemara` with threat data, then `validate_gemara` to confirm schema compliance, and presents the valid YAML to the user

#### Scenario: Validation failure with repair
- **WHEN** `validate_gemara` returns errors
- **THEN** the agent calls `repair_gemara` with the error messages and re-validates until the artifact passes or 3 repair attempts are exhausted

### Requirement: ControlCatalog authoring from threats
The agent SHALL be capable of generating a ControlCatalog that mitigates threats from an existing ThreatCatalog, with proper `threats` mappings in each control.

#### Scenario: Controls from threats
- **WHEN** the user says "Create controls for these threats" after a ThreatCatalog is produced
- **THEN** the agent uses `author_gemara` to produce a ControlCatalog with `threats` entries referencing the ThreatCatalog's threat IDs

### Requirement: OCI inventory discovery
The agent SHALL use oras-mcp tools to discover existing Gemara artifacts in OCI registries when the user references a registry.

#### Scenario: Browse registry
- **WHEN** the user says "What Gemara artifacts are in registry.example.com/org?"
- **THEN** the agent uses `list_repositories` and `list_tags` to enumerate available artifacts and presents them with metadata

#### Scenario: Fetch existing artifact for context
- **WHEN** the user says "Use the existing threat catalog at registry.example.com/org/threats:v1"
- **THEN** the agent uses `fetch_manifest` to retrieve the artifact manifest and reasons over its layer structure to understand the content

### Requirement: Gemara-mcp prompt integration
The agent's system prompt SHALL reference gemara-mcp's `threat_assessment` prompt workflow for structuring the capability-to-threat analysis.

#### Scenario: Structured threat assessment
- **WHEN** the agent begins a threat modeling session
- **THEN** it follows the threat assessment workflow: identify capabilities first, then map threats to capabilities, using STRIDE as the categorization framework

### Requirement: Allowed namespaces for orchestrator access
The agent CRD SHALL configure `allowedNamespaces` to permit the orchestrator in the `kagent` namespace to invoke it as a tool.

#### Scenario: Cross-agent invocation
- **WHEN** the orchestrator calls `gide-threat-modeler` as a tool
- **THEN** the invocation succeeds because `kagent` is in the allowed namespaces list
