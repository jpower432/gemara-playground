# SPDX-License-Identifier: Apache-2.0

FROM golang:1.24 AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .

RUN go run ./cmd/bundler/
RUN GOOS=js GOARCH=wasm go build -o web/validate.wasm ./cmd/wasm/
RUN cp "$(go env GOROOT)/lib/wasm/wasm_exec.js" web/wasm_exec.js

FROM nginx:1-alpine

COPY --from=builder /app/web /usr/share/nginx/html

EXPOSE 80
