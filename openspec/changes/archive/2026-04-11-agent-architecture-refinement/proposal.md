## Why

Agent systemMessages duplicate domain knowledge that gemara-mcp already owns (schemas, wizard prompts, lexicon, validation). The orchestrator prompt lacks the Gemara layer import graph needed for multi-step mission planning. The static HTML launcher is unnecessary overhead now that kagent's built-in UI handles agent interaction directly. Agent design docs (`agents/*.md`) have drifted from deployed CRDs with references to non-existent tools.

## What Changes

- Rewrite threat modeler systemMessage as a thin task workflow (gather context → invoke gemara-mcp prompts → author → validate → return). Remove embedded domain knowledge.
- Add Gemara layer import graph and three-phase model (criteria/subject/measurement) to orchestrator prompt. Enable multi-step mission planning.
- Remove static HTML launcher: Helm templates (`launcher-configmap.yaml`, `dashboard-deployment.yaml`, `dashboard-service.yaml`), `launcher/` directory, `charts/gide/launcher/`, and `values.yaml` launcher section.
- Update `agents/*.md` to match deployed tool names (`validate_gemara_artifact`, `migrate_gemara_artifact`) and reflect D9 task-oriented architecture.

## Capabilities

### New Capabilities

- `orchestrator-mission-planning`: Layer import graph and execution DAG logic in orchestrator prompt for multi-step missions

### Modified Capabilities

- `gide-orchestrator-agent`: Orchestrator prompt gains layer dependency knowledge and three-phase model context
- `gide-threat-modeler-agent`: SystemMessage rewritten from domain-expert to task-orchestrator pattern per D9
- `mcp-server-deployments`: No spec changes — launcher removal is Helm chart cleanup only

## Impact

- **Helm chart**: 3 templates removed (launcher), `values.yaml` launcher section removed, Makefile `launcher-dev` target removed
- **Agent prompts**: Orchestrator ConfigMap updated, threat modeler CRD systemMessage updated
- **Docs**: `agents/gide-orchestrator.md` and `agents/gide-threat-modeler.md` rewritten
- **Port-forwarding**: Launcher port 8084 no longer referenced in `setup.sh` or `NOTES.txt`
