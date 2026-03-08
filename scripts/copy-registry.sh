#!/bin/bash
# Copy HTML files from registry/ to public/registry/ for iframe serving
rm -rf public/registry
mkdir -p public/registry

for dir in registry/*/; do
  name=$(basename "$dir")
  mkdir -p "public/registry/$name"
  cp "$dir"*.html "public/registry/$name/" 2>/dev/null || true
done

echo "Copied registry HTML files to public/registry/"
