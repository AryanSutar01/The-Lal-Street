#!/bin/bash

# The Lal Street - Quick Deploy Script
echo "🚀 Deploying The Lal Street to Vercel..."
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🌐 Deploying to Vercel..."
    vercel --prod
else
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

