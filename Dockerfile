# SPDX-License-Identifier: Apache-2.0

FROM golang:1.24 AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .

RUN go run ./cmd/bundler/ \
    && GOOS=js GOARCH=wasm go build -o web/validate.wasm ./cmd/wasm/ \
    && cp "$(go env GOROOT)/lib/wasm/wasm_exec.js" web/wasm_exec.js \
    && sha256sum web/validate.wasm | awk '{print $1}' > web/validate.wasm.sha256

FROM nginx:1-alpine

COPY --from=builder /app/web /usr/share/nginx/html

EXPOSE 80
