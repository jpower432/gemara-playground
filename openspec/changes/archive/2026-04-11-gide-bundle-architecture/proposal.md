## Why

The current GIDE architecture treats all three MCP servers (gemara-mcp, oras-mcp, github-mcp) as tools on the specialist agent, with no separation between bundle logistics and domain expertise. This means the threat modeler agent must understand OCI media types, bundle composition, and registry operations alongside STRIDE methodology — responsibilities that belong at different layers. Additionally, the STRIDE methodology is hardcoded in the agent's system prompt rather than leveraging kagent's skill system, making it impossible to evolve or reuse independently.

This change redesigns GIDE into a hybrid orchestrator/specialist architecture where the orchestrator owns Gemara bundle lifecycle (pull, combine, push) and specialists own domain expertise (threat modeling, policy composition). It also adopts kagent-native patterns: git-based skills for methodology, A2A skills metadata for capability discovery, and prompt templates for shared instruction fragments.

## What Changes

- **Orchestrator redesign**: `gide-orchestrator` gains oras-mcp tools and Gemara bundle knowledge (layer composition, OCI media types, complyctl compatibility). Delegates to specialists with references (template repo paths, user repo), not content.
- **Specialist redesign**: `gide-threat-modeler` loses oras-mcp, gains STRIDE as a kagent git-based skill. Keeps gemara-mcp (wizard prompts, authoring, validation) and github-mcp (template pull, repo context). Adds A2A skills metadata for orchestrator discovery.
- **STRIDE skill extraction**: STRIDE methodology moves from the system prompt into a reusable kagent skill (`stride-threat-model`) loadable from a git repo.
- **Template-from-GitHub pattern**: Pre-packaged use case templates are Gemara artifacts stored in GitHub repos, pulled into specialist context via github-mcp `get_file_contents` — not fetched from OCI registries.
- **Agent prompt restructuring**: Orchestrator system prompt gains use-case routing table and bundle assembly logic. Specialist system prompt focuses on domain workflow and wizard prompt selection. Both use kagent prompt templates for shared fragments.

## Capabilities

### New Capabilities

- `orchestrator-bundle-manager`: Orchestrator knowledge of Gemara bundle composition, OCI media types, complyctl compatibility, and use-case-to-specialist routing
- `stride-skill`: STRIDE threat modeling methodology packaged as a kagent git-based skill with SKILL.md
- `a2a-agent-discovery`: A2A skills metadata on specialist agents enabling orchestrator to discover and route by capability
- `template-from-github`: Pattern for pulling pre-packaged Gemara artifact templates from GitHub repos into specialist context via github-mcp

### Modified Capabilities

- `gide-orchestrator-agent`: Gains oras-mcp tools, bundle assembly logic, and use-case routing table. No longer a thin router.
- `gide-threat-modeler-agent`: Loses oras-mcp tools. Gains kagent skill reference (stride-threat-model), A2A skills metadata, and template-aware workflow.
- `mcp-server-deployments`: oras-mcp moves from specialist tool allocation to orchestrator tool allocation.
- `oci-artifact-workflow`: Bundle assembly responsibility moves from specialist output to orchestrator assembly step.

## Impact

- **Agent CRDs**: Both `gide-orchestrator.yaml` and `gide-threat-modeler.yaml` rewritten with new tool allocations, skill references, and A2A config
- **Agent prompts**: Both `agents/gide-orchestrator.md` and `agents/gide-threat-modeler.md` rewritten
- **New directory**: `skills/stride-threat-model/` for the STRIDE kagent skill
- **New directory or repo**: Template artifacts for pre-packaged use cases (location TBD — could be in-repo or separate)
- **No new dependencies**: Uses existing kagent skill system, A2A protocol, and MCP servers
- **Upstream**: No gemara-mcp or oras-mcp changes required for this change (push remains manual)
