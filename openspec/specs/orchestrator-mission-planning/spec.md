### Requirement: Layer import graph in orchestrator prompt
The orchestrator's system prompt SHALL contain the Gemara layer import graph so it can reason about execution ordering for multi-step missions.

#### Scenario: Import graph present
- **WHEN** the orchestrator ConfigMap prompt is inspected
- **THEN** it contains a table mapping each producing layer to its import dependencies: L1 (none), L2 (L1), L3 (L1, L2), L5 (L2, L3), L6 (L2, L3, L5), L7 (L3, L5, L6)

#### Scenario: L4 documented as non-artifact
- **WHEN** the orchestrator prompt describes Layer 4
- **THEN** it states that L4 (Activity) has no schema and represents the subject being measured, not an authored artifact

### Requirement: Three-phase model context
The orchestrator's system prompt SHALL describe the Gemara three-phase model: Criteria (L1-L3), Subject (L4), Measurement (L5-L7).

#### Scenario: GIDE scope stated
- **WHEN** the orchestrator prompt describes the three-phase model
- **THEN** it states GIDE currently covers criteria layers (L1-L3) and measurement layers are out of scope

#### Scenario: Out-of-scope request handling
- **WHEN** a user asks for evaluation, enforcement, or audit capabilities (L5-L7)
- **THEN** the orchestrator responds that measurement layers are not yet available and states GIDE focuses on criteria authoring (L1-L3)

### Requirement: Multi-step mission planning
The orchestrator SHALL use the layer import graph to determine execution order when a mission spans multiple layers.

#### Scenario: Mission requiring L1 and L2
- **WHEN** a user requests both guidance and threat modeling artifacts
- **THEN** the orchestrator delegates to the guidance author first, then passes L1 artifacts to the threat modeler in the delegation message

#### Scenario: Single-layer mission
- **WHEN** a user requests only L2 artifacts (threat modeling)
- **THEN** the orchestrator delegates directly to the threat modeler without upstream dependency resolution
