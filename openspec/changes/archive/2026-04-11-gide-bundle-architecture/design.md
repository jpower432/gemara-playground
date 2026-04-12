## Context

GIDE (Gemara IDE) is a multi-agent platform for authoring Gemara GRC artifacts, running on kagent with MCP servers as the tool layer. The first iteration deployed a flat architecture where the threat modeler specialist holds all three MCP servers (gemara-mcp, oras-mcp, github-mcp) and the orchestrator is a thin router.

Exploration of the "pull, combine, author, push" bundle workflow revealed that the current design conflates two distinct concerns: **bundle logistics** (OCI registry operations, media type mapping, layer composition) and **domain expertise** (STRIDE methodology, wizard prompt selection, context gathering). This change separates them using kagent-native patterns.

**Key kagent mechanisms leveraged:**

| Mechanism | Purpose in GIDE |
|:---|:---|
| Agent-as-tool (`tools.type: Agent`) | Orchestrator delegates to specialists via text-based messages |
| Git-based skills (`spec.skills.gitRefs`) | STRIDE methodology loaded from a git repo at agent startup |
| A2A skills metadata (`spec.declarative.a2aConfig.skills`) | Specialist capabilities discoverable by orchestrator |
| Prompt templates (`{{include "alias/key"}}`) | Shared instruction fragments (safety, tool usage) via ConfigMaps |

**Constraint:** Agent-as-tool delegation is text in / text out. The orchestrator cannot share filesystem or memory with specialists. Context must be passed as references (repo paths, registry URLs), not content.

## Goals / Non-Goals

