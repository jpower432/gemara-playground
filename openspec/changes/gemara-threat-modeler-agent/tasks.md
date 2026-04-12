## 1. Directory Structure and Makefile Targets

- [x] 1.1 Create `deploy/kind/` directory for kind cluster config and setup script
- [x] 1.2 Create `deploy/kagent/` directory for kagent Agent CRDs, ModelConfig, and MCP server manifests
- [x] 1.3 Create `deploy/registry/` directory for local OCI registry manifests and init job
- [x] 1.4 Create `agents/` directory for agent system prompts (kept separate from K8s manifests for iteration)
- [x] 1.5 Add `gide-up` and `gide-down` targets to Makefile

## 2. kind Cluster and kagent Installation

- [x] 2.1 Write `deploy/kind/cluster.yaml` kind config with port mappings for kagent UI (:8001), controller API (:8083), and OCI registry (:5000)
- [x] 2.2 Write `deploy/kind/setup.sh` that creates kind cluster, installs kagent via Helm, and applies all manifests
- [x] 2.3 Add credential validation: check for GCP ADC file and GITHUB_TOKEN, create Kubernetes Secrets
- [x] 2.4 Write `deploy/kagent/model-config.yaml` for AnthropicVertexAI ModelConfig referencing `gide-gcp-credentials` Secret
- [ ] 2.5 Verify kagent controller and dashboard pods reach Ready state _(manual: requires running cluster)_

## 3. MCP Server Deployments

- [x] 3.1 Write `deploy/kagent/gemara-mcp.yaml` — Deployment, Service, and RemoteMCPServer CRD for gemara-mcp with tool name whitelist
- [x] 3.2 Write `deploy/kagent/gemara-mcp-stdio.yaml` — Fallback MCPServer CRD (stdio sidecar) for use if SSE transport is incompatible
- [x] 3.3 Write `deploy/kagent/oras-mcp.yaml` — MCPServer CRD with oras-mcp container as stdio sidecar, mounting Docker credentials Secret
- [x] 3.4 Write `deploy/kagent/github-mcp.yaml` — Deployment, Service, and RemoteMCPServer CRD for github-mcp-server with token from Secret
- [ ] 3.5 Test each MCP server pod reaches Ready and tools are discoverable from kagent dashboard _(manual: requires running cluster)_

## 4. Local OCI Registry

- [x] 4.1 Write `deploy/registry/zot.yaml` — Deployment and Service for zot registry
- [x] 4.2 Write `deploy/registry/init-job.yaml` — Job that pushes sample Gemara artifacts (ThreatCatalog, ControlCatalog, GuidanceCatalog) to zot using oras CLI with complyctl-compatible media types
- [x] 4.3 Create `deploy/registry/samples/` with sample Gemara YAML files from the playground tutorials
- [ ] 4.4 Verify oras-mcp can `list_repositories` and `list_tags` against the local registry _(manual: requires running cluster)_

## 5. GIDE Orchestrator Agent

- [x] 5.1 Write `agents/gide-orchestrator.md` system prompt covering GIDE platform overview, 7-layer model summary, and available specialist routing
- [x] 5.2 Write `deploy/kagent/gide-orchestrator.yaml` — Agent CRD with `tools.type: Agent` referencing `gide-threat-modeler`, ModelConfig reference, and system prompt
- [ ] 5.3 Verify orchestrator appears in kagent dashboard and responds to routing requests _(manual: requires running cluster)_

## 6. GIDE Threat Modeler Agent

- [x] 6.1 Write `agents/gide-threat-modeler.md` system prompt embedding STRIDE methodology, Gemara ThreatCatalog/ControlCatalog structure, threat_assessment workflow, and validate-repair loop instructions
- [x] 6.2 Write `deploy/kagent/gide-threat-modeler.yaml` — Agent CRD with tools from gemara-mcp (author, validate, repair), oras-mcp (list_repos, list_tags, fetch_manifest), and github-mcp (get_file_contents, search_code), plus `allowedNamespaces` for orchestrator
- [ ] 6.3 Verify threat modeler appears in kagent dashboard with all tools listed _(manual: requires running cluster)_

## 7. End-to-End Validation

- [ ] 7.1 Via kagent dashboard: ask orchestrator to analyze threats for a public GitHub repository and confirm it delegates to threat-modeler _(manual: requires running cluster)_
- [ ] 7.2 Verify the threat modeler pulls repo context via github-mcp, produces STRIDE-categorized threats, and calls author_gemara + validate_gemara _(manual)_
- [ ] 7.3 Verify the agent outputs valid ThreatCatalog YAML with a ready-to-copy `oras push` command _(manual)_
- [ ] 7.4 Verify the agent can produce a ControlCatalog from the ThreatCatalog with proper threat mappings _(manual)_
- [ ] 7.5 Verify oras-mcp inventory discovery against the local zot registry _(manual)_

## 8. Upstream Contribution Tracking

- [ ] 8.1 File issue on oras-project/oras-mcp: "Add push_manifest and push_blob tools" with use case description _(manual: upstream)_
- [ ] 8.2 File issue on oras-project/oras-mcp: "Support non-JSON (YAML/text) blob content in fetch_blob" _(manual: upstream)_
- [ ] 8.3 File issue on oras-project/oras-mcp: "Add Streamable HTTP transport option" _(manual: upstream)_
- [ ] 8.4 Verify gemara-mcp SSE transport compatibility with kagent RemoteMCPServer; if incompatible, document findings and plan Streamable HTTP migration for gemara-mcp _(manual: requires running cluster)_
- [ ] 8.5 Evaluate adding a `compose_policy` prompt to gemara-mcp for the future Policy Composer agent _(manual: upstream)_
