## ADDED Requirements

### Requirement: STRIDE skill as kagent git-based skill
The STRIDE threat modeling methodology SHALL be packaged as a kagent git-based skill with a `SKILL.md` file in the `skills/stride-threat-model/` directory.

#### Scenario: Skill structure
- **WHEN** the skill directory is inspected
- **THEN** it contains a `SKILL.md` with YAML frontmatter (`name`, `description`) and detailed STRIDE methodology instructions

#### Scenario: Skill loaded at agent startup
- **WHEN** the threat modeler agent starts
- **THEN** kagent loads the skill from the git ref and makes it available under `/skills/stride-threat-model/`

### Requirement: STRIDE category definitions
The `SKILL.md` SHALL define all six STRIDE categories with ID prefixes, descriptions, and analysis guidance for each.

#### Scenario: Complete category coverage
- **WHEN** the agent reads the STRIDE skill
- **THEN** it finds definitions for Spoofing (S), Tampering (T), Repudiation (R), Information Disclosure (I), Denial of Service (D), and Elevation of Privilege (E)

### Requirement: Capability-to-threat analysis guidance
The skill SHALL instruct the agent to evaluate each system capability against all six STRIDE categories, skipping categories with no meaningful threat.

#### Scenario: Systematic analysis
- **WHEN** the agent applies the STRIDE skill to a list of capabilities
- **THEN** it considers all six categories per capability and produces threats only where a meaningful threat exists

### Requirement: Gemara ThreatCatalog group mapping
The skill SHALL instruct the agent to map STRIDE categories to Gemara ThreatCatalog `groups`, with each group corresponding to a STRIDE category.

#### Scenario: Group structure in authored artifact
- **WHEN** the agent authors a ThreatCatalog using STRIDE
- **THEN** the `groups` array contains entries for each STRIDE category and each threat's `group` field references the corresponding STRIDE group ID

### Requirement: Skill independence from agent CRD
The STRIDE skill SHALL be self-contained — all methodology knowledge lives in the skill files, not in the agent's system prompt or CRD.

#### Scenario: System prompt does not contain STRIDE
- **WHEN** the threat modeler's system prompt is inspected
- **THEN** it references the STRIDE skill by name but does not duplicate STRIDE category definitions or analysis methodology
