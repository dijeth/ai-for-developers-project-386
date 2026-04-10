#!/bin/sh
set -e

# Setup SQLite database directory
mkdir -p /app/api/data
chmod 777 /app/api/data

# Start backend in background
echo "Starting backend API on port 3001..."
cd /app/api
node dist/main &
API_PID=$!

# Wait a moment for backend to initialize
echo "Waiting for backend to start..."
sleep 3

# Check if backend is running
if ! kill -0 $API_PID 2>/dev/null; then
    echo "ERROR: Backend failed to start"
    exit 1
fi

echo "Backend started successfully (PID: $API_PID)"

# Setup SQLite database if doesn't exist
if [ ! -f "/app/api/data/prod.db" ]; then
    echo "Initializing SQLite database..."
    mkdir -p /app/api/data
    cd /app/api
    npx prisma db push --accept-data-loss || true
    npm run db:seed 2>/dev/null || true
fi

# Start nginx in foreground
echo "Starting nginx on port 80..."
nginx -g 'daemon off;'
