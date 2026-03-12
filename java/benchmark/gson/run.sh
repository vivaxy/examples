#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

GSON_JAR="gson-2.10.1.jar"
GSON_URL="https://repo1.maven.org/maven2/com/google/code/gson/gson/2.10.1/gson-2.10.1.jar"

# Download Gson JAR if not present
if [ ! -f "$GSON_JAR" ]; then
  echo "Downloading $GSON_JAR ..."
  curl -sL "$GSON_URL" -o "$GSON_JAR"
  echo "Downloaded."
fi

# Compile
echo "Compiling..."
javac -cp "$GSON_JAR" src/main/java/GsonBenchmark.java -d .

# Run
echo "Running benchmark..."
echo ""
java -cp ".:$GSON_JAR" GsonBenchmark
