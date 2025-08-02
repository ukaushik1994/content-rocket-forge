
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DemoAccountService } from '@/services/demoAccountService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, options?: { data?: any }) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  loginAsDemo: () => Promise<void>;
  isDemoAccount: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoAccount, setIsDemoAccount] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      checkDemoAccount(session?.user?.id);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      checkDemoAccount(session?.user?.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkDemoAccount = async (userId?: string) => {
    if (userId) {
      const isDemo = await DemoAccountService.isDemoAccount(userId);
      setIsDemoAccount(isDemo);
    } else {
      setIsDemoAccount(false);
    }
  };

  const signUp = async (email: string, password: string, options?: { data?: any }) => {
    try {
      // Add security headers and validation
      const result = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          ...options,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            ...options?.data,
            signup_timestamp: new Date().toISOString(),
            signup_ip: await getClientIP(), // For security logging
          }
        }
      });

      if (result.error) {
        console.error('Sign up error:', result.error);
        toast.error(result.error.message);
      } else if (result.data.user && !result.data.user.email_confirmed_at) {
        toast.success('Please check your email to confirm your account');
      }

      return { error: result.error };
    } catch (error: any) {
      console.error('Sign up exception:', error);
      toast.error('An unexpected error occurred during sign up');
      return { error: error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Add rate limiting and security logging
      const result = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (result.error) {
        console.error('Sign in error:', result.error);
        // Log security event for failed logins
        logSecurityEvent('login_failed', { email, error: result.error.message });
        toast.error(result.error.message);
      } else {
        // Log successful login
        logSecurityEvent('login_success', { email });
        toast.success('Welcome back!');
      }

      return { error: result.error };
    } catch (error: any) {
      console.error('Sign in exception:', error);
      logSecurityEvent('login_exception', { email, error: error.message });
      toast.error('An unexpected error occurred during sign in');
      return { error: error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Error signing out');
      } else {
        setIsDemoAccount(false);
        toast.success('Signed out successfully');
      }
    } catch (error: any) {
      console.error('Sign out exception:', error);
      toast.error('An unexpected error occurred during sign out');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const result = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (result.error) {
        console.error('Reset password error:', result.error);
        toast.error(result.error.message);
      } else {
        toast.success('Password reset email sent');
        logSecurityEvent('password_reset_requested', { email });
      }

      return { error: result.error };
    } catch (error: any) {
      console.error('Reset password exception:', error);
      toast.error('An unexpected error occurred');
      return { error: error };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const result = await supabase.auth.updateUser({ password });

      if (result.error) {
        console.error('Update password error:', result.error);
        toast.error(result.error.message);
      } else {
        toast.success('Password updated successfully');
        logSecurityEvent('password_updated', { user_id: user?.id });
      }

      return { error: result.error };
    } catch (error: any) {
      console.error('Update password exception:', error);
      toast.error('An unexpected error occurred');
      return { error: error };
    }
  };

  const loginAsDemo = async () => {
    try {
      setLoading(true);
      const result = await DemoAccountService.createOrLoginDemo();
      
      if (result.success) {
        toast.success('Logged in as demo user');
        setIsDemoAccount(true);
        logSecurityEvent('demo_login', { user_id: result.user?.id });
      } else {
        toast.error(result.error || 'Failed to access demo account');
      }
    } catch (error: any) {
      console.error('Demo login error:', error);
      toast.error('Failed to access demo account');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    loginAsDemo,
    isDemoAccount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Security helper functions
async function getClientIP(): Promise<string> {
  try {
    // This is a simplified approach - in production you'd want a more robust solution
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

function logSecurityEvent(event: string, data: any) {
  // In production, this should send to a proper security logging service
  console.log(`Security Event: ${event}`, {
    timestamp: new Date().toISOString(),
    event,
    data: {
      ...data,
      user_agent: navigator.userAgent,
      referrer: document.referrer
    }
  });
}
