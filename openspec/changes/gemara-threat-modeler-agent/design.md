## Context

GIDE (Gemara IDE) is a multi-agent platform for authoring Gemara GRC artifacts. It runs on kagent (Kubernetes-native AI agent runtime) and uses MCP servers as the tool layer.

**Current state:** The gemara-playground repo contains a static browser-based YAML editor with WASM-powered CUE validation. It has no agent capabilities, no OCI push/pull, and no Kubernetes infrastructure. GIDE is net-new infrastructure alongside the existing playground.

**Key external systems:**

| System | Role | Transport | Status |
|:---|:---|:---|:---|
| kagent v1alpha2 | Agent runtime + orchestration | K8s CRDs + REST :8083 | Stable, supports multi-agent via agent-as-tool |
| gemara-mcp (gemaraproj) | Gemara authoring, validation, repair | SSE (GET /sse, POST /message) | Stable, 5 tools + 3 prompts |
| oras-mcp (oras-project) | OCI registry discovery and fetch | stdio only | Stable but read-only, no push |
| github-mcp-server (github) | Repository context grounding | stdio and Streamable HTTP | Stable |
| gemara-content-service (complytime) | OCI Distribution API for Gemara bundles | HTTP /v2/ | Stable |

**Constraints:**
- Anthropic Claude via Google Vertex AI (requires GCP project + ADC credentials)
- OCI bundles must be complyctl-compatible (multi-layer manifest with media-type-distinguished layers)
- The user is the gemara-mcp maintainer — upstream contributions are preferred over workarounds

## Goals / Non-Goals

**Goals:**
- Deploy a working kind cluster with kagent, all MCP servers, and a local OCI registry
- Define a multi-agent hierarchy: orchestrator → specialist agents (starting with threat-modeler)
- Enable STRIDE-based ThreatCatalog and ControlCatalog authoring grounded in real repository context
- Discover and fetch existing Gemara artifacts from OCI registries via oras-mcp
- Validate all authored artifacts against Gemara CUE schemas via gemara-mcp
- Identify and document all upstream contribution opportunities

