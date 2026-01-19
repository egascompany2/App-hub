# EGas Admin Dashboard

A modern React-based admin dashboard for managing EGas operations, built with TypeScript, Tailwind CSS, and Firebase Hosting.

## 🚀 Quick Start

### Option 1: GitHub Codespaces (Recommended)

1. **Click the green "Code" button** on GitHub
2. **Select "Codespaces" tab**
3. **Click "Create codespace on main"**
4. **Wait for environment to build** (2-3 minutes)
5. **Navigate to admin dashboard**:
   ```bash
   cd egasApp2-main/admin-dashboard
   ```
6. **Start development**:
   ```bash
   npm run dev
   ```

### Option 2: Local Development

#### Prerequisites
- Node.js 20.0.0 or higher
- npm or yarn

#### Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd egasApp2-main/admin-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🏗️ Project Structure

```
admin-dashboard/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── lib/                # Utilities and configurations
│   ├── types/              # TypeScript type definitions
│   └── App.tsx             # Main application component
├── public/                 # Static assets
├── dist/                   # Build output (generated)
├── firebase.json           # Firebase hosting configuration
├── .firebaserc            # Firebase project configuration
└── deploy.sh              # Deployment script
```

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🔥 Firebase Deployment

### Manual Deployment
```bash
# Set environment variables
echo "VITE_API_URL=https://your-backend-url.com/api" > .env.production

# Build and deploy
npm run build
firebase deploy --only hosting
```

### Automated Deployment
The project includes GitHub Actions for automated deployment:
- **Push to main** → Deploy to production
- **Push to develop** → Deploy to preview channel
- **Pull requests** → Deploy to preview channel

## 🌐 Environment Configuration

Create a `.env.production` file with:
```env
VITE_API_URL=https://your-backend-url.com/api
VITE_APP_NAME=EGas Admin Dashboard
```

## 📚 Documentation

- [Firebase Deployment Guide](FIREBASE_DEPLOYMENT.md)
- [GitHub Codespaces Guide](CODESPACES_GUIDE.md)
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)

## 🎨 Features

- **Modern UI**: Built with Tailwind CSS and Radix UI
- **TypeScript**: Full type safety
- **Responsive Design**: Works on all devices
- **Real-time Updates**: Live data from backend
- **Authentication**: Secure admin login
- **Order Management**: Complete order lifecycle
- **Driver Management**: Driver assignment and tracking
- **Customer Management**: Customer data and history
- **Analytics Dashboard**: Key metrics and insights

## 🔧 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Forms**: React Hook Form, Zod validation
- **Deployment**: Firebase Hosting
- **CI/CD**: GitHub Actions

## 🚨 Troubleshooting

### Common Issues

1. **Node.js Version**: Ensure you're using Node.js 20+
2. **Build Errors**: Check TypeScript errors and dependencies
3. **API Connection**: Verify VITE_API_URL is correct
4. **Firebase Issues**: Check authentication and project access

### Getting Help

1. Check the [Codespaces Guide](CODESPACES_GUIDE.md) for detailed setup
2. Review the [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)
3. Check browser console for runtime errors
4. Verify API connectivity

## 📄 License

This project is part of the EGas platform.
