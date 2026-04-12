## 1. Project Scaffolding

- [x] 1.1 Create `dashboard/` directory with Next.js App Router project structure (no npm install — create `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx` manually)
- [x] 1.2 Create `dashboard/Dockerfile` with multi-stage build (node:22-alpine builder → runner)
- [x] 1.3 Create `dashboard/.env.local.example` with `KAGENT_API_URL=http://localhost:8083`

## 2. Mission Registry

- [x] 2.1 Create `dashboard/src/config/missions.ts` with `Mission` type definition and `MissionInput` type
- [x] 2.2 Define the `threat-model` mission with inputs (repository text, template select), expected artifacts, and `composeTask` function
- [x] 2.3 Define a disabled `policy-bundle` mission placeholder (`disabled: true`)
- [x] 2.4 Export the `MISSIONS` array and verify type-checking catches missing fields

## 3. A2A Streaming Client

- [x] 3.1 Create `dashboard/src/lib/kagent-client.ts` with `KAGENT_API_URL` from environment variable (default `http://localhost:8083`)
- [x] 3.2 Implement `sendTask(agentName: string, message: string)` function that constructs an A2A `tasks/send` JSON-RPC payload and sends it to the kagent controller endpoint
- [x] 3.3 Implement streaming response handling that returns a `ReadableStream` of text chunks
- [x] 3.4 Create `dashboard/src/app/actions/mission.ts` server action wrapping `sendTask` for use by client components

## 4. Dashboard UI — Mission Cards

- [x] 4.1 Create `dashboard/src/components/MissionCard.tsx` — card component displaying title, description, icon, and "Coming Soon" badge for disabled missions
- [x] 4.2 Create `dashboard/src/app/page.tsx` — home page rendering a grid of MissionCards from the `MISSIONS` array
- [x] 4.3 Style the card grid with CSS modules or Tailwind (responsive grid, hover states, muted disabled cards)

## 5. Dashboard UI — Mission Form

- [x] 5.1 Create `dashboard/src/components/MissionForm.tsx` — dynamic form rendering from mission `inputs` array (text inputs, select dropdowns)
- [x] 5.2 Add required field validation (prevent submission with empty required fields)
- [x] 5.3 Create `dashboard/src/app/mission/[id]/page.tsx` — mission detail page that loads the mission by `id` and renders the form
- [x] 5.4 Wire "Start Mission" button to call `composeTask` → server action → stream view transition

## 6. Dashboard UI — Response Streaming and Artifact Display

- [x] 6.1 Create `dashboard/src/components/StreamingResponse.tsx` — component that reads from the `ReadableStream` and appends chunks with markdown rendering
- [x] 6.2 Create `dashboard/src/components/ArtifactPanel.tsx` — collapsible panel with syntax-highlighted YAML and "Copy YAML" button
- [x] 6.3 Create `dashboard/src/components/PushCommandPanel.tsx` — highlighted command block with "Copy Command" button
- [x] 6.4 Create `dashboard/src/lib/artifact-parser.ts` — extract labeled YAML fenced blocks and `oras push` commands from response text
- [x] 6.5 Wire artifact extraction into `StreamingResponse` — parse on stream completion, render `ArtifactPanel` and `PushCommandPanel`
- [x] 6.6 Add graceful degradation — display raw response text when parsing fails

## 7. Deployment

- [x] 7.1 Create `deploy/kagent/gide-dashboard.yaml` with Deployment (1 replica, port 3000, `KAGENT_API_URL` env) and Service (port 8084 → 3000)
- [x] 7.2 Update `deploy/kind/setup.sh` to build and load the dashboard image into kind (`docker build`, `kind load docker-image`)
- [x] 7.3 Update `deploy/kind/setup.sh` `print_access` function to include dashboard port-forward command
- [x] 7.4 Add `dashboard-dev` and `dashboard-build` targets to Makefile

## 8. Orchestrator Compatibility

- [x] 8.1 Update `agents/gide-orchestrator.md` to note that structured mission messages from the dashboard follow the same delegation format
- [ ] 8.2 Verify orchestrator handles `composeTask` output format without prompt changes _(manual: requires running cluster)_

## 9. Validation

- [ ] 9.1 Verify dashboard image builds successfully under 200MB _(manual: requires Docker)_
- [ ] 9.2 Verify mission card grid renders and disabled card shows "Coming Soon" _(manual: requires running dashboard)_
- [ ] 9.3 Verify form submission streams orchestrator response _(manual: requires running cluster)_
- [ ] 9.4 Verify artifact panels render with copy buttons after mission completion _(manual: requires running cluster)_
