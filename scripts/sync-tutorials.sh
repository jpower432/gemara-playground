#!/usr/bin/env bash
# SPDX-License-Identifier: Apache-2.0
#
# Re-vendor tutorial YAML files from upstream Gemara docs.

set -euo pipefail

BASE_URL="https://gemara.openssf.org/tutorials"
DEST="web/tutorials"

declare -A TUTORIALS=(
  ["control-catalog.yaml"]="controls/control-catalog.yaml"
  ["guidance-catalog.yaml"]="guidance/guidance-example.yaml"
  ["policy.yaml"]="policy/policy-example.yaml"
  ["risk-catalog.yaml"]="policy/risk-catalog-example.yaml"
)

echo "Syncing tutorial YAML files from ${BASE_URL}..."

for local_name in "${!TUTORIALS[@]}"; do
  remote_path="${TUTORIALS[$local_name]}"
  url="${BASE_URL}/${remote_path}"
  echo "  ${url} -> ${DEST}/${local_name}"
  curl -fsSL "${url}" -o "${DEST}/${local_name}"
done

echo "Done. Review changes with: git diff web/tutorials/"
