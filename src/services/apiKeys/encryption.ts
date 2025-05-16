
/**
 * Simple encryption/decryption for API keys
 * In a production environment, you would use a more secure method
 */

export function encryptKey(key: string): string {
  try {
    // Simple Base64 encoding
    return btoa(key);
  } catch (error) {
    console.error('Error encrypting API key:', error);
    return '';
  }
}

export function decryptKey(encryptedKey: string): string {
  try {
    // Simple Base64 decoding
    return atob(encryptedKey);
  } catch (error) {
    console.error('Error decrypting API key:', error);
    return '';
  }
}
