/**
 * Authentication Domain Helper
 * 
 * This utility helps with Google OAuth domain configuration and testing
 * for both development and production environments.
 */

export interface DomainInfo {
  hostname: string;
  protocol: string;
  port: string | null;
  isLocalhost: boolean;
  isProduction: boolean;
  isNetlify: boolean;
}

/**
 * Get current domain information
 */
export const getCurrentDomainInfo = (): DomainInfo => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  return {
    hostname,
    protocol,
    port: port || null,
    isLocalhost: hostname === 'localhost' || hostname === '127.0.0.1',
    isProduction: hostname.includes('netlify.app') || hostname.includes('tickzy.'),
    isNetlify: hostname.includes('netlify.app'),
  };
};

/**
 * Get the list of authorized domains that should be configured in Firebase Console
 */
export const getAuthorizedDomains = (): string[] => {
  const domains = [
    'localhost',
    '127.0.0.1',
    'tickzy.netlify.app', // Production Netlify domain
  ];
  
  // Add any custom domains here
  const customDomain = 'tickzy.com'; // Replace with your actual custom domain if you have one
  if (customDomain && customDomain !== 'tickzy.com') {
    domains.push(customDomain);
  }
  
  return domains;
};

/**
 * Check if the current domain is authorized for Google OAuth
 */
export const isCurrentDomainAuthorized = (): boolean => {
  const domainInfo = getCurrentDomainInfo();
  const authorizedDomains = getAuthorizedDomains();
  
  return authorizedDomains.some(domain => 
    domainInfo.hostname === domain || 
    domainInfo.hostname.endsWith(`.${domain}`)
  );
};

/**
 * Get Firebase Console configuration instructions
 */
export const getFirebaseConfigInstructions = (): string => {
  const authorizedDomains = getAuthorizedDomains();
  
  return `
Firebase Console Configuration Instructions:

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: tickzy-e986b
3. Go to Authentication > Settings > Authorized domains
4. Add these domains:

${authorizedDomains.map(domain => `   - ${domain}`).join('\n')}

5. For each domain, make sure to add both:
   - The domain itself (e.g., tickzy.netlify.app)
   - Any subdomains if needed (e.g., www.tickzy.netlify.app)

6. Save the configuration and wait a few minutes for changes to propagate.

Current domain: ${getCurrentDomainInfo().hostname}
Is authorized: ${isCurrentDomainAuthorized() ? 'YES' : 'NO'}
`;
};

/**
 * Log domain configuration information for debugging
 */
export const logDomainInfo = (): void => {
  const domainInfo = getCurrentDomainInfo();
  const isAuthorized = isCurrentDomainAuthorized();
  
  console.group('🌐 Domain Configuration Info');
  console.log('Current domain:', domainInfo);
  console.log('Is authorized:', isAuthorized);
  console.log('Authorized domains:', getAuthorizedDomains());
  
  if (!isAuthorized) {
    console.warn('⚠️ Current domain is not in the authorized list!');
    console.log('Firebase configuration instructions:');
    console.log(getFirebaseConfigInstructions());
  }
  
  console.groupEnd();
};

/**
 * Test Google OAuth compatibility for the current domain
 */
export const testGoogleOAuthCompatibility = (): {
  compatible: boolean;
  issues: string[];
  recommendations: string[];
} => {
  const domainInfo = getCurrentDomainInfo();
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check if domain is authorized
  if (!isCurrentDomainAuthorized()) {
    issues.push('Domain not in authorized list');
    recommendations.push('Add domain to Firebase Console authorized domains');
  }
  
  // Check for HTTPS in production
  if (domainInfo.isProduction && domainInfo.protocol !== 'https:') {
    issues.push('Production domain not using HTTPS');
    recommendations.push('Ensure production deployment uses HTTPS');
  }
  
  // Check for popup blockers
  if (typeof window !== 'undefined') {
    try {
      const popup = window.open('', '_blank', 'width=1,height=1');
      if (popup) {
        popup.close();
      } else {
        issues.push('Popup blocker detected');
        recommendations.push('Ask users to allow popups for this site');
      }
    } catch (error) {
      issues.push('Popup functionality blocked');
      recommendations.push('Check browser popup settings');
    }
  }
  
  // Check for third-party cookies
  if (navigator.cookieEnabled === false) {
    issues.push('Cookies disabled');
    recommendations.push('Ask users to enable cookies');
  }
  
  return {
    compatible: issues.length === 0,
    issues,
    recommendations,
  };
};

/**
 * Initialize domain checking (call this on app startup)
 */
export const initializeDomainChecking = (): void => {
  if (process.env.NODE_ENV === 'development') {
    logDomainInfo();
    
    const compatibility = testGoogleOAuthCompatibility();
    if (!compatibility.compatible) {
      console.warn('🚨 Google OAuth compatibility issues detected:', compatibility);
    }
  }
};
