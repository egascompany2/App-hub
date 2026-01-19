# GitHub Codespaces Guide - Admin Dashboard

## 🚀 **Why GitHub Codespaces?**

GitHub Codespaces provides a cloud-based development environment that:
- ✅ **Solves Node.js Version Issues**: Pre-configured with Node.js 20
- ✅ **Pre-installed Firebase CLI**: No manual installation needed
- ✅ **Consistent Environment**: Same setup across all team members
- ✅ **No Local Setup**: Works on any device with a browser
- ✅ **Integrated Development**: VS Code extensions pre-configured

## 🏗️ **Setup Instructions**

### **Step 1: Open in Codespaces**

1. **Navigate to your repository** on GitHub
2. **Click the green "Code" button**
3. **Select "Codespaces" tab**
4. **Click "Create codespace on main"**
5. **Wait for the environment to build** (2-3 minutes)

### **Step 2: Navigate to Admin Dashboard**

Once Codespaces opens, navigate to the admin dashboard:

```bash
cd egasApp2-main/admin-dashboard
```

### **Step 3: Verify Environment**

```bash
# Check Node.js version (should be 20.x)
node --version

# Check Firebase CLI
firebase --version

# Check if dependencies are installed
ls node_modules
```

## 🔧 **Development Workflow**

### **Start Development Server**

```bash
npm run dev
```

The dev server will be available at the forwarded port (usually shown in the notification).

### **Build for Production**

```bash
npm run build
```

### **Test Production Build**

```bash
npm run preview
```

## 🔥 **Firebase Deployment from Codespaces**

### **Step 1: Login to Firebase**

```bash
firebase login
```

This will open a browser window for authentication.

### **Step 2: Set Environment Variables**

```bash
# Create production environment file
echo "VITE_API_URL=https://your-vps-ip-or-domain.com/api" > .env.production
echo "VITE_APP_NAME=EGas Admin Dashboard" >> .env.production
```

### **Step 3: Deploy**

```bash
# Build and deploy
npm run build
firebase deploy --only hosting
```

## 🤖 **Automated Deployment with GitHub Actions**

### **Setup GitHub Secrets**

1. **Go to your repository settings**
2. **Navigate to Secrets and variables → Actions**
3. **Add the following secrets**:

#### **Required Secrets**

```bash
# Your backend API URL
VITE_API_URL=https://your-vps-ip-or-domain.com/api

# Firebase service account JSON (base64 encoded)
FIREBASE_SERVICE_ACCOUNT_EGASADMIN=<base64-encoded-service-account>
```

### **Get Firebase Service Account**

1. **Go to Firebase Console**
2. **Project Settings → Service Accounts**
3. **Generate new private key**
4. **Base64 encode the JSON file**:

```bash
# On your local machine
base64 -i path/to/service-account.json
```

5. **Copy the base64 string to GitHub secrets**

### **Trigger Deployment**

The workflow will automatically deploy when you:
- **Push to main branch** → Deploy to production
- **Push to develop branch** → Deploy to preview channel
- **Create pull request** → Deploy to preview channel

## 🛠️ **Codespaces Features**

### **Pre-configured Extensions**

- **TypeScript**: Full TypeScript support
- **Tailwind CSS**: IntelliSense for Tailwind classes
- **Prettier**: Code formatting
- **ESLint**: Code linting
- **Firebase Explorer**: Firebase project management
- **JSON**: JSON file support

### **Port Forwarding**

The following ports are automatically forwarded:
- **5173**: Development server
- **5000**: Firebase emulator
- **5001**: Firebase emulator UI

### **Terminal Access**

Multiple terminal tabs available:
- **Integrated Terminal**: VS Code terminal
- **External Terminal**: Browser-based terminal
- **Git Bash**: Git-specific terminal

## 📁 **File Structure in Codespaces**

```
egasApp2-main/
├── admin-dashboard/          # Your current workspace
│   ├── src/
│   ├── dist/                 # Build output
│   ├── firebase.json         # Firebase config
│   ├── .firebaserc          # Firebase project
│   └── deploy.sh            # Deployment script
├── backend/                  # Backend code
├── user-app/                 # User mobile app
└── driver-app/               # Driver mobile app
```

## 🔍 **Debugging in Codespaces**

### **Browser DevTools**

1. **Open the forwarded port** (usually shown in notification)
2. **Right-click → Inspect** to open DevTools
3. **Check Console** for any errors
4. **Network tab** to monitor API calls

### **VS Code Debugging**

1. **Set breakpoints** in your TypeScript files
2. **Press F5** to start debugging
3. **Use Debug Console** for expressions

### **Terminal Debugging**

```bash
# Check build errors
npm run build

# Check TypeScript errors
npx tsc --noEmit

# Check linting errors
npm run lint

# Check Firebase status
firebase projects:list
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Port Not Forwarded**
   - Check the "Ports" tab in VS Code
   - Manually forward the port if needed

2. **Firebase Login Issues**
   - Clear Firebase cache: `firebase logout && firebase login`
   - Check browser popup blockers

3. **Build Errors**
   - Check Node.js version: `node --version`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

4. **API Connection Issues**
   - Verify VITE_API_URL is correct
   - Check if backend is accessible from Codespaces

### **Performance Tips**

1. **Use Prebuilds**: Enable prebuilds for faster startup
2. **Cache Dependencies**: Dependencies are cached between sessions
3. **Close Unused Tabs**: Free up memory
4. **Use Terminal**: Faster than GUI for many operations

## 📚 **Useful Commands**

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run linting

# Firebase
firebase login           # Login to Firebase
firebase logout          # Logout from Firebase
firebase projects:list   # List projects
firebase use egasadmin   # Switch to project
firebase deploy          # Deploy everything
firebase deploy --only hosting  # Deploy only hosting

# Git
git status               # Check status
git add .                # Stage changes
git commit -m "message"  # Commit changes
git push                 # Push to GitHub
```

## 🎯 **Best Practices**

1. **Always test locally** before pushing
2. **Use meaningful commit messages**
3. **Check the Actions tab** for deployment status
4. **Monitor Firebase Console** for hosting analytics
5. **Keep dependencies updated**

## 🆘 **Support**

If you encounter issues:

1. **Check the Actions tab** for workflow errors
2. **Review Firebase Console** for deployment issues
3. **Check browser console** for runtime errors
4. **Use VS Code's Problems panel** for build errors

## 🎉 **Success Indicators**

Your Codespaces setup is working when:
- ✅ Codespace opens without errors
- ✅ Node.js version is 20.x
- ✅ Firebase CLI is available
- ✅ Development server starts
- ✅ Build completes successfully
- ✅ Deployment to Firebase works 