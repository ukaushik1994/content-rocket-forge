export interface WebsiteConnection {
  id: string;
  user_id: string;
  provider: 'wordpress' | 'wix';
  
  // WordPress fields
  site_url?: string;
  username?: string;
  app_password?: string;
  
  // Wix fields
  site_id?: string;
  refresh_token?: string;
  access_token?: string;
  token_expires_at?: string;
  site_name?: string;
  site_email?: string;
  scopes?: string[];
  
  // Common fields
  is_active: boolean;
  connection_status: 'unconfigured' | 'connected' | 'error' | 'testing';
  last_tested_at?: string;
  default_settings?: {
    status: 'draft' | 'publish' | 'future';
    categories: string[];
    tags: string[];
    auto_publish: boolean;
  };
  
  created_at: string;
  updated_at: string;
}

export interface SaveWordPressConnectionParams {
  siteUrl: string;
  username: string;
  appPassword: string;
  defaultSettings?: {
    status: 'draft' | 'publish' | 'future';
    categories: string[];
    tags: string[];
  };
}

export interface SaveWixConnectionParams {
  siteId: string;
  refreshToken: string;
  accessToken: string;
  expiresAt: Date;
  siteName: string;
  siteEmail: string;
  scopes: string[];
}