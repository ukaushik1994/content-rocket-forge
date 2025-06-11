
import { corsHeaders } from './cors.ts';

/**
 * Helper function to create JWT for Google service accounts
 */
export async function createGoogleJWT(serviceAccount: any, scopes: string[]): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: scopes.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const encoder = new TextEncoder();
  
  // Encode header and payload
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  // Create signature
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  
  // Import private key
  const privateKey = serviceAccount.private_key.replace(/\\n/g, '\n');
  const keyData = await crypto.subtle.importKey(
    'pkcs8',
    new TextEncoder().encode(privateKey),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    keyData,
    encoder.encode(signingInput)
  );
  
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  return `${signingInput}.${encodedSignature}`;
}

/**
 * Helper function to get Google access token
 */
export async function getGoogleAccessToken(serviceAccount: any, scopes: string[]): Promise<string> {
  try {
    const jwt = await createGoogleJWT(serviceAccount, scopes);
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Failed to get access token: ${data.error_description || data.error}`);
    }
    
    return data.access_token;
  } catch (error: any) {
    console.error('Error getting Google access token:', error);
    throw new Error(`Authentication failed: ${error.message}`);
  }
}
