## 1. Agent CRD Updates

- [x] 1.1 Add `runtime: go` under `spec.declarative` in `deploy/kagent/gide-orchestrator.yaml`
- [x] 1.2 Add `runtime: go` under `spec.declarative` in `deploy/kagent/gide-threat-modeler.yaml`

## 2. Resource Tuning

- [x] 2.1 If agent CRDs include resource requests/limits, reduce memory request to 64Mi and CPU request to 50m for both agents

## 3. Helm Version Pin

- [x] 3.1 Verify `deploy/kind/setup.sh` Helm install uses kagent v0.8+ (Go ADK requires v0.8); add `--version` flag if needed to pin minimum version

## 4. Validation

- [ ] 4.1 Apply both Agent CRDs and verify `Ready: True` status _(manual: requires running cluster)_
- [ ] 4.2 Verify orchestrator can call oras-mcp tools on Go runtime _(manual: requires running cluster)_
- [ ] 4.3 Verify threat modeler loads STRIDE skill via SkillsTool on Go runtime _(manual: requires running cluster)_
- [ ] 4.4 Verify threat modeler calls gemara-mcp and github-mcp tools on Go runtime _(manual: requires running cluster)_
- [ ] 4.5 Verify orchestrator delegates to threat modeler via agent-as-tool on Go runtime _(manual: requires running cluster)_
- [ ] 4.6 Verify end-to-end threat model mission via GIDE dashboard on Go runtime _(manual: requires running cluster)_
