## ADDED Requirements

### Requirement: gemara-mcp deployment
The system SHALL deploy gemara-mcp (gemaraproj) as a Kubernetes Deployment with a Service in the `kagent` namespace, referenced by a `RemoteMCPServer` CRD.

#### Scenario: Deployment and service
- **WHEN** the gemara-mcp manifests are applied
- **THEN** a Deployment running the gemara-mcp container and a ClusterIP Service exposing its SSE port are created

#### Scenario: RemoteMCPServer CRD
- **WHEN** the RemoteMCPServer for gemara-mcp is applied
- **THEN** it references the gemara-mcp Service URL and exposes tools: `author_gemara`, `validate_gemara`, `convert_to_gemara`, `repair_gemara`, `merge_gemara`

#### Scenario: SSE transport incompatibility workaround
- **WHEN** kagent's `STREAMABLE_HTTP` protocol is incompatible with gemara-mcp's legacy SSE
- **THEN** the deployment falls back to a stdio sidecar configuration using kagent's `MCPServer` CRD instead

### Requirement: oras-mcp deployment
The system SHALL deploy oras-mcp (oras-project) as a stdio sidecar using kagent's `MCPServer` CRD, since oras-mcp only supports stdio transport.

#### Scenario: MCPServer CRD with sidecar
- **WHEN** the oras-mcp manifests are applied
- **THEN** a `MCPServer` CRD is created that runs the oras-mcp container image with `serve` command over stdio

#### Scenario: Registry credentials
- **WHEN** OCI registry authentication is needed
- **THEN** the oras-mcp sidecar mounts Docker credentials from a Secret at `/root/.docker/config.json`

### Requirement: github-mcp-server deployment
The system SHALL deploy github-mcp-server (github/github-mcp-server) as a Kubernetes Deployment with a Service, referenced by a `RemoteMCPServer` CRD.

#### Scenario: Deployment with token
- **WHEN** the github-mcp manifests are applied and `gide-github-token` Secret exists
- **THEN** a Deployment running github-mcp-server with the `GITHUB_PERSONAL_ACCESS_TOKEN` env var from the Secret is created

#### Scenario: RemoteMCPServer CRD
- **WHEN** the RemoteMCPServer for github-mcp is applied
- **THEN** it references the github-mcp Service URL and exposes tools including `get_file_contents`, `search_code`, `search_repositories`

### Requirement: Tool name whitelisting
Each RemoteMCPServer and MCPServer CRD SHALL use `toolNames` to expose only the tools needed by the agents, not the full tool surface.

#### Scenario: Minimal tool exposure
- **WHEN** the agent references an MCP server
- **THEN** only explicitly listed tool names are available to the agent, reducing context window usage
