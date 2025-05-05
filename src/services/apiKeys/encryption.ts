
// Simple encryption utilities for API keys
// Note: In production, we should use an edge function for storing sensitive keys

/**
 * Simple encryption (not suitable for production, just for demonstration)
 * @param key The API key to encrypt
 * @returns The encrypted key
 */
export const encryptKey = (key: string): string => {
  try {
    if (!key || typeof key !== 'string') {
      console.error('Invalid key provided for encryption');
      return '';
    }
    return btoa(key); // Base64 encode
  } catch (error) {
    console.error('Error encrypting key:', error);
    return '';
  }
};

/**
 * Decrypt an encrypted API key
 * @param encryptedKey The encrypted API key
 * @returns The decrypted key
 */
export const decryptKey = (encryptedKey: string): string => {
  try {
    if (!encryptedKey || typeof encryptedKey !== 'string') {
      console.error('Invalid encrypted key provided for decryption');
      return '';
    }
    return atob(encryptedKey); // Base64 decode
  } catch (error) {
    console.error('Error decrypting key:', error);
    return '';
  }
};
