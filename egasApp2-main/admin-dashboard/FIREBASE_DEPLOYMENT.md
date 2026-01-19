# Firebase Deployment Guide - Admin Dashboard

## Overview

This guide will help you deploy the EGas Admin Dashboard to Firebase Hosting.

## Prerequisites

1. **Node.js**: Version 20.0.0 or higher (for Firebase CLI compatibility)
2. **Firebase Account**: Google account with Firebase access
3. **Firebase Project**: `egasadmin` project should be created

## Quick Deployment

### Option 1: Using the Deployment Script

```bash
# Make sure you're in the admin-dashboard directory
cd egasApp2-main/admin-dashboard

# Run the deployment script
./deploy.sh
```

### Option 2: Manual Deployment

```bash
# 1. Install dependencies
npm install

# 2. Build the project
npm run build

# 3. Deploy to Firebase
firebase deploy --only hosting
```

## Firebase Setup (First Time Only)

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase (if not already done)

```bash
firebase init hosting
```

Select the following options:
- Use an existing project: `egasadmin`
- Public directory: `dist`
- Configure as single-page app: `Yes`
- Set up automatic builds: `No`

## Configuration Files

### firebase.json
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### .firebaserc
```json
{
  "projects": {
    "default": "egasadmin"
  }
}
```

## Build Process

The build process includes:

1. **TypeScript Compilation**: `tsc -b`
2. **Vite Build**: `vite build`
3. **Output**: Files generated in `dist/` directory

## Deployment Commands

### Deploy Everything
```bash
firebase deploy
```

### Deploy Only Hosting
```bash
firebase deploy --only hosting
```

### Deploy with Preview
```bash
firebase deploy --only hosting --project egasadmin
```

## Environment Configuration

### API Base URL

Make sure your API base URL is correctly configured in the admin dashboard. Check the following files:

- `src/services/api.ts`
- `src/config/index.ts`

The API should point to your backend server (VPS or other hosting).

### Environment Variables

If you need environment variables, create a `.env` file:

```env
VITE_API_BASE_URL=https://your-backend-url.com/api
VITE_APP_NAME=EGas Admin Dashboard
```

## Troubleshooting

### Node.js Version Issues

If you encounter Node.js version errors:

```bash
# Check your Node.js version
node --version

# If below 20.0.0, upgrade Node.js
# Using nvm (Node Version Manager)
nvm install 20
nvm use 20

# Or download from nodejs.org
```

### Build Errors

Common build errors and solutions:

1. **TypeScript Errors**: Fix type errors before building
2. **Missing Dependencies**: Run `npm install`
3. **Import Errors**: Check file paths and imports

### Firebase CLI Issues

```bash
# Clear Firebase cache
firebase logout
firebase login

# Reinstall Firebase CLI
npm uninstall -g firebase-tools
npm install -g firebase-tools
```

### Deployment Failures

1. **Authentication**: Ensure you're logged in to Firebase
2. **Project Access**: Verify you have access to the `egasadmin` project
3. **Build Output**: Ensure `dist/` directory exists and contains files

## Post-Deployment

### Verify Deployment

1. Check the deployment URL provided by Firebase
2. Test all major functionality:
   - Login/authentication
   - Dashboard views
   - Order management
   - Driver management
   - Customer management

### Monitor Performance

1. **Firebase Console**: Check hosting analytics
2. **Performance**: Monitor load times and user experience
3. **Errors**: Check browser console for any JavaScript errors

## Custom Domain (Optional)

To use a custom domain:

1. **Firebase Console**: Go to Hosting settings
2. **Add Custom Domain**: Enter your domain
3. **DNS Configuration**: Update DNS records as instructed
4. **SSL Certificate**: Firebase automatically provides SSL

## Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '20'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Firebase
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
        projectId: egasadmin
```

## Security Considerations

1. **API Security**: Ensure your backend API is properly secured
2. **Authentication**: Verify admin authentication is working
3. **CORS**: Configure CORS properly on your backend
4. **Environment Variables**: Don't commit sensitive data to version control

## Support

If you encounter issues:

1. Check Firebase Console for error logs
2. Review build output for TypeScript errors
3. Verify API connectivity
4. Check browser console for runtime errors

## Useful Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Firebase
firebase login       # Login to Firebase
firebase logout      # Logout from Firebase
firebase projects:list  # List available projects
firebase use egasadmin  # Switch to egasadmin project
firebase hosting:channel:deploy preview  # Deploy to preview channel
``` 