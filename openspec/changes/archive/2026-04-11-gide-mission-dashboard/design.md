## Context

GIDE currently uses the kagent built-in dashboard — a generic Next.js chat interface where users select an agent and type free-form prompts. The `gide-bundle-architecture` change established the multi-agent backend (orchestrator + threat modeler) with mission routing, bundle composition, and A2A skills metadata.

The backend now supports structured delegation, but the frontend doesn't leverage it. Users must know prompt syntax to trigger the right workflow. A curated dashboard with mission cards would close this gap.

**Existing infrastructure:**
- kagent controller API at `:8083` with A2A endpoint at `/api/a2a/{namespace}/{agent-name}/`
- kagent built-in UI at `:8080` (Next.js App Router + React 19, server actions)
- `@a2a-js/sdk` v0.3.x — official A2A JavaScript client (HTTP+JSON transport, streaming)
- Orchestrator already has a routing table and template locations

**Constraints:**
- No npm install in CI/deploy — container image must be pre-built or use multi-stage Docker build
- kagent is v0.x alpha — API surfaces may change
- kind cluster is the target environment (no cloud ingress)

## Goals / Non-Goals

**Goals:**
- Mission cards that map 1:1 to orchestrator use cases (Threat Model, Policy Bundle, etc.)
- Structured input collection (repository URL, template selection, registry target) before agent invocation
- Streaming agent responses with artifact extraction and presentation
- `oras push` command rendered and copyable when the orchestrator returns it
- Deployable to the kind cluster alongside kagent

**Non-Goals:**
- Replacing the kagent dashboard — both run concurrently, different purposes
- Agent management (create/edit/delete agents) — use kagent dashboard for that
- Authentication/authorization — dev environment only
- Mobile responsiveness — desktop-first for security engineers
- Dynamic mission discovery from agent A2A skills at runtime (hardcoded missions are sufficient)

## Decisions

### D1: Next.js App Router (standalone app, not a kagent fork)

**Decision:** Build as a standalone Next.js project in `dashboard/` at the repo root.

**Alternatives:**
- Fork/extend kagent UI: Couples us to kagent's internal structure and release cycle. Their UI is generic agent management; ours is mission-specific.
- Vite + React SPA: Lighter, but loses server components for API proxying. Would need a separate API proxy to avoid CORS with the kagent controller.

**Rationale:** Next.js App Router gives us server actions that proxy API calls to the kagent controller (avoids CORS), React Server Components for the mission registry, and aligns with the kagent ecosystem's existing technology choice. Standalone avoids coupling to kagent UI internals.

### D2: Static mission registry as TypeScript config

**Decision:** Missions are defined in a TypeScript file (`dashboard/src/config/missions.ts`) as a typed array. No ConfigMap, no runtime discovery.

**Alternatives:**
- ConfigMap mounted as JSON: Requires restart to update, adds K8s coupling for a static list.
- Discover from A2A skills metadata at runtime: Over-engineered — missions are a product decision, not a runtime concern. The A2A skills metadata describes agent capabilities, not user workflows.

**Rationale:** A TypeScript config is type-checked at build time, trivial to edit, and avoids runtime complexity. Adding a new mission is a code change, which is intentional — it's a product decision that goes through PR review.

### D3: Server actions proxy to kagent controller API

**Decision:** Next.js server actions handle all communication with the kagent controller. The browser never talks directly to `:8083`.

**Alternatives:**
- Direct browser-to-controller: Requires CORS configuration on kagent controller (not configurable) or a separate proxy.
- API route handlers: More boilerplate than server actions for the same result.

**Rationale:** Server actions are the idiomatic Next.js pattern. They run server-side, can reach the controller at its cluster-internal URL (or port-forwarded localhost), and return typed responses to the client. Streaming uses server actions with `ReadableStream`.

### D4: A2A task composition from mission inputs

**Decision:** Each mission definition includes a `composeTask` function that takes structured form inputs and produces an A2A task message string. This string is sent to the orchestrator agent via the A2A endpoint.

**Alternatives:**
- Send structured JSON and have the orchestrator parse it: Requires orchestrator prompt changes to handle JSON payloads.
- Use the kagent REST API instead of A2A: Bypasses the agent communication protocol, loses streaming and A2A task lifecycle.

**Rationale:** The orchestrator already understands natural language delegation messages (from the bundle architecture design). Composing a well-formed natural language message from structured inputs is simpler than adding JSON parsing to the agent. The `composeTask` function is the bridge between UI structure and agent interface.

### D5: Dashboard deployed as container in kind cluster

**Decision:** Multi-stage Dockerfile builds the Next.js app. Deployed as a Deployment + Service in the `kagent` namespace. Port-forwarded for local access.

**Alternatives:**
- Run `npm run dev` locally against port-forwarded controller: Works for development but not reproducible; no container image for sharing.
- Sidecar to kagent-ui: Couples deployment lifecycle unnecessarily.

**Rationale:** Containerized deployment is consistent with the rest of the GIDE stack. The `setup.sh` builds and loads the image into kind. For iterative development, `npm run dev` with `KAGENT_API_URL=http://localhost:8083` works locally.

### D6: Artifact extraction via markdown parsing

**Decision:** When the orchestrator returns artifacts and the `oras push` command, the dashboard parses the response text to extract fenced code blocks with YAML content and the push command. Display artifacts in collapsible panels with syntax highlighting and a copy button for the push command.

**Alternatives:**
- Structured A2A artifact attachments: A2A supports artifacts in task responses, but kagent may not surface them through its proxy layer yet.
- Custom response format: Requires orchestrator changes and is fragile.

**Rationale:** The orchestrator already returns artifacts as labeled fenced code blocks and the push command in a consistent format. Parsing markdown is reliable for this pattern and doesn't require agent changes. Can migrate to structured A2A artifacts when kagent supports them.

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|:---|:---|:---|
| kagent API changes in v0.x | Dashboard breaks on upgrade | Pin to known kagent version in kind setup; abstract API calls behind a client module |
| A2A streaming edge cases | Incomplete artifact display | Graceful degradation — show raw text if parsing fails |
| Next.js adds build complexity | Slower setup.sh, larger image | Multi-stage Docker build minimizes image size; cache layers |
| CORS if server actions don't work as expected | Browser can't reach controller | Fallback: Next.js API route handler as explicit proxy |

## Open Questions

1. **Port assignment**: Which port for the GIDE dashboard? kagent-ui uses 8080/3000. Propose `8084` (controller is `8083`).
2. **Artifact display fidelity**: Should artifacts render as expandable YAML with validation status, or plain code blocks? Validation status requires calling gemara-mcp from the frontend (adds complexity).
3. **Mission input validation**: Should the dashboard validate repository URLs or template existence before sending to the orchestrator? Or let the agent handle errors?
