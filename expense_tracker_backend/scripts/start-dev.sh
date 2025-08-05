#!/bin/bash

# Development startup script
echo "🚀 Starting Expense Tracker Backend in Development Mode..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your configuration."
fi

# Create data directory if it doesn't exist
mkdir -p data

# Check if required environment variables are set
if [ -z "$JWT_SECRET" ]; then
    echo "⚠️  JWT_SECRET not set in .env file. Using default for development."
fi

# Start the development server
echo "🔧 Starting development server with auto-reload..."
npm run dev
