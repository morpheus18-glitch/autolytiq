#!/bin/bash

# Markdown Documentation Audit Script
# Generates a summary of each .md file with first 5 lines and size

echo "# Markdown Documentation Audit"
echo "Generated: $(date)"
echo ""

find /root/autolytiq -name "*.md" -type f \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/.next/*" \
  -not -path "*/build/*" \
  | sort | while read file; do

    # Get file size
    size=$(wc -l < "$file" 2>/dev/null || echo "0")

    # Get relative path
    relpath="${file#/root/autolytiq/}"

    # Get first 10 non-empty lines (skip empty lines)
    preview=$(grep -v "^$" "$file" 2>/dev/null | head -15 | sed 's/^/    /')

    echo "## File: $relpath"
    echo "**Lines**: $size"
    echo ""
    echo "**Preview**:"
    echo "$preview"
    echo ""
    echo "---"
    echo ""
done
