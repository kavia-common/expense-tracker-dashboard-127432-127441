#!/bin/bash

# Production startup script
echo "🚀 Starting Expense Tracker Backend in Production Mode..."

# Ensure .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it with production configuration."
    exit 1
fi

# Check critical environment variables
if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET is required in production. Please set it in .env file."
    exit 1
fi

if [ -z "$MAGIC_LINK_SECRET" ]; then
    echo "❌ MAGIC_LINK_SECRET is required in production. Please set it in .env file."
    exit 1
fi

# Create data directory if it doesn't exist
mkdir -p data

# Set production environment
export NODE_ENV=production

# Start the production server
echo "🌟 Starting production server..."
npm start
