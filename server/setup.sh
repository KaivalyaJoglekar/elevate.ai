#!/bin/bash

echo "Setting up Elevate AI Backend..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit server/.env and add your GEMINI_API_KEY!"
else
    echo ".env file already exists"
fi

echo "✅ Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit server/.env and add your GEMINI_API_KEY"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Or run 'npm start' to start the production server"
