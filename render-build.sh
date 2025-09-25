#!/usr/bin/env bash
set -euo pipefail

# Install dependencies (Render may already run npm install, but this is safe)
if [ ! -d node_modules ]; then
  npm install
fi

npm run build
node index.js
