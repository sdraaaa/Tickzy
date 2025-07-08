import { setupPredefinedUsers } from '@/utils/userRoleSetup';

/**
 * Application initialization service
 * Handles one-time setup tasks when the application starts
 */
class InitializationService {
  private static instance: InitializationService;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): InitializationService {
    if (!InitializationService.instance) {
      InitializationService.instance = new InitializationService();
    }
    return InitializationService.instance;
  }

  /**
   * Initialize the application
   * This method is safe to call multiple times - it will only run once
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      // Note: We no longer pre-create user documents during initialization
      // Predefined users are handled during authentication in AuthContext
      this.isInitialized = true;
    } catch (error) {
      console.error('Application initialization failed:', error);
      // Don't throw the error to prevent app from breaking
      // The app should still work even if initialization fails
    }
  }

  private async setupUserRoles(): Promise<void> {
    // This method is no longer used but kept for backward compatibility
    // Predefined users are now handled during authentication in AuthContext
  }

  /**
   * Check if initialization has completed
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Reset initialization state (for testing purposes)
   */
  public reset(): void {
    this.isInitialized = false;
    this.initializationPromise = null;
  }
}

// Export singleton instance
export const initializationService = InitializationService.getInstance();

// Export the class for testing
export { InitializationService };
