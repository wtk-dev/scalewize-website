#!/bin/bash

# Navigate to the project directory
cd "$(dirname "$0")"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Make sure you're in the correct project directory."
    exit 1
fi

echo "Starting Next.js development server from: $(pwd)"
npm run dev 