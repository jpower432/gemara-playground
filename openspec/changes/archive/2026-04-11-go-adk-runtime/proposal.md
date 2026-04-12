## Why

GIDE agents currently use the default Python ADK runtime (AutoGen-based). kagent v0.8 introduced a Go ADK runtime with ~2s startup (vs ~15s Python) and lower resource consumption. Switching to `runtime: go` reduces pod startup latency during scaling and cold starts, lowers memory footprint in the kind dev environment, and aligns with the org's Go-first infrastructure stack.

## What Changes

- Add `runtime: go` to both Agent CRDs (`gide-orchestrator`, `gide-threat-modeler`)
- Verify Go ADK compatibility with: MCP tool execution, git-based skills (SkillsTool), prompt templates, A2A agent-as-tool delegation, and A2A skills metadata
- Update resource requests/limits on agent Deployments to reflect Go runtime's lower baseline
- Update `setup.sh` to ensure the kagent Helm install uses a version that includes Go ADK (v0.8+)

## Capabilities

### New Capabilities
- `go-adk-agents`: Configuration and validation of Go ADK runtime for GIDE Declarative agents

### Modified Capabilities
- `gide-orchestrator-agent`: Agent CRD adds `runtime: go` field
- `gide-threat-modeler-agent`: Agent CRD adds `runtime: go` field, verify git skill loading via SkillsTool

## Impact

- **Agent CRDs**: Two-line change per agent (`runtime: go` under `declarative`)
- **Runtime behavior**: Go ADK includes built-in tools (`SkillsTool`, `BashTool`, `ReadFile`, `WriteFile`, `EditFile`) — these supplement MCP tools, not replace them
- **Compatibility risk**: Go ADK is newer than Python ADK — feature parity gaps may exist for edge cases (memory, context compaction). Neither is used by GIDE currently.
- **No dashboard changes**: A2A protocol is runtime-agnostic
- **No prompt changes**: System messages, prompt templates, and ConfigMaps are runtime-agnostic
