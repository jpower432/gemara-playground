## ADDED Requirements

### Requirement: Threat modeler A2A skills metadata
The `gide-threat-modeler` Agent CRD SHALL declare A2A skills metadata in `a2aConfig.skills` describing its capabilities.

#### Scenario: Threat assessment skill declared
- **WHEN** the threat modeler's agent card is queried
- **THEN** it includes a skill with id `threat-assessment`, a description referencing STRIDE methodology, and example invocations

#### Scenario: Control authoring skill declared
- **WHEN** the threat modeler's agent card is queried
- **THEN** it includes a skill with id `control-authoring` describing ControlCatalog authoring from identified threats

### Requirement: Orchestrator uses A2A communication guidelines
The orchestrator's system prompt SHALL include kagent's built-in `a2a-communication` prompt template to enable A2A-aware routing.

#### Scenario: Prompt template included
- **WHEN** the orchestrator agent is initialized
- **THEN** the system message includes `{{include "builtin/a2a-communication"}}` for agent-to-agent communication guidance

### Requirement: Skill-based routing
The orchestrator SHALL match user intent to specialist A2A skills when deciding which agent to delegate to.

#### Scenario: Routing by skill match
- **WHEN** the user says "Analyze threats for this system"
- **THEN** the orchestrator matches the request to the `threat-assessment` skill on `gide-threat-modeler` and delegates accordingly

#### Scenario: Multiple skills on one specialist
- **WHEN** the user says "Create controls for these threats"
- **THEN** the orchestrator matches the `control-authoring` skill on the same `gide-threat-modeler` specialist
