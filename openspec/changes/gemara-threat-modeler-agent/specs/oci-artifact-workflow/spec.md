## ADDED Requirements

### Requirement: Local OCI registry
The kind setup SHALL deploy a writable OCI registry (zot) in the cluster for testing push and pull workflows.

#### Scenario: Registry accessible
- **WHEN** the kind cluster is running
- **THEN** an OCI registry is accessible at `localhost:5000` via port-forward and at `zot-registry.registry:5000` within the cluster

### Requirement: Pre-loaded sample artifacts
The kind setup SHALL include an init job that pushes sample Gemara artifacts (ThreatCatalog, ControlCatalog, GuidanceCatalog) to the local registry using complyctl-compatible OCI bundle format.

#### Scenario: Sample artifacts available
- **WHEN** the init job completes
- **THEN** `oras-mcp` can discover artifacts via `list_repositories` and `list_tags` against the local registry

### Requirement: complyctl-compatible media types
All OCI artifacts pushed to the registry SHALL use media types compatible with complyctl's expected multi-layer manifest format.

#### Scenario: complyctl can pull GIDE-pushed artifacts
- **WHEN** an artifact is pushed to the registry (manually via oras CLI in this iteration)
- **THEN** `complyctl get` can retrieve the artifact without errors

### Requirement: Agent-guided manual push workflow
Since oras-mcp lacks push tools, the agent SHALL output the final validated YAML artifact content and provide the user with the exact `oras push` command to execute, including the correct media type and tag.

#### Scenario: Push instructions after authoring
- **WHEN** the agent completes authoring and validation of a ThreatCatalog
- **THEN** the agent presents the validated YAML and a ready-to-copy `oras push` command with the appropriate OCI reference, media type, and annotation flags

#### Scenario: Upstream push tools available (future)
- **WHEN** oras-mcp gains `push_manifest`/`push_blob` tools via upstream contribution
- **THEN** the agent workflow can be updated to call push tools directly, removing the manual step

### Requirement: Non-JSON blob workaround
Since oras-mcp's `fetch_blob` rejects non-JSON content, the agent SHALL use `fetch_manifest` to inspect layer descriptors and reason over artifact structure without fetching raw YAML blobs.

#### Scenario: Discovering artifact content
- **WHEN** the agent needs to read an existing Gemara artifact from OCI
- **THEN** it uses `fetch_manifest` to get the manifest JSON, identifies layers by media type, and uses layer metadata (annotations, media types) to understand the artifact structure

#### Scenario: Upstream JSON+YAML support (future)
- **WHEN** oras-mcp adds YAML blob support via upstream contribution
- **THEN** the agent can fetch and parse Gemara YAML blobs directly
