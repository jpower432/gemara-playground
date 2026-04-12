## Why

The kagent built-in dashboard provides a generic chat interface — users must know which agent to select and type free-form prompts to initiate workflows. GIDE's target audience (security teams running compliance assessments) needs a curated UX where pre-defined "missions" (Threat Model, Policy Bundle, etc.) are presented as actionable cards with structured inputs. This reduces time-to-first-artifact and eliminates prompt engineering from the user's workflow.

## What Changes

- Add a custom React dashboard deployed alongside kagent in the kind cluster
- Define a static mission registry mapping use cases to agent endpoints, required inputs, and expected artifact types
- Mission cards collect structured inputs (target repository, template selection, OCI registry) before composing an A2A task message to the orchestrator
- Stream agent responses via the kagent A2A endpoint with real-time artifact progress
- Present completed artifacts with the assembled `oras push` command ready to copy
- Dashboard is a standalone deployment (not a fork of the kagent dashboard)

## Capabilities

### New Capabilities
- `mission-registry`: Static mission definitions (id, title, inputs, expected artifacts, target agent) that drive the card UI and A2A task composition
- `mission-dashboard-ui`: React dashboard with mission cards, structured input forms, streaming agent responses, and artifact presentation
- `a2a-streaming-client`: Frontend A2A client that sends tasks to the kagent controller endpoint and streams responses with tool-call visualization
- `dashboard-deployment`: Kubernetes manifests and kind cluster integration for the dashboard container

### Modified Capabilities
- `gide-orchestrator-agent`: Orchestrator system prompt may need adjustments to handle structured mission payloads from the dashboard (vs. free-form chat)

## Impact

- **New dependency**: React 19 + Next.js App Router (or Vite — design decision pending)
- **New deployment**: Dashboard container + Service + Ingress in the kind cluster
- **Existing**: kagent controller A2A endpoint is consumed (read-only, no changes to kagent)
- **setup.sh**: Needs to build and deploy the dashboard container
- **Makefile**: Needs dashboard build/dev targets
