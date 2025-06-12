
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'employee' | 'admin';

type UserProfile = {
  id: string;
  role: UserRole;
  department?: string;
  company_id?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: { firstName?: string; lastName?: string; avatarUrl?: string }) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user.id);
      setUserProfile(profile);
    }
  };

  useEffect(() => {
    // First set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          // Fetch user profile data
          setTimeout(async () => {
            const profile = await fetchUserProfile(newSession.user.id);
            setUserProfile(profile);
            setLoading(false);
          }, 0);
        } else {
          setUserProfile(null);
          setLoading(false);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        const profile = await fetchUserProfile(currentSession.user.id);
        setUserProfile(profile);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      // Include first_name and last_name in user metadata
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });
      
      if (error) throw error;
      
      toast.success('Signup successful! Please check your email for verification.');
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      toast.error(`Sign out failed: ${error.message}`);
    }
  };

  const updateProfile = async (data: { firstName?: string; lastName?: string; avatarUrl?: string }) => {
    if (!user) {
      throw new Error('User not logged in');
    }

    try {
      // First update the user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          avatar_url: data.avatarUrl,
        }
      });

      if (updateError) throw updateError;

      // Then update the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          avatar_url: data.avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Refresh the profile data
      await refreshProfile();

      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(`Profile update failed: ${error.message}`);
      throw error;
    }
  };

  const isAdmin = userProfile?.role === 'admin';
  const isEmployee = userProfile?.role === 'employee';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userProfile,
        loading,
        isAdmin,
        isEmployee,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
