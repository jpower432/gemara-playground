# SPDX-License-Identifier: Apache-2.0

PORT ?= 8080

.PHONY: dev test lint sync-tutorials sync-schemas build-wasm build-static clean cluster-up cluster-down gide-up gide-down gide-template dashboard-dev dashboard-build

dev: build-static
	python3 -m http.server $(PORT) --directory web

test:
	go test -v -race -cover ./...

lint:
	golangci-lint run ./...

sync-tutorials:
	@echo "Syncing tutorial YAML files from upstream Gemara docs..."
	@./scripts/sync-tutorials.sh

sync-schemas:
	@echo "Fetching Gemara schemas from CUE registry..."
	go run ./cmd/bundler/

build-wasm:
	@echo "Building WASM validation binary..."
	GOOS=js GOARCH=wasm go build -o web/validate.wasm ./cmd/wasm/
	cp "$$(go env GOROOT)/lib/wasm/wasm_exec.js" web/wasm_exec.js
	sha256sum web/validate.wasm | awk '{print $$1}' > web/validate.wasm.sha256

build-static: sync-schemas build-wasm
	@echo "Static site assembled in web/"

clean:
	rm -rf bin/ web/validate.wasm web/validate.wasm.sha256 web/wasm_exec.js web/versions.json web/schemas/

cluster-up:
	@./deploy/kind/setup.sh

cluster-down:
	kind delete cluster --name gide

gide-up:
	helm upgrade --install gide ./charts/gide \
		--namespace kagent \
		--set "modelConfig.vertexAI.projectID=$${VERTEX_PROJECT_ID}" \
		--set "modelConfig.vertexAI.location=$${VERTEX_LOCATION:-us-east5}" \
		--timeout 5m
	@echo "Chart installed. Watch resources: kubectl get pods -n kagent -w"

gide-down:
	helm uninstall gide --namespace kagent

gide-template:
	helm template gide ./charts/gide \
		--namespace kagent \
		--set "modelConfig.vertexAI.projectID=example-project"

dashboard-dev:
	cd dashboard && KAGENT_API_URL=http://localhost:8083 npm run dev

dashboard-build:
	docker build -t gide-dashboard:local dashboard/
