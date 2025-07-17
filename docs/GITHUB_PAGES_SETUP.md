# GitHub Pages Deployment Setup

This document explains how to deploy the Tickzy React application to GitHub Pages alongside the existing Netlify deployment.

## Overview

The application is configured to work on both:
- **Netlify**: https://tickzy.netlify.app (root domain)
- **GitHub Pages**: https://sdraaaa.github.io/Tickzy/ (subdirectory)

## Configuration Changes Made

### 1. Vite Configuration (`vite.config.ts`)
- Added dynamic base path detection
- GitHub Pages uses `/Tickzy/` base path
- Netlify and local development use `/` base path
- Consistent asset naming and chunking

### 2. Router Configuration (`src/App.tsx`)
- Added basename support for React Router
- Automatically detects deployment environment
- Handles subdirectory routing for GitHub Pages

### 3. Environment Detection (`src/utils/environmentHelper.ts`)
- Added GitHub Pages environment detection
- Updated authorized domains for Firebase
- Enhanced domain information utilities

### 4. Build Scripts (`package.json`)
- `npm run build:github` - Build specifically for GitHub Pages
- `npm run deploy:github` - Complete deployment preparation
- `npm run preview:github` - Preview GitHub Pages build locally

## Deployment Process

### Automatic Deployment (Recommended)

1. **Push to main branch** - GitHub Actions will automatically build and deploy
2. **Check workflow** at https://github.com/sdraaaa/Tickzy/actions
3. **Visit deployed site** at https://sdraaaa.github.io/Tickzy/

### Manual Deployment

```bash
# Build for GitHub Pages
npm run deploy:github

# Or just build
npm run build:github
```

## GitHub Repository Settings

### Enable GitHub Pages
1. Go to repository Settings → Pages
2. Source: "GitHub Actions"
3. The workflow will handle the rest

### Required Secrets
No additional secrets needed - the workflow uses built-in `GITHUB_TOKEN`

## Firebase Configuration

### Add GitHub Pages Domain
1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add: `sdraaaa.github.io`
3. This allows OAuth to work on GitHub Pages

## File Structure

```
├── .github/workflows/
│   └── deploy-github-pages.yml    # GitHub Actions workflow
├── public/
│   └── 404.html                   # Custom 404 page for SPA routing
├── scripts/
│   └── deploy-github.js           # Deployment helper script
└── docs/
    └── GITHUB_PAGES_SETUP.md      # This documentation
```

## Troubleshooting

### 404 Errors for Assets
- Check that `vite.config.ts` has correct base path
- Verify `GITHUB_PAGES=true` environment variable is set during build
- Assets should be referenced as `/Tickzy/assets/...`

### Routing Issues
- Ensure React Router basename is set correctly
- Check that 404.html is present in build output
- Verify SPA routing redirects work

### Firebase Auth Issues
- Add `sdraaaa.github.io` to Firebase authorized domains
- Check console for unauthorized domain errors
- Verify OAuth redirect URLs are correct

## Testing

### Local Testing
```bash
# Test GitHub Pages build locally
npm run preview:github
```

### Production Testing
1. Visit https://sdraaaa.github.io/Tickzy/
2. Test authentication with predefined users
3. Verify all routes work correctly
4. Check that assets load properly

## Maintenance

### Updating Dependencies
- Both Netlify and GitHub Pages builds use the same dependencies
- Test both deployments after major updates
- Monitor build times and bundle sizes

### Environment Variables
- GitHub Pages build uses `GITHUB_PAGES=true`
- Netlify build uses default environment
- No additional environment variables needed for basic functionality
