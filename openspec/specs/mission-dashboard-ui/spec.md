## ADDED Requirements

### Requirement: Mission card grid
The dashboard home page SHALL display all missions from the mission registry as a grid of cards. Each card displays the mission's title, description, and icon.

#### Scenario: Cards rendered from registry
- **WHEN** the user opens the dashboard
- **THEN** they see one card per mission in the `MISSIONS` array, in array order

#### Scenario: Disabled mission card
- **WHEN** a mission has `disabled: true`
- **THEN** the card is visually muted with a "Coming Soon" badge and is not clickable

#### Scenario: Mission card click
- **WHEN** the user clicks an enabled mission card
- **THEN** the dashboard navigates to the mission's input form view

### Requirement: Mission input form
Each mission SHALL have a form view that collects the inputs defined in the mission's `inputs` array. The form renders appropriate controls (text input, select dropdown) based on input type.

#### Scenario: Required field validation
- **WHEN** the user attempts to submit a form with an empty required field
- **THEN** the form displays a validation error and prevents submission

#### Scenario: Form submission
- **WHEN** the user fills all required fields and clicks "Start Mission"
- **THEN** the dashboard calls `composeTask` with the form values, sends the resulting message to the orchestrator, and transitions to the response streaming view

### Requirement: Response streaming view
The dashboard SHALL display the orchestrator's streamed response in real-time as the mission executes.

#### Scenario: Streaming text display
- **WHEN** the orchestrator streams text chunks
- **THEN** the dashboard appends each chunk to the response area with markdown rendering

#### Scenario: Mission complete
- **WHEN** the orchestrator's response stream ends
- **THEN** the dashboard marks the mission as complete and enables artifact extraction

### Requirement: Artifact presentation
The dashboard SHALL extract Gemara artifact YAML blocks and the `oras push` command from the completed response and present them in dedicated panels.

#### Scenario: Artifact YAML blocks
- **WHEN** the response contains fenced YAML code blocks labeled as Gemara artifacts (CapabilityCatalog, ThreatCatalog, ControlCatalog)
- **THEN** the dashboard renders each artifact in a collapsible panel with syntax-highlighted YAML and a "Copy YAML" button

#### Scenario: Push command extraction
- **WHEN** the response contains an `oras push` command block
- **THEN** the dashboard renders it in a highlighted command panel with a "Copy Command" button

#### Scenario: Parsing failure graceful degradation
- **WHEN** the response text cannot be parsed for artifacts
- **THEN** the dashboard displays the raw response text without extraction
