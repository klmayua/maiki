#!/bin/bash

# Maiki Startup Script
echo "🚀 Starting Maiki Development Environment..."

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Creating .env file from template..."
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env - please update with your configuration"
fi

# Create necessary directories
mkdir -p backend/uploads
mkdir -p backend/logs
mkdir -p frontend/web/.next

# Start Docker services
echo "🐳 Starting Docker containers..."
docker-compose up -d postgres redis

# Wait for database
echo "⏳ Waiting for database..."
sleep 5

# Run migrations
echo "📊 Running database migrations..."
cd backend
alembic upgrade head

# Seed initial data (optional)
# python scripts/seed_data.py

cd ..

# Install frontend dependencies if needed
if [ ! -d "frontend/web/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend/web
    npm install
    cd ../..
fi

echo ""
echo "✅ Maiki is ready!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔌 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "🗄️  Database: postgresql://postgres:postgres@localhost:5432/maiki"
echo "⚡ Redis: redis://localhost:6379"
echo ""
echo "📝 To start development:"
echo "   Terminal 1: make dev"
echo ""
