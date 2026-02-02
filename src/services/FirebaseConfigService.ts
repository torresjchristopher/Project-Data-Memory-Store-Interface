/**
 * FIREBASE CONFIG - PRODUCTION READY
 * This is COMPLETELY INDEPENDENT - Can be tested without any UI
 */

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

/**
 * Verify Firebase configuration is properly set
 * ZERO dependencies on React or UI
 */
export class FirebaseConfigService {
  static validateConfig(config: FirebaseConfig): boolean {
    const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    return required.every(key => config[key as keyof FirebaseConfig]);
  }

  static getConfig(): FirebaseConfig {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
  }

  static logConfigStatus(): void {
    const config = this.getConfig();
    const valid = this.validateConfig(config);
    console.log('🔑 Firebase Config Status:', valid ? '✅ VALID' : '❌ INVALID');
    if (!valid) {
      console.log('Missing:', Object.entries(config)
        .filter(([_, v]) => !v)
        .map(([k]) => k));
    }
  }
}
