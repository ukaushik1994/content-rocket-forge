import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CallbackStatus = 'verifying' | 'success' | 'error';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<CallbackStatus>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        const errorParam = hashParams.get('error') || queryParams.get('error');
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');

        if (errorParam) {
          setStatus('error');
          setErrorMessage(errorDescription || errorParam);
          return;
        }

        const tokenHash = queryParams.get('token_hash');
        const type = queryParams.get('type');

        if (tokenHash && (type === 'email' || type === 'signup')) {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'email'
          });

          if (error) {
            setStatus('error');
            setErrorMessage(error.message);
            return;
          }

          if (data.session) {
            setStatus('success');
            setTimeout(() => {
              navigate('/ai-chat?welcome=true', { replace: true });
            }, 1500);
            return;
          }
        }

        const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            setStatus('error');
            setErrorMessage(error.message);
            return;
          }

          if (data.session) {
            setStatus('success');
            const isNewUser = !localStorage.getItem('creAiter-onboarding-completed');
            setTimeout(() => {
              navigate(isNewUser ? '/ai-chat?welcome=true' : '/ai-chat', { replace: true });
            }, 1500);
            return;
          }
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            setStatus('success');
            const isNewUser = !localStorage.getItem('creAiter-onboarding-completed');
            setTimeout(() => {
              navigate(isNewUser ? '/ai-chat?welcome=true' : '/ai-chat', { replace: true });
            }, 1500);
          }
        });

        const timeout = setTimeout(() => {
          if (status === 'verifying') {
            setStatus('error');
            setErrorMessage('Verification timed out. Please try signing in again.');
          }
        }, 10000);

        return () => {
          subscription.unsubscribe();
          clearTimeout(timeout);
        };
      } catch (error: any) {
        setStatus('error');
        setErrorMessage(error.message || 'An unexpected error occurred');
      }
    };

    handleCallback();
  }, [navigate, status]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-transparent border border-border/20 flex items-center justify-center">
            <Rocket className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>

        {/* Status Display */}
        <div className="bg-background/90 backdrop-blur-md rounded-2xl p-8 border border-border/10">
          {status === 'verifying' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Loader2 className="w-12 h-12 text-muted-foreground animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Verifying your email...
              </h2>
              <p className="text-muted-foreground text-sm">
                Please wait while we confirm your account.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Email verified! 🎉
              </h2>
              <p className="text-muted-foreground text-sm">
                Redirecting you to your dashboard...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <XCircle className="w-12 h-12 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Verification failed
              </h2>
              <p className="text-muted-foreground text-sm">
                {errorMessage || 'We couldn\'t verify your email. The link may have expired.'}
              </p>
              <div className="pt-4 space-y-3">
                <Button 
                  onClick={() => navigate('/auth')} 
                  className="w-full bg-foreground text-background hover:bg-foreground/90"
                >
                  Try signing in again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="w-full bg-transparent border-border/20 hover:border-border/40"
                >
                  Go to homepage
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground">
          Need help? Contact hello@creaiter.com
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
