import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { getCorsHeaders } from '../shared/cors.ts';

// Server-side encryption key (from environment - never exposed to client)
const ENCRYPTION_KEY = Deno.env.get('API_KEY_ENCRYPTION_SECRET') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Input validation schemas
const EncryptSchema = z.object({
  action: z.literal('encrypt'),
  apiKey: z.string().min(10).max(500),
  service: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/)
});

const DecryptSchema = z.object({
  action: z.literal('decrypt'),
  encryptedKey: z.string().min(1).max(2000),
  service: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/)
});

const DecryptAndCallSchema = z.object({
  action: z.literal('decrypt_and_call'),
  encryptedKey: z.string().min(1).max(2000),
  service: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/),
  endpoint: z.string().min(1).max(100),
  params: z.record(z.unknown()).optional()
});

const RequestSchema = z.union([EncryptSchema, DecryptSchema, DecryptAndCallSchema]);

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

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
    ['encrypt', 'decrypt']
  );
}

async function encryptApiKey(plaintext: string, userId: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Derive key using server secret + user ID (user-specific key derivation)
  const masterPassword = `${ENCRYPTION_KEY}_${userId}`;
  const key = await deriveKey(masterPassword, salt);
  
  // Encrypt the data
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
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
}

async function decryptApiKey(encryptedData: string, userId: string): Promise<string> {
  // Validate the encrypted data format first
  let combined: Uint8Array;
  try {
    combined = new Uint8Array(
      atob(encryptedData).split('').map(c => c.charCodeAt(0))
    );
  } catch (e) {
    console.error('❌ Invalid base64 encoding in encrypted data');
    throw new Error('LEGACY_KEY_FORMAT');
  }
  
  // Minimum size: 32 (salt) + 12 (iv) + 16 (min AES-GCM tag) = 60 bytes
  if (combined.length < 60) {
    console.error('❌ Encrypted data too short - likely legacy format');
    throw new Error('LEGACY_KEY_FORMAT');
  }
  
  // Extract salt, IV, and encrypted data
  const salt = combined.slice(0, 32);
  const iv = combined.slice(32, 44);
  const encrypted = combined.slice(44);
  
  // AES-GCM requires at least 16 bytes for the auth tag
  if (encrypted.length < 16) {
    console.error('❌ Ciphertext too short for AES-GCM - likely legacy format');
    throw new Error('LEGACY_KEY_FORMAT');
  }
  
  // Derive key using server secret + user ID
  const masterPassword = `${ENCRYPTION_KEY}_${userId}`;
  const key = await deriveKey(masterPassword, salt);
  
  // Decrypt the data
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  );
  
  // Return decrypted string
  return new TextDecoder().decode(decrypted);
}

serve(async (req) => {
  console.log('🔐 Secure API Key Edge Function called');
  
  // Get origin for CORS
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate input
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validationResult = RequestSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: validationResult.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const request = validationResult.data;

    if (request.action === 'encrypt') {
      console.log(`🔒 Encrypting API key for service: ${request.service}`);
      
      const encryptedKey = await encryptApiKey(request.apiKey, user.id);
      
      console.log('✅ API key encrypted successfully');
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          encryptedKey,
          message: 'API key encrypted server-side'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (request.action === 'decrypt') {
      console.log(`🔓 Decrypting API key for service: ${request.service}`);
      
      try {
        const decryptedKey = await decryptApiKey(request.encryptedKey, user.id);
        
        console.log('✅ API key decrypted successfully');
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            apiKey: decryptedKey,
            message: 'API key decrypted server-side'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (decryptError: any) {
        console.error('❌ Decryption failed:', decryptError);
        
        // Check if it's a legacy/incompatible key format error
        const isLegacyKey = decryptError?.message === 'LEGACY_KEY_FORMAT' || 
                           decryptError?.message?.includes('Tag length overflows') ||
                           decryptError?.name === 'OperationError' ||
                           decryptError?.message?.includes('Decryption failed');
        
       // Return 200 with success:false for legacy keys so client can handle gracefully
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: isLegacyKey 
              ? 'API key requires re-entry (legacy encryption format)' 
              : 'Failed to decrypt API key',
            requiresReentry: isLegacyKey
          }),
         { 
           status: isLegacyKey ? 200 : 400, 
           headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
         }
        );
      }
    }

    if (request.action === 'decrypt_and_call') {
      console.log(`🔓 Decrypting and calling API for service: ${request.service}`);
      
      // Decrypt the key server-side (never return plaintext to client)
      const decryptedKey = await decryptApiKey(request.encryptedKey, user.id);
      
      // Call the api-proxy with the decrypted key
      const { data, error } = await supabase.functions.invoke('api-proxy', {
        body: {
          service: request.service,
          endpoint: request.endpoint,
          apiKey: decryptedKey,
          params: request.params
        }
      });
      
      if (error) {
        console.error('❌ API proxy call failed:', error);
        return new Response(
          JSON.stringify({ success: false, error: 'API call failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('✅ API call completed successfully');
      
      // Return the API response (key is never exposed)
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('💥 Secure API Key error:', error);
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'An unexpected error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
