import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Determine base path based on deployment target
const getBasePath = () => {
  // Check if building for GitHub Pages
  if (process.env.GITHUB_PAGES === 'true') {
    return '/Tickzy/';
  }
  // Default for Netlify and local development
  return '/';
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: getBasePath(),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 3000,
    strictPort: true, // Exit if port 3000 is already in use
    host: true, // Allow external connections
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps for production
    assetsDir: 'assets', // Ensure assets are in a consistent directory
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        },
        // Ensure consistent asset naming
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  preview: {
    port: 3000,
    host: true,
  },
});
