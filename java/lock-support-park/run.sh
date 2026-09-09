#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "Compiling..."
javac src/main/java/LockSupportParkDemo.java -d .

echo "Running demo..."
echo ""
java -cp . LockSupportParkDemo
