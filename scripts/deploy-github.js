#!/usr/bin/env node

/**
 * GitHub Pages Deployment Helper Script
 * 
 * This script helps build and deploy the Tickzy application to GitHub Pages
 * with proper configuration for the subdirectory structure.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting GitHub Pages deployment build...');

try {
  // Set environment variable for GitHub Pages build
  process.env.GITHUB_PAGES = 'true';
  
  console.log('📦 Installing dependencies...');
  execSync('npm ci', { stdio: 'inherit' });
  
  console.log('🏗️ Building for GitHub Pages...');
  execSync('npm run build:github', { stdio: 'inherit' });
  
  console.log('📁 Checking build output...');
  const distPath = path.join(__dirname, '..', 'dist');
  
  if (!fs.existsSync(distPath)) {
    throw new Error('Build failed: dist directory not found');
  }
  
  // Check if index.html exists
  const indexPath = path.join(distPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error('Build failed: index.html not found in dist directory');
  }
  
  // Verify that assets are properly referenced
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  if (!indexContent.includes('/Tickzy/assets/')) {
    console.warn('⚠️ Warning: Assets may not be properly configured for GitHub Pages subdirectory');
  } else {
    console.log('✅ Assets are properly configured for GitHub Pages');
  }
  
  // Copy 404.html to dist for GitHub Pages SPA support
  const source404 = path.join(__dirname, '..', 'public', '404.html');
  const dest404 = path.join(distPath, '404.html');
  
  if (fs.existsSync(source404)) {
    fs.copyFileSync(source404, dest404);
    console.log('✅ 404.html copied for SPA support');
  }
  
  // Create .nojekyll file to prevent Jekyll processing
  const nojekyllPath = path.join(distPath, '.nojekyll');
  fs.writeFileSync(nojekyllPath, '');
  console.log('✅ .nojekyll file created');
  
  console.log('🎉 GitHub Pages build completed successfully!');
  console.log('📋 Next steps:');
  console.log('   1. Commit and push your changes to trigger GitHub Actions');
  console.log('   2. Check GitHub Actions workflow at: https://github.com/sdraaaa/Tickzy/actions');
  console.log('   3. Once deployed, visit: https://sdraaaa.github.io/Tickzy/');
  console.log('   4. Add sdraaaa.github.io to Firebase Console authorized domains if needed');
  
} catch (error) {
  console.error('❌ Deployment build failed:', error.message);
  process.exit(1);
}
