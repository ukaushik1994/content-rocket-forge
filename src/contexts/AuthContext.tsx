
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: { firstName?: string; lastName?: string; avatarUrl?: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>({
    id: 'demo-user-id',
    app_metadata: {},
    user_metadata: {
      first_name: 'Demo',
      last_name: 'User',
      avatar_url: null
    },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    role: 'authenticated',
    email: 'demo@example.com'
  } as User);
  
  const [session, setSession] = useState<Session | null>({
    access_token: 'demo-access-token',
    refresh_token: 'demo-refresh-token',
    expires_in: 3600,
    expires_at: new Date().getTime() + 3600000,
    token_type: 'bearer',
    user: user
  } as Session);
  
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    toast.success('Signed in successfully!');
    return Promise.resolve();
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    toast.success('Account created successfully!');
    return Promise.resolve();
  };

  const signOut = async () => {
    toast.success('Signed out successfully!');
    return Promise.resolve();
  };

  const updateProfile = async (data: { firstName?: string; lastName?: string; avatarUrl?: string }) => {
    toast.success('Profile updated!');
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
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
