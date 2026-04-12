## Context

GIDE agents currently embed domain knowledge in systemMessages that duplicates what gemara-mcp already provides (wizard prompts, lexicon, schema definitions). The orchestrator prompt lacks awareness of Gemara's layer import graph, preventing multi-step mission planning. A static HTML launcher component adds deployment surface area with no value now that kagent's built-in UI handles agent interaction.

Decisions D9-D14 in the parent design doc (`openspec/changes/gemara-threat-modeler-agent/design.md`) established the architectural direction. This change implements those decisions.

## Goals / Non-Goals

**Goals:**
- Rewrite threat modeler systemMessage as a thin task workflow per D9
- Add layer import graph and mission planning logic to orchestrator prompt per D12
- Remove launcher component (Helm templates, HTML, values, Makefile target)
- Converge `agents/*.md` with deployed CRD reality

**Non-Goals:**
- Adding new specialist agents (guidance-author, policy-composer)
- Implementing multi-step mission execution (the orchestrator learns the DAG but only has one specialist)
- Changing MCP server deployments or tool allocations
- Modifying the Helm chart structure beyond launcher removal

## Decisions

### D1: Threat modeler systemMessage structure

**Choice:** Replace the current 30-line domain-heavy systemMessage with a task-focused workflow:

```
1. Gather context (github-mcp: get_file_contents, search_code)
2. Use gemara-mcp wizard prompts (threat_assessment, control_catalog)
3. Author YAML directly, guided by prompt output
4. Validate with validate_gemara_artifact
5. Fix and re-validate (max 3 attempts)
6. Return validated YAML to orchestrator
```

The systemMessage references gemara-mcp prompts by name but does not duplicate their content. STRIDE methodology stays as a brief instruction ("categorize by STRIDE categories") since it's a fixed framework, not dynamic domain knowledge.

**Rationale:** gemara-mcp owns artifact structure, schema rules, and authoring guidance. The agent only needs to know the workflow sequence and its tool set.

### D2: Orchestrator prompt additions

**Choice:** Add two sections to the orchestrator's ConfigMap prompt:

1. **Layer import graph** — Table showing which layers each producing layer imports from. Enables the orchestrator to reason about execution ordering.

2. **Three-phase model context** — Criteria (L1-L3), Subject (L4), Measurement (L5-L7). The orchestrator states current scope (L1-L3) and responds appropriately when users ask about measurement layers.

No changes to routing rules, bundle assembly, or specialist delegation format.

**Rationale:** The orchestrator needs this knowledge for D12 (mission planning). Even with only one specialist today, encoding the full graph prepares for incremental specialist additions without prompt rewrites.

### D3: Launcher removal scope

**Choice:** Remove all launcher artifacts:

| Artifact | Action |
|:--|:--|
| `charts/gide/templates/launcher-configmap.yaml` | Delete |
| `charts/gide/templates/dashboard-deployment.yaml` | Delete |
| `charts/gide/templates/dashboard-service.yaml` | Delete |
| `charts/gide/launcher/index.html` | Delete |
| `launcher/index.html` | Delete |
| `values.yaml` launcher section | Remove |
| `Makefile` launcher-dev target | Remove |
| `setup.sh` launcher port-forward reference | Remove |
| `NOTES.txt` launcher access line | Remove |

The `dashboard-deployment` and `mission-dashboard-ui` specs become historical — they described components that no longer ship.

### D4: Agent doc convergence

**Choice:** Rewrite `agents/gide-orchestrator.md` and `agents/gide-threat-modeler.md` to match the deployed CRD state, incorporating D9 task-oriented framing. These docs serve as human-readable references, not CRD source-of-truth (Helm templates are source-of-truth).

**Tool name corrections:**
- Remove: `author_gemara`, `validate_gemara`, `repair_gemara`, `convert_to_gemara`
- Add: `validate_gemara_artifact`, `migrate_gemara_artifact`

## Risks / Trade-offs

| Risk | Mitigation |
|:--|:--|
| Thinner systemMessage may reduce threat modeler output quality | gemara-mcp wizard prompts carry the domain guidance. Monitor first few runs and adjust if quality drops. |
| Removing launcher loses mission discoverability | kagent UI already lists agents and accepts chat. Mission templates can be documented in README. |
| Layer import graph in prompt adds tokens with no immediate use (one specialist) | Minimal token cost (~200 tokens). Prevents a prompt rewrite when the second specialist lands. |
