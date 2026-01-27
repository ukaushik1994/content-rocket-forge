-- Create onboarding_setup table to track business setup completion
CREATE TABLE public.onboarding_setup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_url TEXT,
  setup_data JSONB DEFAULT '{}'::jsonb,
  intel_status TEXT DEFAULT 'pending' CHECK (intel_status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.onboarding_setup ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own onboarding data
CREATE POLICY "Users can view their own onboarding setup"
  ON public.onboarding_setup FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding setup"
  ON public.onboarding_setup FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding setup"
  ON public.onboarding_setup FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_onboarding_setup_updated_at
  BEFORE UPDATE ON public.onboarding_setup
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add index for faster lookups
CREATE INDEX idx_onboarding_setup_user_id ON public.onboarding_setup(user_id);
CREATE INDEX idx_onboarding_setup_intel_status ON public.onboarding_setup(intel_status);