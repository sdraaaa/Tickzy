/**
 * Environment Helper Utilities
 * 
 * Helps handle different configurations for development, staging, and production
 */

/**
 * Get current environment
 */
export const getCurrentEnvironment = (): 'development' | 'production' | 'preview' | 'github-pages' => {
  if (import.meta.env.DEV) {
    return 'development';
  }

  if (import.meta.env.PROD) {
    // Check if this is GitHub Pages
    if (window.location.hostname.includes('github.io')) {
      return 'github-pages';
    }

    // Check if this is a Netlify deploy preview
    if (window.location.hostname.includes('deploy-preview') ||
        window.location.hostname.includes('branch-deploy')) {
      return 'preview';
    }
    return 'production';
  }

  return 'development';
};

/**
 * Get current domain info
 */
export const getDomainInfo = () => {
  const hostname = window.location.hostname;
  const origin = window.location.origin;
  const environment = getCurrentEnvironment();

  return {
    hostname,
    origin,
    environment,
    isLocalhost: hostname === 'localhost' || hostname === '127.0.0.1',
    isNetlify: hostname.includes('netlify.app'),
    isGitHubPages: hostname.includes('github.io'),
    isProduction: environment === 'production' && !hostname.includes('deploy-preview'),
    basePath: environment === 'github-pages' ? '/Tickzy/' : '/',
  };
};

/**
 * Get authorized domains for Firebase
 */
export const getAuthorizedDomains = (): string[] => {
  const domains = [
    'localhost',
    '127.0.0.1',
    'tickzy.netlify.app', // Production Netlify domain
    'sdraaaa.github.io', // GitHub Pages domain
  ];

  // Add current domain if it's a Netlify deploy preview or GitHub Pages
  const currentDomain = window.location.hostname;
  if ((currentDomain.includes('netlify.app') || currentDomain.includes('github.io')) &&
      !domains.includes(currentDomain)) {
    domains.push(currentDomain);
  }

  return domains;
};

/**
 * Check if current domain is authorized for Firebase Auth
 */
export const isCurrentDomainAuthorized = (): boolean => {
  const authorizedDomains = getAuthorizedDomains();
  const currentDomain = window.location.hostname;
  
  return authorizedDomains.some(domain => 
    currentDomain === domain || 
    currentDomain.endsWith(`.${domain}`)
  );
};

/**
 * Log environment information for debugging
 */
export const logEnvironmentInfo = () => {
  const domainInfo = getDomainInfo();
  const authorizedDomains = getAuthorizedDomains();
  const isAuthorized = isCurrentDomainAuthorized();
  
  console.log('🌍 Environment Info:', {
    ...domainInfo,
    authorizedDomains,
    isCurrentDomainAuthorized: isAuthorized,
    timestamp: new Date().toISOString()
  });
  
  if (!isAuthorized) {
    console.warn('⚠️ Current domain may not be authorized for Firebase Auth');
    console.warn('📝 Add this domain to Firebase Console -> Authentication -> Settings -> Authorized domains:');
    console.warn(`   ${domainInfo.hostname}`);
  }
  
  return domainInfo;
};

/**
 * Get appropriate redirect URL for OAuth
 */
export const getOAuthRedirectUrl = (): string => {
  const { origin } = getDomainInfo();
  return `${origin}/login`;
};

// Make functions available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).getCurrentEnvironment = getCurrentEnvironment;
  (window as any).getDomainInfo = getDomainInfo;
  (window as any).getAuthorizedDomains = getAuthorizedDomains;
  (window as any).isCurrentDomainAuthorized = isCurrentDomainAuthorized;
  (window as any).logEnvironmentInfo = logEnvironmentInfo;
}
