import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { validateOAuthState } from '@/services/websiteConnection/wixOAuthService';
import { Loader2 } from 'lucide-react';

export default function WixCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const error = params.get('error');

      // Handle errors from Wix
      if (error) {
        window.opener?.postMessage(
          { type: 'WIX_OAUTH_ERROR', error: error },
          window.location.origin
        );
        return;
      }

      // Validate state for CSRF protection
      if (!state || !validateOAuthState(state)) {
        window.opener?.postMessage(
          { type: 'WIX_OAUTH_ERROR', error: 'Invalid state parameter' },
          window.location.origin
        );
        return;
      }

      if (!code) {
        window.opener?.postMessage(
          { type: 'WIX_OAUTH_ERROR', error: 'No authorization code received' },
          window.location.origin
        );
        return;
      }

      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('Not authenticated');
        }

        // Call edge function to exchange code for tokens
        const { data, error: functionError } = await supabase.functions.invoke(
          'wix-oauth-callback',
          {
            body: { code, state },
          }
        );

        if (functionError || !data?.success) {
          throw new Error(data?.error || 'Failed to connect Wix site');
        }

        // Notify parent window of success
        window.opener?.postMessage(
          { type: 'WIX_OAUTH_SUCCESS' },
          window.location.origin
        );
        
      } catch (err) {
        console.error('Wix OAuth callback error:', err);
        window.opener?.postMessage(
          { 
            type: 'WIX_OAUTH_ERROR', 
            error: err instanceof Error ? err.message : 'Unknown error'
          },
          window.location.origin
        );
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Connecting to Wix...</p>
      </div>
    </div>
  );
}
