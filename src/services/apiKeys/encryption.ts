
/**
 * Simple encryption utilities for API keys
 */

/**
 * Encrypt an API key using simple base64 + character shift
 */
export function encryptKey(key: string): string {
  try {
    const encoded = btoa(key);
    // Simple cipher - rotate each character by 3
    return encoded.split('').map(char => 
      String.fromCharCode(char.charCodeAt(0) + 3)
    ).join('');
  } catch {
    return btoa(key); // Fallback to just base64
  }
}

/**
 * Decrypt an API key
 */
export function decryptKey(encryptedKey: string): string {
  try {
    // Reverse the simple cipher
    const decoded = encryptedKey.split('').map(char => 
      String.fromCharCode(char.charCodeAt(0) - 3)
    ).join('');
    return atob(decoded);
  } catch {
    try {
      return atob(encryptedKey); // Fallback to just base64
    } catch {
      return encryptedKey; // Last resort - return as is
    }
  }
}
