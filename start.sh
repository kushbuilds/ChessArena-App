#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_DIR="$ROOT_DIR/backend"

echo "=== ChessArena Local Deployment ==="

# 1. Build frontend
echo ""
echo "[1/3] Building frontend..."
cd "$FRONTEND_DIR"
npm install
npm run build
echo "✓ Frontend built → backend/src/main/resources/static/"

# 2. Package backend
echo ""
echo "[2/3] Packaging backend..."
cd "$BACKEND_DIR"
./mvnw package -DskipTests -q
echo "✓ Backend packaged"

# 3. Run
echo ""
echo "[3/3] Starting ChessArena on http://localhost:8080"
echo ""
java -jar "$BACKEND_DIR/target/chess-arena-1.0.0.jar"
