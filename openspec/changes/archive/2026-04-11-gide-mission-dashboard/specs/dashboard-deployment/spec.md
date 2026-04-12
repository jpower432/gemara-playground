## ADDED Requirements

### Requirement: Multi-stage Dockerfile
The system SHALL include a multi-stage Dockerfile at `dashboard/Dockerfile` that builds the Next.js application and produces a minimal production image.

#### Scenario: Image builds successfully
- **WHEN** `docker build -t gide-dashboard dashboard/` is run
- **THEN** the build completes with a production-ready image under 200MB

#### Scenario: Environment variable injection
- **WHEN** the container is started with `KAGENT_API_URL` set
- **THEN** the Next.js server action uses that URL to reach the kagent controller

### Requirement: Kubernetes deployment manifests
The system SHALL include a Deployment and Service manifest at `deploy/kagent/gide-dashboard.yaml` in the `kagent` namespace.

#### Scenario: Deployment resource
- **WHEN** the manifest is applied
- **THEN** a Deployment named `gide-dashboard` runs with 1 replica, the container image `gide-dashboard:local`, port 3000, and `KAGENT_API_URL` set to the cluster-internal controller service URL

#### Scenario: Service resource
- **WHEN** the manifest is applied
- **THEN** a Service named `gide-dashboard` exposes port 8084 targeting container port 3000

### Requirement: Kind cluster integration
The `deploy/kind/setup.sh` script SHALL build the dashboard container image and load it into the kind cluster during setup.

#### Scenario: Image built and loaded
- **WHEN** `setup.sh` runs
- **THEN** it executes `docker build -t gide-dashboard:local dashboard/` and `kind load docker-image gide-dashboard:local --name gide`

#### Scenario: Dashboard manifest applied
- **WHEN** `setup.sh` applies kagent manifests
- **THEN** `deploy/kagent/gide-dashboard.yaml` is included in the apply loop

### Requirement: Port-forward access instructions
The `setup.sh` output SHALL include the port-forward command for the dashboard.

#### Scenario: Access instructions displayed
- **WHEN** setup completes
- **THEN** the output includes `kubectl port-forward -n kagent svc/gide-dashboard 8084:8084`

### Requirement: Makefile targets
The Makefile SHALL include targets for dashboard development and deployment.

#### Scenario: Dev target
- **WHEN** `make dashboard-dev` is run
- **THEN** it starts the Next.js dev server with `KAGENT_API_URL=http://localhost:8083`

#### Scenario: Build target
- **WHEN** `make dashboard-build` is run
- **THEN** it builds the container image tagged `gide-dashboard:local`
