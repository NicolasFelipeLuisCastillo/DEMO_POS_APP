#!/bin/bash
# Compila el .deb usando Docker.
# Equivalente a: docker compose run --rm build
# Deja el .deb en ./release/

set -e
cd "$(dirname "$0")/.."

echo "▶ Construyendo imagen (solo la primera vez tarda)…"
docker compose build

echo "▶ Compilando .deb…"
docker compose run --rm build

echo ""
echo "✅ El .deb quedó en ./release/"
ls -lh release/
