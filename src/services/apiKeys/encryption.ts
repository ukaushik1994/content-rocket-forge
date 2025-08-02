
// Secure API key encryption service using Web Crypto API with AES-GCM
class SecureEncryption {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12; // 96 bits for GCM
  private static readonly SALT_LENGTH = 32;
  private static readonly ITERATIONS = 100000;

  /**
   * Converts ArrayBuffer to base64 string safely
   */
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Converts base64 string to ArrayBuffer safely
   */
  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Check if Web Crypto API is available
   */
  private static isWebCryptoAvailable(): boolean {
    return typeof crypto !== 'undefined' && 
           typeof crypto.subtle !== 'undefined' && 
           typeof crypto.getRandomValues === 'function';
  }

  /**
   * Derives an AES key from a password using PBKDF2
   */
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    if (!this.isWebCryptoAvailable()) {
      throw new Error('Web Crypto API is not available in this browser');
    }

    try {
      console.log('🔐 Deriving encryption key...');
      
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
      );

      const derivedKey = await crypto.subtle.deriveKey(
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

      console.log('✅ Key derivation successful');
      return derivedKey;
    } catch (error) {
      console.error('❌ Key derivation failed:', error);
      throw new Error(`Key derivation failed: ${error.message}`);
    }
  }

  /**
   * Generates a secure master password based on user ID and application secret
   */
  private static generateMasterPassword(userId: string): string {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID provided for encryption');
    }
    
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
      console.log('🔒 Starting API key encryption process...');
      
      // Input validation
      if (!plaintext || typeof plaintext !== 'string') {
        throw new Error('Invalid plaintext provided for encryption');
      }
      
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid user ID provided for encryption');
      }

      if (!this.isWebCryptoAvailable()) {
        throw new Error('Web Crypto API is not supported in this browser. Please use a modern browser.');
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(plaintext);
      console.log('📝 Data prepared for encryption, length:', data.length);
      
      // Generate random salt and IV
      const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
      console.log('🎲 Random salt and IV generated');
      
      // Derive key from master password
      const masterPassword = this.generateMasterPassword(userId);
      const key = await this.deriveKey(masterPassword, salt);
      
      // Encrypt the data
      console.log('🔐 Encrypting data...');
      const encrypted = await crypto.subtle.encrypt(
        { name: this.ALGORITHM, iv },
        key,
        data
      );
      console.log('✅ Data encryption successful');
      
      // Combine salt, iv, and encrypted data
      const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encrypted), salt.length + iv.length);
      
      // Return base64 encoded result using safe conversion
      const base64Result = this.arrayBufferToBase64(combined.buffer);
      console.log('✅ API key encryption completed successfully');
      
      return base64Result;
    } catch (error: any) {
      console.error('❌ Encryption error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        userId: userId ? 'provided' : 'missing',
        plaintextLength: plaintext?.length || 0
      });
      
      // Provide specific error messages based on the error type
      if (error.name === 'NotSupportedError') {
        throw new Error('Your browser does not support the required encryption features. Please update your browser or try a different one.');
      } else if (error.message.includes('Web Crypto API')) {
        throw new Error('Encryption not supported in this browser environment. Please use HTTPS or a modern browser.');
      } else {
        throw new Error(`Failed to encrypt API key: ${error.message}`);
      }
    }
  }

  /**
   * Decrypts an encrypted string using AES-GCM
   */
  static async decrypt(encryptedData: string, userId: string): Promise<string> {
    try {
      console.log('🔓 Starting API key decryption process...');
      
      // Input validation
      if (!encryptedData || typeof encryptedData !== 'string') {
        throw new Error('Invalid encrypted data provided');
      }
      
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid user ID provided for decryption');
      }

      if (!this.isWebCryptoAvailable()) {
        throw new Error('Web Crypto API is not supported in this browser');
      }

      // Decode base64 using safe conversion
      const combinedBuffer = this.base64ToArrayBuffer(encryptedData);
      const combined = new Uint8Array(combinedBuffer);
      console.log('📝 Encrypted data decoded, total length:', combined.length);
      
      // Validate minimum length
      if (combined.length < this.SALT_LENGTH + this.IV_LENGTH + 1) {
        throw new Error('Encrypted data appears to be corrupted or incomplete');
      }
      
      // Extract salt, IV, and encrypted data
      const salt = combined.slice(0, this.SALT_LENGTH);
      const iv = combined.slice(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
      const encrypted = combined.slice(this.SALT_LENGTH + this.IV_LENGTH);
      
      console.log('🔍 Data components extracted:', {
        saltLength: salt.length,
        ivLength: iv.length,
        encryptedLength: encrypted.length
      });
      
      // Derive key from master password
      const masterPassword = this.generateMasterPassword(userId);
      const key = await this.deriveKey(masterPassword, salt);
      
      // Decrypt the data
      console.log('🔓 Decrypting data...');
      const decrypted = await crypto.subtle.decrypt(
        { name: this.ALGORITHM, iv },
        key,
        encrypted
      );
      
      // Return decrypted string
      const decoder = new TextDecoder();
      const result = decoder.decode(decrypted);
      console.log('✅ API key decryption completed successfully');
      
      return result;
    } catch (error: any) {
      console.error('❌ Decryption error details:', {
        message: error.message,
        name: error.name,
        userId: userId ? 'provided' : 'missing',
        encryptedDataLength: encryptedData?.length || 0
      });
      
      // Provide specific error messages
      if (error.name === 'OperationError' || error.name === 'InvalidAccessError') {
        throw new Error('Failed to decrypt API key - the key may be corrupted or was encrypted with a different password');
      } else if (error.message.includes('corrupted')) {
        throw new Error('API key data is corrupted and cannot be recovered. Please re-enter your API key.');
      } else {
        throw new Error(`Failed to decrypt API key: ${error.message}`);
      }
    }
  }

  /**
   * Migrates old encrypted keys to new encryption format
   */
  static async migrateKey(oldEncryptedKey: string, userId: string): Promise<string> {
    try {
      console.log('🔄 Attempting to migrate old API key format...');
      
      // Try to decrypt with old method first (if the old key is recoverable)
      // For now, we'll assume old keys need to be re-entered
      console.warn('⚠️ Old encryption format detected. Migration requires re-entering the API key.');
      throw new Error('Key migration required - please re-enter your API key for enhanced security');
    } catch (error: any) {
      console.error('❌ Key migration failed:', error);
      throw new Error('Key migration failed - please re-enter your API key');
    }
  }
}

// Export the encryption functions
export const encryptApiKey = SecureEncryption.encrypt;
export const decryptApiKey = SecureEncryption.decrypt;
export const migrateApiKey = SecureEncryption.migrateKey;
