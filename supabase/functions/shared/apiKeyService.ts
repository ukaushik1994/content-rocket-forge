import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ENCRYPTION_KEY = Deno.env.get('API_KEY_ENCRYPTION_SECRET') || supabaseServiceKey;

// Encryption utilities using Web Crypto API
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
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
    ['decrypt']
  );
}

async function decryptApiKey(encryptedData: string, userId: string): Promise<string> {
  let combined: Uint8Array;
  try {
    combined = new Uint8Array(
      atob(encryptedData).split('').map(c => c.charCodeAt(0))
    );
  } catch {
    console.error('❌ Invalid base64 encoding in encrypted key');
    throw new Error('LEGACY_KEY_FORMAT');
  }

  if (combined.length < 60) {
    throw new Error('LEGACY_KEY_FORMAT');
  }

  const salt = combined.slice(0, 32);
  const iv = combined.slice(32, 44);
  const encrypted = combined.slice(44);

  if (encrypted.length < 16) {
    throw new Error('LEGACY_KEY_FORMAT');
  }

  const masterPassword = `${ENCRYPTION_KEY}_${userId}`;
  const key = await deriveKey(masterPassword, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
}

export async function getApiKey(service: string, userId?: string): Promise<string | null> {
  try {
    if (!userId) {
      console.log(`No user ID provided for ${service} API key lookup`);
      return null;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('service', service)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.log(`No ${service} API key found for user ${userId}`);
      return null;
    }

    // Decrypt the key before returning
    try {
      const decryptedKey = await decryptApiKey(data.encrypted_key, userId);
      console.log(`✅ ${service} API key decrypted successfully`);
      return decryptedKey;
    } catch (decryptError: any) {
      if (decryptError.message === 'LEGACY_KEY_FORMAT') {
        console.warn(`⚠️ ${service} key appears to be legacy/unencrypted format, returning as-is`);
        return data.encrypted_key;
      }
      console.error(`❌ Failed to decrypt ${service} API key:`, decryptError);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching ${service} API key:`, error);
    return null;
  }
}
