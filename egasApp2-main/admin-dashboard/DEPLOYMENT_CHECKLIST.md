# Deployment Checklist - Admin Dashboard

## Pre-Deployment Checklist

### ✅ Build Verification
- [ ] `npm install` completed successfully
- [ ] `npm run build` completed without errors
- [ ] `dist/` directory contains built files

### ✅ Firebase Configuration
- [ ] `firebase.json` file exists and is configured
- [ ] `.firebaserc` file exists with correct project ID
- [ ] Firebase CLI is installed and logged in
- [ ] You have access to the `egasadmin` Firebase project

### ✅ Environment Configuration
- [ ] Create `.env.production` file with:
  ```
  VITE_API_URL=https://your-vps-ip-or-domain.com/api
  VITE_APP_NAME=EGas Admin Dashboard
  ```
- [ ] Replace `your-vps-ip-or-domain.com` with your actual backend URL
- [ ] Verify the API URL is accessible

### ✅ API Configuration
- [ ] Backend server is running and accessible
- [ ] CORS is properly configured on the backend
- [ ] Admin authentication endpoints are working
- [ ] All API endpoints are responding correctly

### ✅ Node.js Version
- [ ] Node.js version is 20.0.0 or higher
- [ ] If not, upgrade Node.js before deployment

## Deployment Steps

### 1. Environment Setup
```bash
# Create production environment file
echo "VITE_API_URL=https://your-vps-ip-or-domain.com/api" > .env.production
echo "VITE_APP_NAME=EGas Admin Dashboard" >> .env.production
```

### 2. Build the Project
```bash
npm run build
```

### 3. Deploy to Firebase
```bash
firebase deploy --only hosting
```

## Post-Deployment Verification

### ✅ Functionality Tests
- [ ] Admin login works
- [ ] Dashboard loads correctly
- [ ] Orders page displays data
- [ ] Drivers page displays data
- [ ] Customers page displays data
- [ ] All CRUD operations work

### ✅ API Connectivity
- [ ] No CORS errors in browser console
- [ ] API calls are successful
- [ ] Authentication tokens are working
- [ ] Real-time data updates work

### ✅ Performance
- [ ] Page load times are acceptable
- [ ] No JavaScript errors in console
- [ ] Responsive design works on mobile
- [ ] All features are accessible

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Check TypeScript errors
   - Verify all dependencies are installed
   - Check import paths

2. **API Connection Issues**
   - Verify VITE_API_URL is correct
   - Check backend server is running
   - Verify CORS configuration

3. **Firebase Deployment Issues**
   - Check Firebase login status
   - Verify project access
   - Check firebase.json configuration

4. **Authentication Issues**
   - Verify admin credentials
   - Check token storage
   - Verify API endpoints

## Emergency Rollback

If deployment fails or causes issues:

1. **Revert to Previous Version**
   ```bash
   firebase hosting:clone egasadmin:live egasadmin:live --version <previous-version>
   ```

2. **Disable Site**
   ```bash
   firebase hosting:disable
   ```

3. **Manual Fix**
   - Fix issues locally
   - Test thoroughly
   - Redeploy

## Support Contacts

- **Backend Issues**: Check VPS server logs
- **Firebase Issues**: Check Firebase Console
- **Frontend Issues**: Check browser console
- **Deployment Issues**: Review deployment logs

## Success Criteria

Deployment is successful when:
- [ ] Admin dashboard is accessible via Firebase URL
- [ ] All functionality works as expected
- [ ] No critical errors in console
- [ ] API connectivity is stable
- [ ] Performance is acceptable 