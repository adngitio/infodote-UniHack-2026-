#!/bin/bash

echo "Starting Infodote setup..."

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed but node is. This is unusual. Please ensure npm is available."
    exit 1
fi

# Install pnpm globally if it doesn't exist
if ! command -v pnpm &> /dev/null; then
    echo "📦 pnpm is not installed. Installing it globally via npm..."
    npm install -g pnpm
else
    echo "✅ pnpm is already installed."
fi

# Navigate to frontend and install dependencies
if [ -d "frontend" ]; then
    echo "📂 Entering frontend directory..."
    cd frontend
    echo "⚡ Installing dependencies using pnpm..."
    pnpm install
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "To start the development server, run:"
    echo "  cd frontend && pnpm dev"
else
    echo "❌ The 'frontend' directory was not found. Are you running this script from the project root?"
    exit 1
fi
