
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signUp: (email: string, password: string, redirectTo?: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: { display_name?: string; avatar_url?: string; first_name?: string; last_name?: string }) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Log security events
        if (session?.user) {
          if (event === 'SIGNED_IN') {
            console.log('Security event: User signed in', { userId: session.user.id, timestamp: new Date().toISOString() });
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('Security event: Token refreshed', { userId: session.user.id, timestamp: new Date().toISOString() });
          }
        }

        if (event === 'SIGNED_OUT') {
          console.log('Security event: User signed out', { timestamp: new Date().toISOString() });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password
      });
      
      if (error) {
        console.error('Sign in error:', error);
        toast.error(error.message);
      } else if (data.user) {
        console.log('Security event: Successful sign in', { userId: data.user.id, timestamp: new Date().toISOString() });
        toast.success('Welcome back!');
      }
      
      return { user: data.user, error };
    } catch (error: any) {
      console.error('Sign in exception:', error);
      toast.error('An unexpected error occurred');
      return { user: null, error };
    }
  };

  const signUp = async (email: string, password: string, redirectTo?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: redirectTo || `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        console.error('Sign up error:', error);
        toast.error(error.message);
      } else if (data.user) {
        console.log('Security event: New user registration', { userId: data.user.id, timestamp: new Date().toISOString() });
        toast.success('Account created! Please check your email to verify your account.');
      }
      
      return { user: data.user, error };
    } catch (error: any) {
      console.error('Sign up exception:', error);
      toast.error('An unexpected error occurred');
      return { user: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast.error(error.message);
      } else {
        console.log('Security event: User signed out', { timestamp: new Date().toISOString() });
        toast.success('Signed out successfully');
      }
    } catch (error: any) {
      console.error('Sign out exception:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      
      if (error) {
        console.error('Password reset error:', error);
        toast.error(error.message);
      } else {
        console.log('Security event: Password reset requested', { email, timestamp: new Date().toISOString() });
        toast.success('Password reset email sent!');
      }
      
      return { error };
    } catch (error: any) {
      console.error('Password reset exception:', error);
      toast.error('An unexpected error occurred');
      return { error };
    }
  };

  const updateProfile = async (updates: { display_name?: string; avatar_url?: string; first_name?: string; last_name?: string }) => {
    try {
      if (!user) {
        const error = new Error('User not authenticated');
        toast.error('You must be logged in to update your profile');
        return { error };
      }

      // Update the user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: updates.first_name,
          last_name: updates.last_name,
          display_name: updates.display_name
        }
      });

      if (authError) {
        console.error('Profile update error:', authError);
        toast.error('Failed to update profile');
        return { error: new Error(authError.message) };
      }

      // Also update profiles table if it exists
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: updates.display_name,
          avatar_url: updates.avatar_url,
          first_name: updates.first_name,
          last_name: updates.last_name,
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.warn('Profile table update error (this may be expected if table does not exist):', profileError);
      }

      console.log('Security event: Profile updated', { userId: user.id, timestamp: new Date().toISOString() });
      return { error: null };
    } catch (error: any) {
      console.error('Profile update exception:', error);
      toast.error('An unexpected error occurred');
      return { error };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
