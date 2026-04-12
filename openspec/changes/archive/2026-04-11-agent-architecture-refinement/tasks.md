## 1. Remove Launcher

- [x] 1.1 Delete `charts/gide/templates/launcher-configmap.yaml`
- [x] 1.2 Delete `charts/gide/templates/dashboard-deployment.yaml`
- [x] 1.3 Delete `charts/gide/templates/dashboard-service.yaml`
- [x] 1.4 Delete `charts/gide/launcher/index.html` and `launcher/index.html`
- [x] 1.5 Remove `launcher` section from `charts/gide/values.yaml`
- [x] 1.6 Remove `launcher-dev` target from `Makefile`
- [x] 1.7 Remove launcher port-forward line from `deploy/kind/setup.sh` print_access
- [x] 1.8 Remove launcher access line from `charts/gide/templates/NOTES.txt`

## 2. Update Orchestrator Prompt

- [x] 2.1 Add layer import graph table to `charts/gide/templates/prompts-configmap.yaml` orchestrator-prompt
- [x] 2.2 Add three-phase model (criteria/subject/measurement) and GIDE scope statement
- [x] 2.3 Add out-of-scope response guidance for L5-L7 requests
- [x] 2.4 Update `agents/gide-orchestrator.md` to match new prompt content

## 3. Rewrite Threat Modeler SystemMessage

- [x] 3.1 Replace domain-heavy systemMessage in `charts/gide/templates/agent-threat-modeler.yaml` with task-workflow pattern
- [x] 3.2 Reference gemara-mcp wizard prompts (`threat_assessment`, `control_catalog`) by name in workflow steps
- [x] 3.3 Remove embedded artifact structure, schema rules, and detailed STRIDE methodology
- [x] 3.4 Update `agents/gide-threat-modeler.md` to match new CRD: correct tool names (`validate_gemara_artifact`, `migrate_gemara_artifact`), task-orchestrator framing

## 4. Deploy and Verify

- [x] 4.1 Run `helm upgrade gide ./charts/gide --namespace kagent --reuse-values` and confirm launcher pods are terminated
- [x] 4.2 Verify orchestrator pod restarts with updated ConfigMap and logs show clean initialization
- [x] 4.3 Verify threat modeler pod restarts with updated systemMessage and logs show clean initialization
- [x] 4.4 Submit a threat modeling prompt and confirm end-to-end delegation succeeds
