## 1. STRIDE Kagent Skill

- [x] 1.1 Create `skills/stride-threat-model/` directory
- [x] 1.2 Write `skills/stride-threat-model/SKILL.md` with YAML frontmatter (name, description) and full STRIDE methodology: six categories with ID prefixes, capability-to-threat analysis guidance, and Gemara ThreatCatalog group mapping instructions
- [x] 1.3 Verify SKILL.md frontmatter is valid kagent skill format (matches kagent skill examples)

## 2. Orchestrator Agent Redesign

- [x] 2.1 Rewrite `agents/gide-orchestrator.md` system prompt: add bundle composition table (use case → artifact types → media types), use-case routing table, template location mapping, and remove specialist-level detail
- [x] 2.2 Rewrite `deploy/kagent/gide-orchestrator.yaml` Agent CRD: add oras-mcp tool reference, add `promptTemplate` with `{{include "builtin/a2a-communication"}}` and `{{include "builtin/tool-usage-best-practices"}}`, keep agent-as-tool reference to `gide-threat-modeler`
- [x] 2.3 Verify orchestrator CRD includes oras-mcp tools: `list_repositories`, `list_tags`, `list_referrers`, `fetch_manifest`, `parse_reference`

## 3. Threat Modeler Agent Redesign

- [x] 3.1 Rewrite `agents/gide-threat-modeler.md` system prompt: remove STRIDE methodology (now in skill), remove OCI/oras references, add template-aware workflow (pull templates via github-mcp), add wizard prompt selection guidance (threat_assessment + control_catalog)
- [x] 3.2 Rewrite `deploy/kagent/gide-threat-modeler.yaml` Agent CRD: remove oras-mcp tool reference, add `skills.gitRefs` for stride-threat-model skill, add `a2aConfig.skills` metadata for threat-assessment and control-authoring capabilities
- [x] 3.3 Verify threat modeler CRD does NOT include any oras-mcp tool references
- [x] 3.4 Verify threat modeler CRD retains gemara-mcp tools: `author_gemara`, `validate_gemara`, `repair_gemara`, `convert_to_gemara`
- [x] 3.5 Verify threat modeler CRD retains github-mcp tools: `get_file_contents`, `search_code`, `search_repositories`

## 4. Template Artifacts

- [x] 4.1 Create `templates/` directory in repo root for pre-packaged use case templates
- [x] 4.2 Create `templates/k8s-admission-controller/` with starter ThreatCatalog and CapabilityCatalog YAML derived from existing `deploy/registry/samples/`
- [x] 4.3 Validate template artifacts against Gemara CUE schemas using gemara-mcp `validate_gemara`

## 5. MCP Server Tool Reallocation

- [x] 5.1 Update `deploy/kagent/gide-orchestrator.yaml` to include oras-mcp McpServer tool reference with `toolNames` whitelist
- [x] 5.2 Update `deploy/kagent/gide-threat-modeler.yaml` to remove oras-mcp McpServer tool reference
- [x] 5.3 Verify setup.sh applies manifests in correct order (MCP servers before agents)

## 6. Prompt Templates

- [x] 6.1 Create `deploy/kagent/gide-prompts-configmap.yaml` with GIDE-specific reusable prompt fragments (bundle composition table, Gemara layer model summary) if system prompt exceeds ~500 tokens of bundle knowledge
- [x] 6.2 Update orchestrator CRD `promptTemplate.dataSources` to reference both `kagent-builtin-prompts` and GIDE-specific ConfigMap

## 7. Validation

- [ ] 7.1 Verify orchestrator Agent CRD applies cleanly to cluster and reaches Ready state _(manual: requires running cluster)_
- [ ] 7.2 Verify threat modeler Agent CRD applies cleanly with skill git ref and A2A config _(manual: requires running cluster)_
- [ ] 7.3 Verify orchestrator delegates to threat modeler with template and repo references via kagent dashboard _(manual: requires running cluster)_
- [ ] 7.4 Verify threat modeler pulls template artifacts via github-mcp and applies STRIDE skill _(manual: requires running cluster)_
- [ ] 7.5 Verify orchestrator receives artifacts and produces correct multi-layer `oras push` command with per-artifact media types _(manual: requires running cluster)_