**Non-Goals:**
- Custom React UI (future work — use kagent's built-in dashboard for now)
- Policy composition agent (future specialist agent, not in this change)
- OCI push from within the agent workflow (blocked by oras-mcp; workaround documented)
- Production deployment or multi-tenancy
- GitLab MCP Server integration (GitHub only for first use case)

## Decisions

### D1: Multi-agent with orchestrator pattern

**Choice:** Single `gide-orchestrator` agent that delegates to specialist agents via kagent's agent-as-tool mechanism.

**Alternatives considered:**
- *Single monolithic agent*: Simpler deployment but 26+ tools in one context window degrades tool selection accuracy. System prompt becomes diluted across domains.
- *Independent agents without orchestrator*: User must know which agent to talk to. Breaks the "single IDE" experience.

**Rationale:** The orchestrator pattern lets each specialist agent have a focused system prompt and minimal tool set. kagent natively supports `tools.type: Agent` for cross-agent delegation. The orchestrator starts with one specialist (threat-modeler) and grows incrementally.

### D2: Anthropic via Vertex AI ModelConfig

**Choice:** `AnthropicVertexAI` provider with `claude-sonnet-4` model.

```yaml
apiVersion: kagent.dev/v1alpha2
kind: ModelConfig
metadata:
  name: gide-model-config
  namespace: kagent
spec:
  provider: AnthropicVertexAI
  model: claude-sonnet-4@20250514
  apiKeySecret: gide-gcp-credentials
  apiKeySecretKey: application_default_credentials.json
  anthropicVertexAI:
    projectID: <user-provided>
    location: us-east5
```

**Rationale:** User requirement. Vertex AI provides enterprise-grade access with IAM-based auth rather than API keys.

### D3: oras-mcp as stdio sidecar (not RemoteMCPServer)

**Choice:** Deploy oras-mcp as a sidecar container using kagent's `MCPServer` CRD (stdio transport).

**Alternatives considered:**
- *RemoteMCPServer with SSE*: oras-mcp only supports stdio. Would require contributing Streamable HTTP transport upstream first.
- *Wrap oras CLI as kagent built-in tool*: Loses the structured MCP tool interface. More brittle.

**Rationale:** kagent supports both stdio (`MCPServer`) and HTTP (`RemoteMCPServer`) MCP servers. Stdio via sidecar is the path of least resistance. Upstream contribution for HTTP transport is a future improvement.

**Upstream opportunity:** Contribute Streamable HTTP transport to oras-mcp so it can be deployed as a standalone service referenced by RemoteMCPServer.

### D4: gemara-mcp as RemoteMCPServer

**Choice:** Deploy gemara-mcp as a Kubernetes Deployment with a Service, referenced via `RemoteMCPServer` CRD.

**Risk:** gemara-mcp uses legacy SSE (GET /sse + POST /message). kagent RemoteMCPServer supports `STREAMABLE_HTTP` protocol. These may not be compatible.

**Workaround if incompatible:** Deploy gemara-mcp as stdio sidecar (same as oras-mcp). gemara-mcp is a Go binary that likely supports stdio.

**Upstream opportunity (gemara-mcp):** Verify and document Streamable HTTP compatibility. If needed, migrate from legacy SSE to the 2025 Streamable HTTP spec.

### D5: OCI push workaround

**Choice:** For the first iteration, the "Approve & Push" step is manual. The agent authors and validates the artifact, outputs the final YAML, and the user pushes via `oras push` CLI or `complyctl`.

**Alternatives considered:**
- *Build a custom push MCP tool*: Adds a new server to maintain. Violates "reuse existing infrastructure" principle.
- *Add push to oras-mcp upstream*: Correct long-term solution but blocks the first use case.

**Rationale:** The core value of the threat modeler is STRIDE-structured authoring + validation, not the push mechanism. The push gap doesn't block the authoring workflow.

**Upstream opportunity (oras-mcp):** Contribute `push_manifest` and `push_blob` tools. This benefits the entire ORAS MCP community, not just GIDE.

### D6: GitHub MCP Server for repository context

**Choice:** Deploy `github/github-mcp-server` as a RemoteMCPServer. The threat modeler uses `get_file_contents` and `search_code` to ground STRIDE analysis in actual repository architecture.

**Rationale:** Threats grounded in real code (Dockerfiles, Kubernetes manifests, dependency files) produce higher-quality ThreatCatalogs than abstract analysis. GitHub MCP Server supports Streamable HTTP natively, making it straightforward to deploy as RemoteMCPServer.

### D7: Local OCI registry for testing

**Choice:** Deploy `zot` (OCI-native registry) in the kind cluster for push/pull testing.

**Alternatives considered:**
- *Docker Distribution registry*: Heavier, less OCI-native.
- *gemara-content-service*: More realistic but adds deployment complexity for the first iteration.

**Rationale:** zot is lightweight, OCI-spec compliant, and purpose-built for artifact storage. Pre-load it with sample Gemara bundles using an init job.

### D8: STRIDE methodology embedded in system prompt

**Choice:** Embed STRIDE categories (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) directly in the threat-modeler agent's system prompt, combined with gemara-mcp's `threat_assessment` prompt.

**Alternatives considered:**
- *Expose STRIDE as a separate MCP prompt*: Over-engineers a static methodology.
- *Use gemara-mcp threat_assessment prompt alone*: Doesn't enforce STRIDE structure.

**Rationale:** STRIDE is a fixed methodology — it doesn't need dynamic tool invocation. The system prompt instructs the agent to categorize every threat by STRIDE category and map it to Gemara ThreatCatalog groups. gemara-mcp's `threat_assessment` prompt provides the Gemara-specific workflow scaffolding.

### D9: MCP as domain expert, agent as task orchestrator

**Choice:** MCP servers carry domain knowledge (schemas, validation, wizard prompts, lexicon). Agents are task orchestrators — they sequence workflow steps, gather context, and handle errors. Agent systemMessages are thin workflow descriptions, not domain encyclopedias.

**Alternatives considered:**
- *Agent as domain expert*: Embed artifact structure, STRIDE methodology, validation rules, and schema knowledge into each agent's systemMessage. MCP servers are dumb tool providers.

**Rationale:** gemara-mcp already ships wizard prompts (`threat_assessment`, `control_catalog`, `migration`), the full Gemara lexicon, and CUE schema definitions. It **is** the domain expert. Duplicating that knowledge in agent systemMessages creates two sources of truth that drift independently. When Gemara adds a new artifact type or changes a field, updating the MCP server propagates to all agents automatically. Agent systemMessages shrink to workflow orchestration: gather context → invoke wizard prompt → author YAML → validate → return.

### D10: One specialist agent per task workflow

**Choice:** Each specialist agent maps to a distinct task with its own workflow, persona, context sources, and approval gates. Agents are not added per artifact type.

**Alternatives considered:**
- *Single authoring agent for all layers*: One "artifact-author" agent handles any layer, selected by which gemara-mcp prompt it invokes.

**Rationale:** Threat modeling, guidance authoring, and policy composition are fundamentally different workflow shapes — not different parameters to the same shape. They differ along every axis:

| | Threat Modeler | Guidance Author | Policy Composer |
|:--|:--|:--|:--|
| **Persona** | Security architect | Domain expert | Compliance officer |
| **Workflow** | Decompose → enumerate → assess | Research → distill → write | Aggregate → decide → codify |
| **Context** | Code repos (github-mcp) | Standards, industry knowledge | Existing L1+L2 artifacts |
| **Approval gates** | Code access | None (advisory) | High — policy changes are sensitive |

A single authoring agent would need to context-switch between these personas and workflows, diluting its effectiveness. Separate specialists keep each agent focused.

### D11: Orchestrator-resolved artifact threading

**Choice:** The orchestrator resolves upstream layer artifacts from the OCI registry and injects them into each specialist's A2A delegation message. Specialists never touch the registry.

**Alternatives considered:**
- *Pass-through via delegation message*: Orchestrator stores artifacts in memory and passes full YAML blobs in delegation messages. Simple but doesn't scale — YAML blobs grow large across 5+ layers.
- *Registry as shared state*: Orchestrator pushes artifacts to registry; specialists pull them via oras-mcp. Architecturally clean but gives every specialist registry access, violating the principle that specialists stay focused on their domain tools.

**Rationale:** Keeps specialists focused (only gemara-mcp + context tools). The orchestrator is the sole registry operator — it owns oras-mcp and manages all OCI read/write. Specialists receive resolved artifacts in their delegation context and return authored artifacts to the orchestrator.

### D12: Gemara layer import graph drives mission planning

**Choice:** The orchestrator knows the Gemara layer dependency graph and uses it to plan multi-step missions.

**Layer import rules:**

| Producing Layer | Imports From |
|:--|:--|
| L1 Guidance | — (root) |
| L2 Controls | L1 |
| L3 Policy | L1, L2 |
| L5 Evaluation | L2, L3 |
| L6 Enforcement | L2, L3, L5 |
| L7 Audit | L3, L5, L6 |

L4 (Activity) has no schema — it is the subject being measured, not an artifact.

**Three-phase model:**
- **Criteria (L1-L3):** Define what should be true. Authoring agents produce artifacts from analysis and judgment.
- **Subject (L4):** The real world — systems, deployments, code, configs, people. Not serializable.
- **Measurement (L5-L7):** Determine what is true. Observation agents produce artifacts from evidence and runtime state.

**Mission planning example:**

When a user requests a "full compliance package," the orchestrator builds an execution DAG:

```
L1 (guidance-author) → L2 (threat-modeler, receives L1) → L3 (policy-composer, receives L1+L2) → bundle assembly
```

Each step's output is resolved by the orchestrator and injected into the next specialist's delegation (per D11).

### D13: GIDE scope is criteria layers (L1-L3)

**Choice:** GIDE focuses on the criteria half of the Gemara model: Guidance (L1), Controls (L2), and Policy (L3). Measurement layers (L5-L7) are out of scope.

**Rationale:** The criteria and measurement halves serve different personas, use different tools, and operate at different cadences:

| | Criteria (L1-L3) | Measurement (L5-L7) |
|:--|:--|:--|
| **Personas** | Security architects, compliance officers | Auditors, SREs, operators |
| **Tools** | gemara-mcp, github-mcp | Runtime APIs, observability, cluster state |
| **Cadence** | Per-project, periodic | Continuous, event-driven |
| **Action** | Analyze, author, compose | Observe, evaluate, enforce |

Measurement agents may be built on the same kagent infrastructure in the future, but they represent a different product surface with different integration requirements.

### D14: Go ADK runtime for ecosystem alignment

**Choice:** All GIDE agents use `runtime: go`.

**Alternatives considered:**
- *Python runtime*: More built-in kagent agents use Python (10 vs 0 for Go). Larger community example base.

**Rationale:** The Gemara ecosystem is Go-native: CUE tooling, Gemara Go SDK, gemara-mcp, oras-mcp, and complyctl are all Go. GIDE agents compose MCP tools via the agentgateway sidecar — both runtimes handle this identically. The Go runtime enables future custom tools that import the Gemara Go SDK directly (e.g., local CUE evaluation, OCI bundle assembly inside the agent). The Python built-in agents reflect kagent team heritage, not an architectural recommendation.

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|:---|:---|:---|
| gemara-mcp SSE not compatible with kagent RemoteMCPServer | Agent can't reach gemara-mcp tools | Fall back to stdio sidecar deployment (D4 workaround) |
| oras-mcp fetch_blob rejects non-JSON Gemara YAML | Can't fetch artifact content via oras-mcp | Use fetch_manifest to get layer digests, then agent reasons over manifest structure. Contribute JSON+YAML support upstream. |
| 26+ tools across all MCP servers in orchestrator context | Tool selection accuracy degrades | Orchestrator only sees agent-as-tool references (5 tools max). Each specialist has <10 tools. |
| Vertex AI rate limits during development | Slow iteration | Configure ModelConfig with conservative temperature. Use kagent CLI local mode for prompt iteration before deploying to kind. |
| kind cluster resource pressure with multiple MCP server pods | OOM or scheduling failures on dev machines | Set resource requests/limits. oras-mcp and gemara-mcp are lightweight Go binaries (<50MB memory each). |

## Open Questions

- **Q1:** What is the exact Streamable HTTP endpoint format kagent expects for RemoteMCPServer? Need to verify against gemara-mcp's SSE implementation.
- **Q2:** What media types does complyctl expect for each Gemara layer in the OCI manifest? Needed for the init job that pre-loads the local registry.
- **Q3:** ~~Should the orchestrator have its own tools (e.g., oras-mcp for inventory browsing) or should all tools be delegated to specialists?~~ **Resolved in D11:** Orchestrator is the sole registry operator. Specialists do not have oras-mcp access.
- **Q4:** How should the orchestrator pass large multi-layer artifact sets to downstream specialists as the layer count grows? D11 specifies injection into the delegation message, but at what point does this exceed practical context window limits?
- **Q5:** `agents/gide-threat-modeler.md` and `agents/gide-orchestrator.md` reference tools and workflows that diverge from the deployed CRDs. Should these markdown files be the source of truth that generates CRDs, or are they reference docs that should be updated to match?
