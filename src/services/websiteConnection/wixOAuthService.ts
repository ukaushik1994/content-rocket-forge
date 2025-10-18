const WIX_AUTH_URL = 'https://www.wix.com/oauth/authorize';
const WIX_CLIENT_ID = import.meta.env.VITE_WIX_CLIENT_ID || 'your-wix-client-id';

export interface WixOAuthResult {
  success: boolean;
  error?: string;
}

/**
 * Initiates Wix OAuth flow in a popup window
 */
export async function initiateWixOAuth(): Promise<WixOAuthResult> {
  return new Promise((resolve) => {
    // Generate random state for CSRF protection
    const state = generateRandomState();
    sessionStorage.setItem('wix_oauth_state', state);

    // Build OAuth URL
    const redirectUri = `${window.location.origin}/wix-callback`;
    const authUrl = new URL(WIX_AUTH_URL);
    authUrl.searchParams.set('client_id', WIX_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', state);
    
    // Request blog management permissions
    authUrl.searchParams.set('scope', 'blog.read,blog.write');

    // Open OAuth popup
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const popup = window.open(
      authUrl.toString(),
      'Wix OAuth',
      `width=${width},height=${height},left=${left},top=${top},resizable,scrollbars`
    );

    if (!popup) {
      resolve({
        success: false,
        error: 'Failed to open OAuth popup. Please check if popups are blocked.',
      });
      return;
    }

    // Listen for messages from the callback page
    const messageHandler = (event: MessageEvent) => {
      // Verify origin
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === 'WIX_OAUTH_SUCCESS') {
        window.removeEventListener('message', messageHandler);
        popup.close();
        sessionStorage.removeItem('wix_oauth_state');
        resolve({ success: true });
      } else if (event.data.type === 'WIX_OAUTH_ERROR') {
        window.removeEventListener('message', messageHandler);
        popup.close();
        sessionStorage.removeItem('wix_oauth_state');
        resolve({
          success: false,
          error: event.data.error || 'OAuth failed',
        });
      }
    };

    window.addEventListener('message', messageHandler);

    // Check if popup was closed
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        sessionStorage.removeItem('wix_oauth_state');
        resolve({
          success: false,
          error: 'OAuth popup was closed',
        });
      }
    }, 500);

    // Timeout after 5 minutes
    setTimeout(() => {
      if (!popup.closed) {
        clearInterval(checkClosed);
        popup.close();
        window.removeEventListener('message', messageHandler);
        sessionStorage.removeItem('wix_oauth_state');
        resolve({
          success: false,
          error: 'OAuth timeout',
        });
      }
    }, 5 * 60 * 1000);
  });
}

/**
 * Generates a random state string for CSRF protection
 */
function generateRandomState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates the OAuth state parameter
 */
export function validateOAuthState(state: string): boolean {
  const savedState = sessionStorage.getItem('wix_oauth_state');
  return savedState === state;
}
