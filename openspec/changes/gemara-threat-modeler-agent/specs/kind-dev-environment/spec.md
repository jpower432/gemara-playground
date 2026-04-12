## ADDED Requirements

### Requirement: kind cluster provisioning script
The system SHALL provide a single `make gide-up` target that creates a kind cluster with kagent installed, all MCP servers deployed, a local OCI registry running, and Vertex AI credentials configured.

#### Scenario: Fresh cluster creation
- **WHEN** the user runs `make gide-up` with `VERTEX_PROJECT_ID` and `VERTEX_LOCATION` set
- **THEN** a kind cluster named `gide` is created, kagent is installed via Helm, all MCP server pods reach Ready state, and the local OCI registry is accessible at `localhost:5000`

#### Scenario: Cluster already exists
- **WHEN** the user runs `make gide-up` and a kind cluster named `gide` already exists
- **THEN** the script skips cluster creation and reconciles only the kagent and MCP server deployments

### Requirement: Vertex AI credential secret
The system SHALL create a Kubernetes Secret from the user's Google Application Default Credentials file for the kagent ModelConfig to reference.

#### Scenario: Credentials file exists
- **WHEN** `~/.config/gcloud/application_default_credentials.json` exists
- **THEN** a Secret named `gide-gcp-credentials` is created in the `kagent` namespace

#### Scenario: Credentials file missing
- **WHEN** the credentials file does not exist
- **THEN** the script exits with an error message instructing the user to run `gcloud auth application-default login`

### Requirement: GitHub token secret
The system SHALL create a Kubernetes Secret from the `GITHUB_TOKEN` environment variable for the GitHub MCP Server to use.

#### Scenario: Token provided
- **WHEN** `GITHUB_TOKEN` is set
- **THEN** a Secret named `gide-github-token` is created in the `kagent` namespace

#### Scenario: Token missing
- **WHEN** `GITHUB_TOKEN` is not set
- **THEN** the script prints a warning that GitHub MCP Server will operate in unauthenticated mode with rate limits

### Requirement: Teardown
The system SHALL provide a `make gide-down` target that deletes the kind cluster.

#### Scenario: Cluster teardown
- **WHEN** the user runs `make gide-down`
- **THEN** the kind cluster named `gide` is deleted and all associated resources are removed
