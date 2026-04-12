## ADDED Requirements

### Requirement: Server action for task submission
The system SHALL provide a Next.js server action that accepts a task message string and a target agent name, sends an A2A `tasks/send` request to the kagent controller, and returns a streaming response.

#### Scenario: Task submitted to orchestrator
- **WHEN** the server action is called with `agent: "gide-orchestrator"` and a composed task message
- **THEN** it sends an HTTP POST to `{KAGENT_API_URL}/api/a2a/kagent/gide-orchestrator/` with the A2A task payload and returns a `ReadableStream` of response chunks

#### Scenario: Controller unreachable
- **WHEN** the kagent controller is not reachable
- **THEN** the server action returns an error object with a human-readable message (not a stack trace)

### Requirement: A2A task payload format
The server action SHALL construct a valid A2A `tasks/send` JSON-RPC request with a `TextPart` message containing the composed task string.

#### Scenario: Payload structure
- **WHEN** the server action constructs the A2A request
- **THEN** the payload includes `jsonrpc: "2.0"`, `method: "tasks/send"`, and `params.message.parts` containing a `TextPart` with the task message

### Requirement: Streaming response handling
The server action SHALL stream the agent's response back to the client as it arrives, enabling real-time display.

#### Scenario: Incremental text delivery
- **WHEN** the agent produces text in chunks
- **THEN** each chunk is delivered to the client as soon as it is received from the controller

#### Scenario: Stream completion
- **WHEN** the agent's response is complete
- **THEN** the stream closes cleanly and the client receives an end-of-stream signal

### Requirement: Controller URL configuration
The kagent controller URL SHALL be configurable via `KAGENT_API_URL` environment variable, defaulting to `http://localhost:8083`.

#### Scenario: Default URL
- **WHEN** `KAGENT_API_URL` is not set
- **THEN** the server action connects to `http://localhost:8083`

#### Scenario: Cluster-internal URL
- **WHEN** deployed in the kind cluster with `KAGENT_API_URL=http://kagent-controller.kagent.svc.cluster.local:8083`
- **THEN** the server action connects to the cluster-internal service
