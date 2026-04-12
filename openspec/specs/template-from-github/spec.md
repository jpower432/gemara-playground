## ADDED Requirements

### Requirement: Templates are Gemara artifacts in GitHub repos
Pre-packaged use case templates SHALL be valid Gemara YAML files stored in a GitHub repository, organized by use case directory.

#### Scenario: Template directory structure
- **WHEN** a template repo path is inspected (e.g., `templates/k8s-admission-controller/`)
- **THEN** it contains one or more Gemara YAML files (e.g., `threat-catalog.yaml`, `capability-catalog.yaml`) that validate against Gemara CUE schemas

### Requirement: Specialist pulls templates via github-mcp
The specialist agent SHALL use github-mcp `get_file_contents` to pull template artifacts from the GitHub repo path provided in the orchestrator's delegation message.

#### Scenario: Template pull into context
- **WHEN** the specialist receives a delegation with `Template artifacts: github.com/org/repo/templates/k8s-ac/`
- **THEN** the specialist uses `get_file_contents` to fetch the template YAML files into its context window

#### Scenario: Template repo not accessible
- **WHEN** the specialist cannot access the template repo (auth failure, repo not found)
- **THEN** the specialist proceeds without template context and notes that no template was available

### Requirement: Templates inform but do not constrain authoring
Templates SHALL serve as starting context for the specialist's analysis, not as rigid scaffolding. The specialist MAY extend, modify, or diverge from the template based on the target repo's actual architecture.

#### Scenario: Template extended with repo-specific threats
- **WHEN** the specialist analyzes a repo and finds threats not covered in the template
- **THEN** the specialist adds those threats to the authored artifact alongside template-derived content

#### Scenario: Template threat not applicable
- **WHEN** the specialist determines a template threat does not apply to the target repo
- **THEN** the specialist omits that threat from the authored artifact

### Requirement: Orchestrator knows template locations
The orchestrator's system prompt or prompt template SHALL contain a mapping of use case names to GitHub repo paths for available templates.

#### Scenario: Known use case
- **WHEN** the user requests threat modeling for a Kubernetes admission controller
- **THEN** the orchestrator includes the template path for the `k8s-admission-controller` use case in the delegation message

#### Scenario: Use case without template
- **WHEN** no template exists for the requested use case
- **THEN** the orchestrator delegates without a template reference
