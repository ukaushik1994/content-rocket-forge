-- Create website_connections table for WordPress and Wix integrations
CREATE TABLE public.website_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('wordpress', 'wix')),
  
  -- WordPress fields
  site_url text,
  username text,
  app_password text, -- encrypted
  
  -- Wix OAuth fields
  site_id text,
  refresh_token text, -- encrypted
  access_token text, -- encrypted
  token_expires_at timestamptz,
  site_name text,
  site_email text,
  scopes text[],
  
  -- Common fields
  is_active boolean DEFAULT true NOT NULL,
  connection_status text DEFAULT 'unconfigured' CHECK (connection_status IN ('unconfigured', 'connected', 'error', 'testing')),
  last_tested_at timestamptz,
  
  -- Default publishing settings
  default_settings jsonb DEFAULT '{
    "status": "draft",
    "categories": [],
    "tags": [],
    "auto_publish": false
  }'::jsonb,
  
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Ensure one connection per provider per user
  UNIQUE(user_id, provider)
);

-- Enable RLS
ALTER TABLE public.website_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own connections"
  ON public.website_connections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connections"
  ON public.website_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections"
  ON public.website_connections
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections"
  ON public.website_connections
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_website_connections_user_id ON public.website_connections(user_id);
CREATE INDEX idx_website_connections_provider ON public.website_connections(provider);

-- Trigger for updated_at
CREATE TRIGGER update_website_connections_updated_at
  BEFORE UPDATE ON public.website_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();