
import React, { createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
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

// Create a fixed default user and session that will always be provided
// Using a proper UUID format for the user ID
const defaultUser: User = {
  id: '00000000-0000-0000-0000-000000000000',
  app_metadata: {},
  user_metadata: {
    first_name: 'Default',
    last_name: 'User',
    avatar_url: null
  },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  role: 'authenticated',
  email: 'default@example.com'
};

const defaultSession: Session = {
  access_token: 'default-access-token',
  refresh_token: 'default-refresh-token',
  expires_in: 3600,
  expires_at: new Date().getTime() + 3600000,
  token_type: 'bearer',
  user: defaultUser
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Simply provide the default values - no state needed as we're removing authentication
  const loading = false;

  const signIn = async () => {
    toast.success('No authentication required!');
    return Promise.resolve();
  };

  const signUp = async () => {
    toast.success('No authentication required!');
    return Promise.resolve();
  };

  const signOut = async () => {
    toast.success('No authentication required!');
    return Promise.resolve();
  };

  const updateProfile = async () => {
    toast.success('Profile updated!');
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider
      value={{
        user: defaultUser,
        session: defaultSession,
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
