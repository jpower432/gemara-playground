## MODIFIED Requirements

### Requirement: Agent-guided manual push workflow
Since oras-mcp lacks push tools, the orchestrator SHALL output the final validated YAML artifact content and provide the user with the exact `oras push` command to execute, including the correct media type per layer and tag.

#### Scenario: Push instructions after bundle assembly
- **WHEN** the orchestrator receives validated artifacts from a specialist and assembles the bundle
- **THEN** the orchestrator presents the validated YAML files and a ready-to-copy `oras push` command with per-layer media types, OCI reference, and annotation flags

#### Scenario: Multi-layer push command
- **WHEN** the bundle contains multiple artifacts (e.g., ControlCatalog + ThreatCatalog)
- **THEN** the `oras push` command includes each artifact file with its corresponding `application/vnd.gemara.*` media type as a separate layer argument

#### Scenario: Upstream push tools available (future)
- **WHEN** oras-mcp gains `push_manifest`/`push_blob` tools via upstream contribution
- **THEN** the orchestrator can call push tools directly, removing the manual step

### Requirement: Bundle assembly responsibility
The orchestrator SHALL be responsible for assembling specialist-produced artifacts into OCI bundles. Specialists return validated Gemara YAML; the orchestrator maps each artifact to the correct OCI layer media type.

#### Scenario: Orchestrator assembles bundle
- **WHEN** the threat modeler returns CapabilityCatalog, ThreatCatalog, and ControlCatalog YAML
- **THEN** the orchestrator identifies each artifact type from the YAML `metadata.type` field and maps it to the corresponding OCI media type

#### Scenario: Specialist does not output push commands
- **WHEN** a specialist completes artifact authoring
- **THEN** it returns only the validated YAML content without OCI push instructions (push is the orchestrator's responsibility)
