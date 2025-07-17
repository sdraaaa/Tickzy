# Tickzy - Event Management Platform

A modern React-based event management platform with Firebase authentication and role-based access control.

## 🌐 Live Deployments

- **Netlify (Primary)**: https://tickzy.netlify.app
- **GitHub Pages**: https://sdraaaa.github.io/Tickzy/

## 🚀 Features

- **Role-based Authentication**: Admin, Host, and User roles
- **Event Management**: Create, manage, and book events
- **Firebase Integration**: Real-time database and authentication
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Multi-deployment**: Supports both Netlify and GitHub Pages

## 👥 Predefined User Accounts

The application comes with three predefined user accounts for testing:

- **Admin**: `aleemsidra2205@gmail.com` → `/admin` dashboard
- **Host**: `abdulaleemsidra@gmail.com` → `/host-dashboard`
- **User**: `sidraaleem8113@gmail.com` → `/user-dashboard`

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project configured

### Setup
```bash
# Clone the repository
git clone https://github.com/sdraaaa/Tickzy.git
cd Tickzy

# Install dependencies
npm install

# Start development server (runs on port 3000)
npm run dev
```

### Build Commands
```bash
# Build for Netlify (default)
npm run build

# Build for GitHub Pages
npm run build:github

# Deploy to GitHub Pages (local preparation)
npm run deploy:github

# Preview GitHub Pages build locally
npm run preview:github
```

## 🔧 Configuration

### Environment Variables
The application uses Firebase configuration. Ensure your Firebase project is properly configured with:
- Authentication enabled
- Firestore database
- Authorized domains added for both deployments

### Authorized Domains for Firebase
Add these domains to Firebase Console → Authentication → Settings → Authorized domains:
- `localhost` (development)
- `tickzy.netlify.app` (Netlify)
- `sdraaaa.github.io` (GitHub Pages)

## 📦 Deployment

### Netlify Deployment
- Automatically deploys from main branch
- Uses default build settings
- Environment: Production

### GitHub Pages Deployment
- Automated via GitHub Actions
- Triggers on push to main branch
- Uses subdirectory structure (`/Tickzy/`)
- See [GitHub Pages Setup Guide](docs/GITHUB_PAGES_SETUP.md) for details

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Routing**: React Router v6
- **Icons**: Lucide React

### Project Structure
```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, etc.)
├── pages/              # Page components
├── utils/              # Utility functions
├── firebase/           # Firebase configuration
└── styles/             # Global styles
```

## 🔐 Authentication System

The application implements a robust authentication system with:
- Google OAuth integration
- Email/password authentication
- Role-based access control
- Automatic user role assignment
- Protected routes

## 🐛 Debugging

Debug functions available in browser console:
```javascript
// Check authentication state
debugAuthState()

// Test predefined users
debugPredefinedUsers()

// Check environment info
logEnvironmentInfo()

// Test current user role
testCurrentUserRole()
```

## 📚 Documentation

- [GitHub Pages Setup](docs/GITHUB_PAGES_SETUP.md)
- [Authentication System](docs/AUTH_SYSTEM.md) (if exists)
- [Deployment Guide](docs/DEPLOYMENT.md) (if exists)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both deployment environments
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the documentation in the `docs/` folder
2. Use browser console debug functions
3. Check Firebase Console for authentication issues
4. Review GitHub Actions logs for deployment issues
