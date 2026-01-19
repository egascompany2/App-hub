#!/bin/bash

echo "🚀 Deploying Admin Dashboard to Firebase..."

# Build the project
echo "📦 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build completed successfully!"

# Deploy to Firebase
echo "🌐 Deploying to Firebase..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo "🎉 Deployment completed successfully!"
    echo "🌍 Your admin dashboard is now live!"
else
    echo "❌ Deployment failed!"
    exit 1
fi 