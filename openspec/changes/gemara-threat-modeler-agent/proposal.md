## Why

GIDE (Gemara IDE) is a platform for authoring, validating, and publishing Gemara GRC artifacts using AI agents orchestrated by kagent on Kubernetes. No tooling exists today that combines the Gemara 7-layer model with agentic workflows, STRIDE threat modeling methodology, and OCI-based artifact management in a single platform.

The first agent in GIDE is a **Threat Modeler** — a kagent-managed AI agent that helps users create Gemara ThreatCatalogs and ControlCatalogs grounded in real repository context. This is the highest-value entry point because threat/control authoring is the most labor-intensive Gemara workflow and benefits most from LLM assistance with STRIDE-structured reasoning.

## What Changes

- **kagent infrastructure**: kind cluster setup with kagent, Anthropic via Vertex AI ModelConfig, and MCP server deployments
- **Multi-agent foundation**: Orchestrator agent (`gide-orchestrator`) that routes to specialist agents, starting with `gide-threat-modeler`
- **Threat Modeler agent**: kagent Agent CRD with STRIDE-based system prompt, wired to gemara-mcp (authoring/validation), oras-mcp (OCI discovery), and GitHub MCP Server (repository context)
- **MCP server deployments**: Kubernetes manifests for gemara-mcp, oras-mcp, and github-mcp-server as RemoteMCPServer/MCPServer resources
- **Local OCI registry**: Writable registry in the kind cluster for push testing, pre-loaded with sample Gemara bundles in complyctl-compatible format
- **Upstream contributions identified**: Push tools for oras-mcp, Streamable HTTP transport for gemara-mcp, compose_policy prompt for gemara-mcp

## Capabilities

### New Capabilities

- `kind-dev-environment`: kind cluster provisioning with kagent, MCP servers, OCI registry, and Vertex AI credentials
- `gide-orchestrator-agent`: Top-level kagent Agent that routes user requests to specialist agents via agent-as-tool
- `gide-threat-modeler-agent`: Specialist kagent Agent for STRIDE-based ThreatCatalog and ControlCatalog authoring using gemara-mcp, oras-mcp, and github-mcp
- `mcp-server-deployments`: Kubernetes manifests for gemara-mcp, oras-mcp, and github-mcp-server with auth secrets and service wiring
- `oci-artifact-workflow`: OCI discovery and fetch via oras-mcp with workarounds for missing push capability; complyctl-compatible media types

### Modified Capabilities

_(none — this is net-new infrastructure alongside the existing playground)_

## Impact

- **New directory**: `deploy/` for Kubernetes manifests (kind config, kagent CRDs, MCP server deployments, secrets)
- **New directory**: `agents/` for agent system prompts and prompt libraries
- **Dependencies**: kagent (Helm), gemara-mcp (container), oras-mcp (container), github-mcp-server (container)
- **External services**: Google Cloud Vertex AI (Anthropic model access), GitHub API (token for github-mcp)
- **Existing playground**: Unchanged — GIDE runs alongside it in the same repo
- **Upstream gaps requiring workarounds**:
  - oras-mcp has no push tools (workaround: oras CLI wrapper as kagent built-in tool)
  - oras-mcp is stdio-only (workaround: run as sidecar container with kagent MCPServer CRD)
  - oras-mcp fetch_blob rejects non-JSON (workaround: fetch manifest → parse layers → decode YAML content via agent reasoning)
  - gemara-mcp transport compatibility with kagent RemoteMCPServer needs verification
