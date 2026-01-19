#!/bin/bash

echo "🚀 Setting up EGas Admin Dashboard in GitHub Codespaces..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the admin-dashboard directory"
    echo "   cd egasApp2-main/admin-dashboard"
    exit 1
fi

# Check Node.js version
echo "📋 Checking Node.js version..."
NODE_VERSION=$(node --version)
echo "✅ Node.js version: $NODE_VERSION"

# Check Firebase CLI
echo "📋 Checking Firebase CLI..."
if command -v firebase &> /dev/null; then
    FIREBASE_VERSION=$(firebase --version)
    echo "✅ Firebase CLI version: $FIREBASE_VERSION"
else
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Create environment file template
echo "📝 Creating environment file template..."
cat > .env.production.template << EOF
# Copy this to .env.production and update with your actual values
VITE_API_URL=https://your-vps-ip-or-domain.com/api
VITE_APP_NAME=EGas Admin Dashboard
EOF

echo "✅ Environment template created: .env.production.template"

# Test build
echo "🔨 Testing build..."
if npm run build; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please check for errors."
    exit 1
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Create your environment file:"
echo "   cp .env.production.template .env.production"
echo "   # Edit .env.production with your actual API URL"
echo ""
echo "2. Start development server:"
echo "   npm run dev"
echo ""
echo "3. Login to Firebase:"
echo "   firebase login"
echo ""
echo "4. Deploy to Firebase:"
echo "   npm run build"
echo "   firebase deploy --only hosting"
echo ""
echo "📚 For more information, see:"
echo "   - CODESPACES_GUIDE.md"
echo "   - FIREBASE_DEPLOYMENT.md"
echo "   - DEPLOYMENT_CHECKLIST.md" 