**Goals:**
- Orchestrator owns Gemara bundle lifecycle: knows OCI media types, layer composition rules, complyctl compatibility, and how to assemble multi-artifact bundles
- Specialists own domain expertise: the threat modeler knows STRIDE, which gemara-mcp wizard prompts to use, and what repo context to gather
- STRIDE methodology is a reusable kagent skill, evolvable and reusable independently of the agent CRD
- Pre-packaged use case templates are Gemara artifacts in GitHub repos, pulled by specialists via github-mcp
- Orchestrator routes to specialists by matching user intent to A2A skills metadata
- oras-mcp tools allocated to orchestrator only (specialists don't need registry knowledge)

**Non-Goals:**
- Implementing oras-mcp push tools (manual `oras push` workaround continues)
- Building a template registry or template schema (templates are plain Gemara YAML in GitHub repos)
- Implementing the policy composer specialist (future change, architecture enables it)
- Changing MCP server deployments (same servers, different tool allocation)
- Custom UI (kagent dashboard continues as the interface)

## Decisions

### D1: Hybrid orchestrator — bundle expert + router

**Choice:** The orchestrator is both a router to specialists AND a Gemara bundle expert. It knows how to assemble specialist-produced artifacts into OCI bundles with correct media types.

**Alternatives considered:**
- *Thin router (current)*: Orchestrator only routes. Bundle knowledge lives nowhere or in the specialist. Specialists must understand OCI media types, breaking domain isolation.
- *Separate bundle-assembler agent*: A third agent just for packaging. Over-engineers a concern that fits naturally in the orchestrator.

**Rationale:** The orchestrator already sees all specialist outputs. It's the natural place for assembly logic. This keeps specialists pure domain experts with no OCI knowledge.

### D2: oras-mcp allocated to orchestrator, not specialists

**Choice:** Only the orchestrator has oras-mcp tools. Specialists never interact with OCI registries.

**Alternatives considered:**
- *Shared oras-mcp (current)*: Specialist uses oras-mcp for registry discovery. Requires the threat modeler to understand OCI concepts.
- *Both have oras-mcp*: Duplication and unclear ownership of registry operations.

**Rationale:** OCI registry operations are logistics, not domain expertise. The orchestrator pulls templates and provides references to specialists. The orchestrator assembles and pushes bundles. Specialists produce valid Gemara YAML — they don't need to know where it came from or where it's going.

### D3: Templates live in GitHub repos, not OCI registries

**Choice:** Pre-packaged use case templates are Gemara YAML files in GitHub repositories. Specialists pull them via github-mcp `get_file_contents`.

**Alternatives considered:**
- *Templates in OCI registry*: Would require the orchestrator to fetch YAML content via oras-mcp and pass it in the delegation message (expensive in tokens due to text-based agent-as-tool). The oras-mcp `fetch_blob` YAML limitation makes this fragile.
- *Templates embedded in agent prompts*: Locks template content to agent releases. No community contribution path.

**Rationale:** GitHub repos are the natural home for version-controlled, community-contributed YAML files. Specialists already have github-mcp for repo context gathering — reusing it for template pulls requires zero new infrastructure. The orchestrator's delegation message includes a reference (`github.com/org/templates/k8s-ac/`) rather than multi-kilobyte YAML content.

### D4: STRIDE as a kagent git-based skill

**Choice:** Extract STRIDE methodology from the threat modeler's system prompt into a kagent git-based skill at `skills/stride-threat-model/SKILL.md`.

```yaml
skills:
  gitRefs:
    - url: https://github.com/complytime/gemara-playground.git
      ref: main
      path: skills/stride-threat-model
```

**Alternatives considered:**
- *STRIDE in system prompt (current)*: Works but couples methodology to agent CRD. Can't reuse across agents or evolve independently.
- *STRIDE as a container-based skill*: Requires building and pushing a container image. Heavier than needed for a methodology that is pure instructions + reference data.
- *STRIDE as a gemara-mcp prompt*: Over-engineers a static methodology. gemara-mcp wizard prompts provide Gemara scaffolding, not analytical frameworks.

**Rationale:** kagent's git-based skill system loads `SKILL.md` + supporting files from a git repo at agent startup. STRIDE is a methodology (instructions + categories + analysis patterns), not executable code — `SKILL.md` is the right format. The agent gets `read_file` and `bash` tools to interact with skill files. A different agent could load a PASTA or LINDDUN skill from the same system.

### D5: A2A skills metadata for specialist discovery

**Choice:** Specialist agents declare their capabilities as A2A skills metadata in `a2aConfig.skills`. The orchestrator uses this metadata to route user requests.

```yaml
a2aConfig:
  skills:
    - id: threat-assessment
      name: STRIDE Threat Assessment
      description: Analyze threats for a system using STRIDE methodology
      tags: [stride, threats, layer-2]
      examples:
        - "Analyze threats for github.com/org/repo"
        - "Create a ThreatCatalog for a K8s admission controller"
    - id: control-authoring
      name: Control Catalog Authoring
      description: Author controls that mitigate identified threats
      tags: [controls, layer-2]
```

**Rationale:** A2A skills metadata is kagent's native mechanism for expressing agent capabilities. The orchestrator's `{{include "builtin/a2a-communication"}}` prompt template teaches it how to discover and invoke agents by their skills. This is more extensible than hardcoding routing rules — adding a new specialist with new skills automatically makes them discoverable.

### D6: Orchestrator delegation via references, not content

**Choice:** When delegating to a specialist, the orchestrator passes references (GitHub repo paths, template locations) rather than artifact content.

Example delegation message:
```
Analyze threats and author controls for a Kubernetes admission controller.
Template artifacts: github.com/complytime/gide-templates/k8s-admission-controller/
Target repository: github.com/org/admission-controller
Produce: CapabilityCatalog, ThreatCatalog, ControlCatalog
```

**Alternatives considered:**
- *Pass full artifact YAML in delegation*: Expensive in tokens. kagent agent-as-tool is text in/out — large YAML payloads consume context window budget on both sides.
- *Shared filesystem or memory*: kagent agents don't share filesystem. Memory (`save_memory`/`load_memory`) is per-agent and uses vector similarity — not designed for structured artifact passing.

**Rationale:** References are lightweight. The specialist uses its own github-mcp tools to pull what it needs. This also means the specialist can pull selectively — it knows what files matter for its domain (the threat modeler fetches Dockerfiles and K8s manifests, not READMEs).

### D7: Orchestrator knows bundle composition rules

**Choice:** The orchestrator's system prompt contains a bundle composition table mapping use cases to artifact combinations and OCI media types.

| Use Case | Artifacts | Media Types |
|:---|:---|:---|
| Threat assessment | CapabilityCatalog, ThreatCatalog | `application/vnd.gemara.capability-catalog.layer.v1+yaml`, `application/vnd.gemara.threat-catalog.layer.v1+yaml` |
| Control authoring | ControlCatalog, ThreatCatalog (ref) | `application/vnd.gemara.control-catalog.layer.v1+yaml` |
| complyctl policy | ControlCatalog, GuidanceCatalog, Policy | `application/vnd.gemara.control-catalog.layer.v1+yaml`, `application/vnd.gemara.guidance-catalog.layer.v1+yaml`, `application/vnd.gemara.policy.layer.v1+yaml` |

**Rationale:** Bundle composition is not domain expertise — it's packaging knowledge. The orchestrator is the right owner because it sees all specialist outputs and knows the target format (complyctl-compatible, standalone, etc.). The composition table is in the system prompt because it's a small, stable dataset that doesn't warrant a separate tool or service.

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|:---|:---|:---|
| Agent-as-tool text delegation loses structured data fidelity | Specialist returns YAML as text, orchestrator must parse it from the response | Instruct specialist to return artifacts in fenced code blocks with clear delimiters. Orchestrator extracts by convention. |
| Template repos require curation and maintenance | Low-quality templates produce low-quality artifacts | Start with templates in the gemara-playground repo under `templates/`. Community contribution path is a future concern. |
| STRIDE skill in git means agent restart to pick up changes | Methodology updates require pod restart | Acceptable for a development platform. kagent Go runtime starts in ~2 seconds. |
| Orchestrator system prompt grows with bundle composition rules | More use cases = more routing table entries = larger prompt | Composition table is tabular and compact. Move to a ConfigMap-based prompt template if it exceeds ~500 tokens. |
| Specialists can't verify OCI push succeeded | Orchestrator handles push but specialist produced the artifact | Orchestrator confirms push success/failure and reports back to user. Specialist's contract ends at "valid YAML returned." |

## Open Questions

- **Q1:** Should template repos be in-repo (`templates/` directory) or a separate repository (e.g., `complytime/gide-templates`)? In-repo is simpler to start; separate repo enables independent contribution and versioning.
- **Q2:** When kagent skills are loaded from a git ref in the same repo, does the agent pull at startup or is the content baked into the image? Need to verify behavior for `gitRefs` pointing to the same repo the manifests live in.
- **Q3:** Should the orchestrator use kagent prompt templates (`{{include}}`) for the bundle composition table, or inline it in the system prompt? Prompt templates add indirection but enable reuse across orchestrator versions.
