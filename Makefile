# SPDX-License-Identifier: Apache-2.0

PORT ?= 8080

.PHONY: dev test lint sync-tutorials sync-schemas build-wasm build-static clean

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

build-static: sync-schemas build-wasm
	@echo "Static site assembled in web/"

clean:
	rm -rf bin/ web/validate.wasm web/wasm_exec.js web/versions.json web/schemas/
