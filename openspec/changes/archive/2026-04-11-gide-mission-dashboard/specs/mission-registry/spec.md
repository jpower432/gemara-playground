## ADDED Requirements

### Requirement: Mission type definition
The system SHALL define a TypeScript type `Mission` with fields: `id` (string), `title` (string), `description` (string), `icon` (string), `inputs` (array of input field definitions), `expectedArtifacts` (array of Gemara artifact type strings), `targetAgent` (string), `disabled` (boolean, optional), and `composeTask` (function mapping form inputs to an A2A task message string).

#### Scenario: Type safety at build time
- **WHEN** a developer adds a new mission to the registry
- **THEN** the TypeScript compiler enforces all required fields are present and correctly typed

### Requirement: Static mission list
The system SHALL define a `MISSIONS` array in `dashboard/src/config/missions.ts` containing all available missions. Missions are added or removed via code changes only.

#### Scenario: Threat model mission present
- **WHEN** the mission registry is loaded
- **THEN** it contains a mission with `id: "threat-model"`, `title: "Threat Model"`, inputs for `repository` (required) and `template` (optional, with preset options including "k8s-admission-controller"), `expectedArtifacts: ["CapabilityCatalog", "ThreatCatalog", "ControlCatalog"]`, and `targetAgent: "gide-orchestrator"`

#### Scenario: Disabled mission
- **WHEN** a mission has `disabled: true`
- **THEN** the UI renders it as a grayed-out card with a "Coming Soon" badge

### Requirement: Task composition function
Each mission SHALL include a `composeTask` function that transforms structured form inputs into a natural language A2A task message compatible with the orchestrator's routing table.

#### Scenario: Threat model task composition
- **WHEN** the user submits the threat model form with `repository: "github.com/org/repo"` and `template: "k8s-admission-controller"`
- **THEN** `composeTask` produces a message like: "Analyze threats and author controls for a Kubernetes admission controller. Template artifacts: github.com/complytime/gemara-playground/templates/k8s-admission-controller/ Target repository: github.com/org/repo Produce: CapabilityCatalog, ThreatCatalog, ControlCatalog"

#### Scenario: No template selected
- **WHEN** the user submits with no template selection
- **THEN** `composeTask` omits the template artifacts line from the message

### Requirement: Input field definition
Each mission input SHALL define: `name` (string), `label` (string), `type` (text | select), `required` (boolean), `placeholder` (string, optional), and `options` (array of label/value pairs, for select type).

#### Scenario: Repository input field
- **WHEN** the threat model mission inputs are inspected
- **THEN** the repository input has `type: "text"`, `required: true`, and `placeholder: "github.com/org/repo"`

#### Scenario: Template select field
- **WHEN** the threat model mission inputs are inspected
- **THEN** the template input has `type: "select"`, `required: false`, and options including `{ label: "K8s Admission Controller", value: "k8s-admission-controller" }` and `{ label: "None (start from scratch)", value: "" }`
