## Context

kagent v0.8 introduced a Go ADK runtime selectable via `runtime: go` in the Declarative agent spec. The Python runtime (AutoGen-based) remains the default. GIDE agents are Declarative — they use CRD-defined system prompts, MCP tools, and prompt templates with no custom application code.

**Go ADK capabilities (from kagent v0.8 release):**
- Built-in tools: `SkillsTool`, `BashTool`, `ReadFile`, `WriteFile`, `EditFile`
- MCP tool execution (same protocol as Python runtime)
- Prompt template rendering (`{{include}}` syntax)
- A2A protocol support (agent-as-tool, A2A skills metadata)
- Git-based skill loading via `SkillsTool`
- ~2s startup vs ~15s for Python
- Lower memory baseline

**GIDE features that need verification against Go ADK:**

| Feature | Used By | Mechanism |
|:---|:---|:---|
| MCP tool calls | Both agents | `tools.type: McpServer` |
| Git-based skills | Threat modeler | `skills.gitRefs` → `SkillsTool` |
| Prompt templates | Orchestrator | `promptTemplate.dataSources` + `{{include}}` |
| Agent-as-tool | Orchestrator → Threat modeler | `tools.type: Agent` |
| A2A skills metadata | Threat modeler | `a2aConfig.skills` |

## Goals / Non-Goals

**Goals:**
- Switch both GIDE agents to Go ADK runtime
- Verify all GIDE-critical features work on Go runtime
- Reduce agent pod startup time and resource footprint

**Non-Goals:**
- Writing custom Go agent code (agents remain Declarative, not BYO/Programmatic)
- Migrating to BYO agent type
- Using Go ADK built-in file tools for artifact authoring (gemara-mcp handles this)

## Decisions

### D1: `runtime: go` on Declarative agents (not BYO)

**Decision:** Add `runtime: go` under `spec.declarative` in both Agent CRDs. Keep `type: Declarative`.

**Alternatives:**
- BYO agent type with custom Go binary: Requires writing and maintaining Go application code. Overkill — GIDE agents are prompt-driven with no custom logic.
- Stay on Python: Works, but slower startup and higher resource usage for no benefit.

**Rationale:** The Go runtime is a drop-in replacement for the Python runtime on Declarative agents. Same CRD shape, same features, faster execution.

### D2: Reduce resource requests to match Go runtime profile

**Decision:** Lower agent pod resource requests from Python-sized defaults to Go-appropriate values. Go ADK uses ~50MB RSS vs ~200MB+ for Python.

**Rationale:** The kind dev cluster is resource-constrained. Smaller requests improve scheduling and leave room for the dashboard and registry pods.

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|:---|:---|:---|
| Go ADK feature gap vs Python | Agent fails on specific MCP or A2A operation | Test all GIDE features before committing; can revert to Python by removing `runtime: go` |
| Go ADK is newer, less battle-tested | Edge case bugs | Pin kagent Helm chart version; report issues upstream |
| SkillsTool behavior differs from Python skill loading | STRIDE skill not found or not readable | Verify skill path and `read_file` on `/skills/stride-threat-model/SKILL.md` |

## Open Questions

1. **Does Go ADK support `a2aConfig.skills` metadata?** The A2A skills metadata is set on the CRD, not the runtime — likely runtime-agnostic, but needs verification.
2. **Does Go ADK handle prompt template `{{include}}` identically?** Template rendering happens in the controller, not the runtime — should be transparent, but worth confirming.
