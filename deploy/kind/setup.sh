#!/usr/bin/env bash
# SPDX-License-Identifier: Apache-2.0
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
CLUSTER_NAME="gide"
KAGENT_NAMESPACE="kagent"

VERTEX_PROJECT_ID="${VERTEX_PROJECT_ID:-}"
VERTEX_LOCATION="${VERTEX_LOCATION:-us-east5}"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"
GCP_ADC_PATH="${GCP_ADC_PATH:-${HOME}/.config/gcloud/application_default_credentials.json}"

info()  { echo "==> $*"; }
warn()  { echo "WARNING: $*" >&2; }
fatal() { echo "ERROR: $*" >&2; exit 1; }

detect_container_runtime() {
    if podman info &>/dev/null 2>&1; then
        CONTAINER_RUNTIME="podman"
        export KIND_EXPERIMENTAL_PROVIDER=podman
        info "Detected podman — setting KIND_EXPERIMENTAL_PROVIDER=podman"
    elif docker info &>/dev/null 2>&1; then
        CONTAINER_RUNTIME="docker"
    else
        fatal "No container runtime found. Install docker or podman."
    fi
}

check_prerequisites() {
    local missing=()
    for cmd in kind kubectl helm; do
        command -v "$cmd" &>/dev/null || missing+=("$cmd")
    done
    if [[ ${#missing[@]} -gt 0 ]]; then
        fatal "Missing required tools: ${missing[*]}"
    fi
}

create_cluster() {
    if kind get clusters 2>/dev/null | grep -q "^${CLUSTER_NAME}$"; then
        info "Cluster '${CLUSTER_NAME}' already exists, skipping creation"
        kind export kubeconfig --name "${CLUSTER_NAME}"
        return
    fi
    info "Creating kind cluster '${CLUSTER_NAME}'..."
    kind create cluster --config "${SCRIPT_DIR}/cluster.yaml"
}

fix_coredns_for_podman() {
    if [[ "${CONTAINER_RUNTIME}" != "podman" ]]; then
        return
    fi

    info "Applying CoreDNS fix for podman (explicit upstream nameservers)..."

    # Get the host's real nameservers (outside the container)
    local nameservers
    nameservers=$(grep -oP '(?<=nameserver\s)\S+' /etc/resolv.conf \
        | grep -v '127.0.0' \
        | head -2 \
        | tr '\n' ' ')

    if [[ -z "$nameservers" ]]; then
        nameservers="8.8.8.8 8.8.4.4"
        warn "Could not detect host nameservers, falling back to Google DNS"
    fi

    info "Using upstream nameservers: ${nameservers}"

    # Patch the Corefile in-place via kubectl patch (avoids last-applied-configuration warning)
    local current_corefile
    current_corefile=$(kubectl get configmap coredns -n kube-system \
        -o jsonpath='{.data.Corefile}')

    local patched_corefile
    patched_corefile=$(echo "$current_corefile" \
        | sed "s|forward \. /etc/resolv\.conf|forward . ${nameservers}|g")

    # Use JSON patch to update the single key
    kubectl patch configmap coredns -n kube-system --type merge \
        -p "{\"data\":{\"Corefile\":$(echo "$patched_corefile" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))')}}"

    # Force-delete existing CoreDNS pods so they restart immediately with the new config.
    # A rollout restart hangs when DNS is already broken (graceful shutdown can't complete).
    info "Force-restarting CoreDNS pods..."
    kubectl delete pods -n kube-system -l k8s-app=kube-dns --force --grace-period=0 2>/dev/null || true

    # Wait for new pods to come up
    local retries=0
    while [[ $retries -lt 30 ]]; do
        local ready
        ready=$(kubectl get deployment coredns -n kube-system \
            -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
        if [[ "${ready:-0}" -ge 1 ]]; then
            info "CoreDNS is ready (${ready} replicas)"
            break
        fi
        sleep 2
        retries=$((retries + 1))
    done

    if [[ $retries -ge 30 ]]; then
        warn "CoreDNS did not become ready within 60s — continuing anyway"
    fi

    # Verify DNS works
    info "Verifying cluster DNS..."
    kubectl run gide-dns-test --image=busybox:1.36 --restart=Never \
        --overrides='{"spec":{"terminationGracePeriodSeconds":0}}' \
        -- sleep 30 2>/dev/null || true
    sleep 8

    if kubectl exec gide-dns-test -- nslookup kubernetes.default &>/dev/null; then
        info "DNS is working"
    else
        warn "DNS verification failed — cluster networking may be unreliable"
    fi
    kubectl delete pod gide-dns-test --force --grace-period=0 2>/dev/null || true
}

install_kagent() {
    info "Installing kagent CRDs (v0.8+ required for Go ADK)..."
    helm upgrade --install kagent-crds \
        oci://ghcr.io/kagent-dev/kagent/helm/kagent-crds \
        --namespace "${KAGENT_NAMESPACE}" \
        --create-namespace \
        --version ">=0.8.0" \
        --wait \
        --timeout 3m

    info "Deploying PostgreSQL with emptyDir (bypasses PVC provisioner)..."
    kubectl apply -f "${REPO_ROOT}/deploy/kagent/postgresql-emptydir.yaml"
    kubectl rollout status deployment/kagent-postgresql \
        --namespace "${KAGENT_NAMESPACE}" --timeout=120s

    info "Installing kagent (bundled DB disabled)..."
    helm upgrade --install kagent \
        oci://ghcr.io/kagent-dev/kagent/helm/kagent \
        --namespace "${KAGENT_NAMESPACE}" \
        --set database.postgres.bundled.enabled=false \
        --set "database.postgres.url=postgres://kagent:kagent@kagent-postgresql.kagent.svc.cluster.local:5432/kagent?sslmode=disable" \
        --timeout 10m

    info "Ensuring default-model-config exists (required by kagent controller)..."
    printf 'apiVersion: kagent.dev/v1alpha2\nkind: ModelConfig\nmetadata:\n  name: default-model-config\n  namespace: %s\nspec:\n  provider: AnthropicVertexAI\n  model: claude-sonnet-4@20250514\n  apiKeySecret: gide-gcp-credentials\n  apiKeySecretKey: application_default_credentials.json\n  anthropicVertexAI:\n    projectID: %s\n    location: %s\n' \
        "${KAGENT_NAMESPACE}" "${VERTEX_PROJECT_ID}" "${VERTEX_LOCATION}" \
        | kubectl apply -f -
}

validate_env() {
    if [[ -z "$VERTEX_PROJECT_ID" ]]; then
        fatal "VERTEX_PROJECT_ID is required. Export it before running this script."
    fi
    if [[ ! -f "$GCP_ADC_PATH" ]]; then
        fatal "GCP credentials not found at ${GCP_ADC_PATH}. Run: gcloud auth application-default login"
    fi
}

create_secrets() {
    info "Configuring secrets..."

    kubectl create secret generic gide-gcp-credentials \
        --namespace "${KAGENT_NAMESPACE}" \
        --from-file=application_default_credentials.json="${GCP_ADC_PATH}" \
        --dry-run=client -o yaml | kubectl apply -f -

    if [[ -n "$GITHUB_TOKEN" ]]; then
        kubectl create secret generic gide-github-token \
            --namespace "${KAGENT_NAMESPACE}" \
            --from-literal=GITHUB_PERSONAL_ACCESS_TOKEN="${GITHUB_TOKEN}" \
            --dry-run=client -o yaml | kubectl apply -f -
    else
        warn "GITHUB_TOKEN not set. GitHub MCP Server will use unauthenticated mode with rate limits."
    fi

    if [[ -f "${HOME}/.docker/config.json" ]]; then
        kubectl create secret generic gide-docker-credentials \
            --namespace "${KAGENT_NAMESPACE}" \
            --from-file=config.json="${HOME}/.docker/config.json" \
            --dry-run=client -o yaml | kubectl apply -f -
    else
        warn "No Docker config found. oras-mcp will only access unauthenticated registries."
    fi
}

wait_for_ready() {
    info "Waiting for kagent controller..."
    kubectl rollout status deployment/kagent-controller \
        --namespace "${KAGENT_NAMESPACE}" --timeout=180s 2>/dev/null || true

    info "Checking agent status..."
    kubectl get agents -n "${KAGENT_NAMESPACE}" 2>/dev/null || true
}

print_access() {
    info ""
    info "Cluster ready. Install GIDE:"
    info ""
    info "  make gide-up"
    info ""
    info "After install, access via:"
    info "  kagent UI:         kubectl port-forward -n ${KAGENT_NAMESPACE} svc/kagent-ui 8001:8080"
    info "  kagent API:        kubectl port-forward -n ${KAGENT_NAMESPACE} svc/kagent-controller 8083:8083"
    info "  OCI registry:      kubectl port-forward -n ${KAGENT_NAMESPACE} svc/gide-registry 5000:5000"
    info ""
    info "Tear down: make cluster-down"
}

main() {
    info "Setting up GIDE cluster infrastructure..."
    check_prerequisites
    validate_env
    detect_container_runtime
    create_cluster
    fix_coredns_for_podman
    install_kagent
    create_secrets
    wait_for_ready
    print_access
}

main "$@"
