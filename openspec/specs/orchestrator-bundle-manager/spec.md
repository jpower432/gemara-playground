## ADDED Requirements

### Requirement: Bundle composition knowledge
The orchestrator's system prompt SHALL contain a bundle composition table mapping use cases to required artifact types and OCI media types.

#### Scenario: complyctl-compatible bundle
- **WHEN** the user requests a policy bundle for use with complyctl
- **THEN** the orchestrator knows the bundle requires ControlCatalog (`application/vnd.gemara.control-catalog.layer.v1+yaml`), GuidanceCatalog (`application/vnd.gemara.guidance-catalog.layer.v1+yaml`), and Policy (`application/vnd.gemara.policy.layer.v1+yaml`) layers

#### Scenario: Threat assessment bundle
- **WHEN** the user requests a threat assessment
- **THEN** the orchestrator knows the output includes CapabilityCatalog and ThreatCatalog artifacts with their respective media types

### Requirement: Bundle assembly from specialist outputs
The orchestrator SHALL assemble validated artifact YAML returned by specialists into OCI bundle push commands with correct per-layer media types.

#### Scenario: Multi-artifact assembly
- **WHEN** the threat modeler returns CapabilityCatalog, ThreatCatalog, and ControlCatalog YAML
- **THEN** the orchestrator produces an `oras push` command that includes each artifact as a separate layer with the correct `application/vnd.gemara.*` media type

#### Scenario: Single-artifact output
- **WHEN** a specialist returns a single artifact (e.g., ControlCatalog only)
- **THEN** the orchestrator produces an `oras push` command with that single layer and its media type

### Requirement: Use-case routing table
The orchestrator SHALL maintain a routing table that maps user intents to specialist delegations and expected artifact outputs.

#### Scenario: Threat modeling request
- **WHEN** the user asks to threat model a system or repository
- **THEN** the orchestrator delegates to `gide-threat-modeler` with template and repo references, expecting CapabilityCatalog, ThreatCatalog, and ControlCatalog artifacts

#### Scenario: Unknown use case
- **WHEN** the user requests a capability not in the routing table
- **THEN** the orchestrator lists available use cases and their descriptions

### Requirement: OCI registry discovery via oras-mcp
The orchestrator SHALL use oras-mcp tools to discover and browse Gemara artifacts in OCI registries on behalf of the user.

#### Scenario: List available artifacts
- **WHEN** the user asks "What Gemara artifacts are in registry.example.com?"
- **THEN** the orchestrator uses `list_repositories` and `list_tags` to enumerate available artifacts and presents them with metadata

#### Scenario: Inspect artifact manifest
- **WHEN** the user asks about a specific artifact version
- **THEN** the orchestrator uses `fetch_manifest` to retrieve the OCI manifest and describes the bundle's layer composition

### Requirement: Template location knowledge
The orchestrator SHALL know where pre-packaged use case template repos are located and include the template repo reference in delegation messages to specialists.

#### Scenario: Delegation with template reference
- **WHEN** the orchestrator delegates a threat modeling task to the threat modeler
- **THEN** the delegation message includes the GitHub repo path for the relevant use case template (e.g., `github.com/jpower432/gemara-playground/templates/k8s-admission-controller/`)

#### Scenario: No template available
- **WHEN** no pre-packaged template exists for the user's use case
- **THEN** the orchestrator delegates without a template reference and notes that the specialist will work from scratch
