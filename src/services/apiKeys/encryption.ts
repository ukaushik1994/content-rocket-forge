
// Secure API key encryption service using Web Crypto API with AES-GCM
class SecureEncryption {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12; // 96 bits for GCM
  private static readonly SALT_LENGTH = 32;
  private static readonly ITERATIONS = 100000;

  /**
   * Derives an AES key from a password using PBKDF2
   */
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: this.ITERATIONS,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generates a secure master password based on user ID and application secret
   */
  private static generateMasterPassword(userId: string): string {
    // Use a combination of user ID and a fixed application identifier
    // In production, this should use a proper secret management system
    const appSecret = 'CR_APP_SECRET_2024'; // This should be from environment
    return `${userId}_${appSecret}`;
  }

  /**
   * Encrypts a plaintext string using AES-GCM
   */
  static async encrypt(plaintext: string, userId: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(plaintext);
      
      // Generate random salt and IV
      const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
      
      // Derive key from master password
      const masterPassword = this.generateMasterPassword(userId);
      const key = await this.deriveKey(masterPassword, salt);
      
      // Encrypt the data
      const encrypted = await crypto.subtle.encrypt(
        { name: this.ALGORITHM, iv },
        key,
        data
      );
      
      // Combine salt, iv, and encrypted data
      const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encrypted), salt.length + iv.length);
      
      // Return base64 encoded result
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt API key');
    }
  }

  /**
   * Decrypts an encrypted string using AES-GCM
   */
  static async decrypt(encryptedData: string, userId: string): Promise<string> {
    try {
      // Decode base64
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );
      
      // Extract salt, IV, and encrypted data
      const salt = combined.slice(0, this.SALT_LENGTH);
      const iv = combined.slice(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
      const encrypted = combined.slice(this.SALT_LENGTH + this.IV_LENGTH);
      
      // Derive key from master password
      const masterPassword = this.generateMasterPassword(userId);
      const key = await this.deriveKey(masterPassword, salt);
      
      // Decrypt the data
      const decrypted = await crypto.subtle.decrypt(
        { name: this.ALGORITHM, iv },
        key,
        encrypted
      );
      
      // Return decrypted string
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt API key - key may be corrupted or invalid');
    }
  }

  /**
   * Migrates old encrypted keys to new encryption format
   */
  static async migrateKey(oldEncryptedKey: string, userId: string): Promise<string> {
    try {
      // Try to decrypt with old method first (if the old key is recoverable)
      // For now, we'll assume old keys need to be re-entered
      console.warn('Old encryption format detected. Please re-enter your API key.');
      throw new Error('Migration required - please re-enter your API key');
    } catch (error) {
      throw new Error('Key migration failed - please re-enter your API key');
    }
  }
}

// Export the encryption functions
export const encryptApiKey = SecureEncryption.encrypt;
export const decryptApiKey = SecureEncryption.decrypt;
export const migrateApiKey = SecureEncryption.migrateKey;
