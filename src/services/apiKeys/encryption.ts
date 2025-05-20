
/**
 * Simple encryption/decryption utilities for API keys
 * In a real production environment, consider using more secure methods
 */

/**
 * Basic encryption for API keys - not truly secure but better than plaintext
 * In production, use a proper encryption library with your own secret key
 */
export function encryptKey(key: string): string | null {
  try {
    // Simple encoding for demo purposes - in production use a proper encryption method
    return btoa(key);
  } catch (error) {
    console.error('Error encrypting API key:', error);
    return null;
  }
}

/**
 * Decrypt an API key previously encrypted with encryptKey
 */
export function decryptKey(encryptedKey: string): string | null {
  try {
    // Simple decoding for demo purposes - in production use a proper decryption method
    return atob(encryptedKey);
  } catch (error) {
    console.error('Error decrypting API key:', error);
    return null;
  }
}
