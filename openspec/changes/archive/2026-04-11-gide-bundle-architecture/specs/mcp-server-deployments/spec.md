## MODIFIED Requirements

### Requirement: oras-mcp deployment
The system SHALL deploy oras-mcp (oras-project) as a stdio sidecar using kagent's `MCPServer` CRD, since oras-mcp only supports stdio transport. The oras-mcp tools SHALL be allocated to the orchestrator agent, not specialist agents.

#### Scenario: MCPServer CRD with sidecar
- **WHEN** the oras-mcp manifests are applied
- **THEN** a `MCPServer` CRD is created that runs the oras-mcp container image with `serve` command over stdio

#### Scenario: Registry credentials
- **WHEN** OCI registry authentication is needed
- **THEN** the oras-mcp sidecar mounts Docker credentials from a Secret at `/root/.docker/config.json`

#### Scenario: Tool allocation to orchestrator
- **WHEN** the orchestrator Agent CRD references oras-mcp
- **THEN** it includes tools: `list_repositories`, `list_tags`, `list_referrers`, `fetch_manifest`, `parse_reference`

#### Scenario: Specialist does not reference oras-mcp
- **WHEN** the threat modeler Agent CRD is inspected
- **THEN** it does NOT include any oras-mcp tool references

### Requirement: Tool name whitelisting
Each RemoteMCPServer and MCPServer CRD SHALL use `toolNames` to expose only the tools needed by the agents, not the full tool surface.

#### Scenario: Minimal tool exposure
- **WHEN** the agent references an MCP server
- **THEN** only explicitly listed tool names are available to the agent, reducing context window usage
