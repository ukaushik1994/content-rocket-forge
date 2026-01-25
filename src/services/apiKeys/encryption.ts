
import { supabase } from '@/integrations/supabase/client';

/**
 * Server-side encryption service for API keys
 * All encryption/decryption operations are performed server-side
 * to prevent secret exposure in client-side code
 */
class SecureEncryption {
  /**
   * Check if Web Crypto API is available (for fallback only)
   */
  private static isWebCryptoAvailable(): boolean {
    return typeof crypto !== 'undefined' && 
           typeof crypto.subtle !== 'undefined' && 
           typeof crypto.getRandomValues === 'function';
  }

  /**
   * Encrypts an API key server-side
   * The encryption secret never leaves the server
   */
  static async encrypt(plaintext: string, userId: string): Promise<string> {
    try {
      console.log('🔒 Encrypting API key server-side...');
      
      // Input validation
      if (!plaintext || typeof plaintext !== 'string') {
        throw new Error('Invalid plaintext provided for encryption');
      }
      
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid user ID provided for encryption');
      }

      // Call server-side encryption function
      const { data, error } = await supabase.functions.invoke('secure-api-key', {
        body: {
          action: 'encrypt',
          apiKey: plaintext,
          service: 'api_key'
        }
      });

      if (error) {
        console.error('❌ Server-side encryption failed:', error);
        throw new Error(`Failed to encrypt API key: ${error.message}`);
      }

      if (!data?.success || !data?.encryptedKey) {
        throw new Error('Server-side encryption returned invalid response');
      }

      console.log('✅ API key encrypted successfully (server-side)');
      return data.encryptedKey;
    } catch (error: any) {
      console.error('❌ Encryption error:', error);
      throw new Error(`Failed to encrypt API key: ${error.message}`);
    }
  }

  /**
   * Decrypts an API key server-side
   * Uses the secure-api-key edge function for proper decryption
   */
  static async decrypt(encryptedData: string, userId: string): Promise<string> {
    try {
      console.log('🔓 Decrypting API key server-side...');
      
      const { data, error } = await supabase.functions.invoke('secure-api-key', {
        body: {
          action: 'decrypt',
          encryptedKey: encryptedData,
          service: 'api_key'
        }
      });

     // When edge function returns 400, Supabase puts response in error.context
     if (error) {
       console.error('❌ Server-side decryption failed:', error);
       
       // Check if error contains the requiresReentry flag
       const errorContext = (error as any).context;
       if (errorContext?.requiresReentry || 
           errorContext?.error?.includes('legacy') || 
           errorContext?.error?.includes('re-entry')) {
         console.warn('⚠️ Legacy key format detected in error response');
         const legacyError = new Error('LEGACY_KEY_REQUIRES_REENTRY');
         (legacyError as any).requiresReentry = true;
         throw legacyError;
       }
       
       throw new Error(`Failed to decrypt API key: ${error.message}`);
     }

     // Check for legacy key format that requires re-entry (success case)
     if (data?.requiresReentry) {
       console.warn('⚠️ Legacy key format detected - requires re-entry');
       const legacyError = new Error('LEGACY_KEY_REQUIRES_REENTRY');
       (legacyError as any).requiresReentry = true;
       throw legacyError;
     }

     if (!data?.success || !data?.apiKey) {
       // Check if it's a legacy format error in the response
       if (data?.error?.includes('legacy') || data?.error?.includes('re-entry')) {
         const legacyError = new Error('LEGACY_KEY_REQUIRES_REENTRY');
         (legacyError as any).requiresReentry = true;
         throw legacyError;
       }
       throw new Error('Server-side decryption returned invalid response');
     }

      console.log('✅ API key decrypted successfully (server-side)');
      return data.apiKey;
    } catch (error: any) {
      // Re-throw legacy key errors with the flag preserved
      if (error.message === 'LEGACY_KEY_REQUIRES_REENTRY' || error.requiresReentry) {
        throw error;
      }
      console.error('❌ Decryption error:', error);
      throw new Error(`Failed to decrypt API key: ${error.message}`);
    }
  }

  /**
   * Decrypt and call an API in one server-side operation
   * The plaintext key never leaves the server
   */
  static async decryptAndCall(
    encryptedKey: string, 
    service: string, 
    endpoint: string, 
    params?: Record<string, unknown>
  ): Promise<any> {
    try {
      console.log(`🔓 Calling ${service} API with server-side key decryption...`);
      
      const { data, error } = await supabase.functions.invoke('secure-api-key', {
        body: {
          action: 'decrypt_and_call',
          encryptedKey,
          service,
          endpoint,
          params
        }
      });

      if (error) {
        console.error('❌ Server-side API call failed:', error);
        throw new Error(`API call failed: ${error.message}`);
      }

      console.log('✅ Server-side API call completed');
      return data;
    } catch (error: any) {
      console.error('❌ API call error:', error);
      throw error;
    }
  }

  /**
   * Legacy client-side decryption (for backward compatibility only)
   * @deprecated Use server-side operations instead
   */
  private static async legacyDecrypt(encryptedData: string, userId: string): Promise<string> {
    if (!SecureEncryption.isWebCryptoAvailable()) {
      throw new Error('Web Crypto API is not supported in this browser');
    }

    // Decode base64
    const combinedBuffer = SecureEncryption.base64ToArrayBuffer(encryptedData);
    const combined = new Uint8Array(combinedBuffer);
    
    // Validate minimum length
    const SALT_LENGTH = 32;
    const IV_LENGTH = 12;
    if (combined.length < SALT_LENGTH + IV_LENGTH + 1) {
      throw new Error('Encrypted data appears to be corrupted or incomplete');
    }
    
    // Extract salt, IV, and encrypted data
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const encrypted = combined.slice(SALT_LENGTH + IV_LENGTH);
    
    // Derive key - using a placeholder for backward compatibility
    // New keys will be encrypted server-side and won't need this
    const masterPassword = `${userId}_legacy_migration`;
    const key = await SecureEncryption.deriveKey(masterPassword, salt);
    
    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    return new TextDecoder().decode(decrypted);
  }

  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private static async deriveKey(password: string, salt: BufferSource): Promise<CryptoKey> {
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
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Migrates old encrypted keys to new server-side encryption
   */
  static async migrateKey(oldEncryptedKey: string, userId: string): Promise<string> {
    console.log('🔄 Migrating API key to server-side encryption...');
    console.warn('⚠️ Old encryption format detected. Please re-enter your API key for enhanced security.');
    throw new Error('Key migration required - please re-enter your API key');
  }
}

// Export the encryption functions
export const encryptApiKey = SecureEncryption.encrypt;
export const decryptApiKey = SecureEncryption.decrypt;
export const decryptAndCallApi = SecureEncryption.decryptAndCall;
export const migrateApiKey = SecureEncryption.migrateKey;
