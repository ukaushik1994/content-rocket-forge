-- Enterprise Tables for Phase 4

-- Team workspaces table
CREATE TABLE public.team_workspaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{"allowInvites": true, "requireApproval": false, "maxMembers": 25}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Team members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.team_workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
  permissions JSONB NOT NULL DEFAULT '["content_create"]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- API keys table
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '["content:read"]'::jsonb,
  rate_limit INTEGER NOT NULL DEFAULT 1000,
  usage_count INTEGER NOT NULL DEFAULT 0,
  max_usage INTEGER NOT NULL DEFAULT 1000,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  last_used TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Webhooks table
CREATE TABLE public.webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  last_triggered TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Training datasets table
CREATE TABLE public.training_datasets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'training', 'error')),
  accuracy DECIMAL(5,2) DEFAULT 0.0,
  file_path TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Custom models table
CREATE TABLE public.custom_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dataset_id UUID REFERENCES public.training_datasets(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  base_model TEXT NOT NULL DEFAULT 'gpt-4',
  status TEXT NOT NULL DEFAULT 'training' CHECK (status IN ('training', 'ready', 'deployed', 'failed')),
  accuracy DECIMAL(5,2) DEFAULT 0.0,
  training_progress INTEGER DEFAULT 0 CHECK (training_progress >= 0 AND training_progress <= 100),
  use_case TEXT,
  model_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mobile settings table
CREATE TABLE public.mobile_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  pwa_enabled BOOLEAN NOT NULL DEFAULT true,
  offline_mode BOOLEAN NOT NULL DEFAULT true,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  notification_settings JSONB NOT NULL DEFAULT '{"chatUpdates": true, "contentReady": true, "teamMentions": true}'::jsonb,
  ui_settings JSONB NOT NULL DEFAULT '{"theme": "auto", "fontSize": 14, "compactMode": false}'::jsonb,
  performance_settings JSONB NOT NULL DEFAULT '{"imageQuality": "medium", "animationSpeed": 1, "batterySaver": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.team_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_workspaces
CREATE POLICY "Users can create their own workspaces" ON public.team_workspaces
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can view workspaces they own or are members of" ON public.team_workspaces
  FOR SELECT USING (
    auth.uid() = owner_id OR 
    id IN (SELECT workspace_id FROM public.team_members WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "Users can update workspaces they own" ON public.team_workspaces
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete workspaces they own" ON public.team_workspaces
  FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for team_members
CREATE POLICY "Users can create team members for workspaces they own" ON public.team_members
  FOR INSERT WITH CHECK (
    workspace_id IN (SELECT id FROM public.team_workspaces WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can view team members of workspaces they belong to" ON public.team_members
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM public.team_workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM public.team_members WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update team members in workspaces they own" ON public.team_members
  FOR UPDATE USING (
    workspace_id IN (SELECT id FROM public.team_workspaces WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can delete team members from workspaces they own" ON public.team_members
  FOR DELETE USING (
    workspace_id IN (SELECT id FROM public.team_workspaces WHERE owner_id = auth.uid())
  );

-- RLS Policies for api_keys
CREATE POLICY "Users can manage their own API keys" ON public.api_keys
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for webhooks
CREATE POLICY "Users can manage their own webhooks" ON public.webhooks
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for training_datasets
CREATE POLICY "Users can manage their own training datasets" ON public.training_datasets
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for custom_models
CREATE POLICY "Users can manage their own custom models" ON public.custom_models
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for mobile_settings
CREATE POLICY "Users can manage their own mobile settings" ON public.mobile_settings
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_team_workspaces_owner_id ON public.team_workspaces(owner_id);
CREATE INDEX idx_team_members_workspace_id ON public.team_members(workspace_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_webhooks_user_id ON public.webhooks(user_id);
CREATE INDEX idx_training_datasets_user_id ON public.training_datasets(user_id);
CREATE INDEX idx_custom_models_user_id ON public.custom_models(user_id);

-- Add updated_at triggers
CREATE TRIGGER update_team_workspaces_updated_at
  BEFORE UPDATE ON public.team_workspaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at
  BEFORE UPDATE ON public.webhooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_datasets_updated_at
  BEFORE UPDATE ON public.training_datasets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_models_updated_at
  BEFORE UPDATE ON public.custom_models
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mobile_settings_updated_at
  BEFORE UPDATE ON public.mobile_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();