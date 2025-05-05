
// Simple encryption utilities for API keys
// Note: In production, we should use an edge function for storing sensitive keys

/**
 * Simple encryption (not suitable for production, just for demonstration)
 * @param key The API key to encrypt
 * @returns The encrypted key
 */
export const encryptKey = (key: string): string => {
  return btoa(key); // Base64 encode
};

/**
 * Decrypt an encrypted API key
 * @param encryptedKey The encrypted API key
 * @returns The decrypted key
 */
export const decryptKey = (encryptedKey: string): string => {
  try {
    return atob(encryptedKey); // Base64 decode
  } catch (error) {
    return '';
  }
};
