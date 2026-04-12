## MODIFIED Requirements

### Requirement: Orchestrator system prompt
The orchestrator's system message SHALL describe the GIDE platform, the Gemara 7-layer model with import dependencies, the three-phase model, bundle composition rules, available specialists, and use kagent prompt templates for shared fragments.

#### Scenario: Prompt includes layer model context
- **WHEN** the agent is initialized
- **THEN** the system message contains a summary of all 7 Gemara layers, which specialists handle which layers, and the layer import graph

#### Scenario: Prompt includes three-phase model
- **WHEN** the agent is initialized
- **THEN** the system message distinguishes criteria layers (L1-L3), the subject layer (L4), and measurement layers (L5-L7), and states GIDE scope is L1-L3

#### Scenario: Prompt includes bundle composition table
- **WHEN** the agent is initialized
- **THEN** the system message contains a table mapping use cases to artifact types and OCI media types

#### Scenario: Prompt uses kagent prompt templates
- **WHEN** the agent is initialized
- **THEN** the system message includes `{{include "builtin/a2a-communication"}}` and `{{include "builtin/tool-usage-best-practices"}}`

## REMOVED Requirements

### Requirement: Launcher deployment
**Reason**: The static HTML launcher is unnecessary. kagent's built-in UI handles agent interaction directly.
**Migration**: Use kagent UI at `kubectl port-forward -n kagent svc/kagent-ui 8001:8080` to interact with agents.
