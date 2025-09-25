-- Create A/B Testing Framework Tables

-- A/B Tests table - stores test configurations
CREATE TABLE public.ab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  test_type TEXT NOT NULL DEFAULT 'content' CHECK (test_type IN ('content', 'ui', 'serp', 'cta', 'layout')),
  target_metric TEXT NOT NULL DEFAULT 'conversion',
  confidence_level NUMERIC NOT NULL DEFAULT 0.95,
  minimum_sample_size INTEGER NOT NULL DEFAULT 100,
  traffic_allocation NUMERIC NOT NULL DEFAULT 1.0 CHECK (traffic_allocation >= 0 AND traffic_allocation <= 1),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- A/B Test Variants table - stores different variants for each test
CREATE TABLE public.ab_test_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.ab_tests(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_control BOOLEAN NOT NULL DEFAULT false,
  traffic_weight NUMERIC NOT NULL DEFAULT 0.5 CHECK (traffic_weight >= 0 AND traffic_weight <= 1),
  content_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- A/B Test Assignments table - tracks user assignments to variants
CREATE TABLE public.ab_test_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.ab_tests(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.ab_test_variants(id) ON DELETE CASCADE,
  user_id UUID,
  session_id TEXT,
  ip_hash TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent_hash TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(test_id, user_id),
  UNIQUE(test_id, session_id)
);

-- A/B Test Events table - tracks user interactions and conversions
CREATE TABLE public.ab_test_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.ab_tests(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.ab_test_variants(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES public.ab_test_assignments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_value NUMERIC,
  event_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID,
  session_id TEXT
);

-- A/B Test Results table - stores aggregated results and analysis
CREATE TABLE public.ab_test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.ab_tests(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.ab_test_variants(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  sample_size INTEGER NOT NULL DEFAULT 0,
  conversion_count INTEGER NOT NULL DEFAULT 0,
  conversion_rate NUMERIC NOT NULL DEFAULT 0,
  confidence_interval JSONB,
  statistical_significance NUMERIC,
  p_value NUMERIC,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(test_id, variant_id, metric_name)
);

-- Enable Row Level Security
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ab_tests
CREATE POLICY "Users can manage their own A/B tests" ON public.ab_tests
FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for ab_test_variants
CREATE POLICY "Users can manage variants for their tests" ON public.ab_test_variants
FOR ALL USING (test_id IN (SELECT id FROM public.ab_tests WHERE user_id = auth.uid()));

-- RLS Policies for ab_test_assignments
CREATE POLICY "Users can view assignments for their tests" ON public.ab_test_assignments
FOR SELECT USING (test_id IN (SELECT id FROM public.ab_tests WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can create assignments" ON public.ab_test_assignments
FOR INSERT WITH CHECK (true);

-- RLS Policies for ab_test_events
CREATE POLICY "Users can view events for their tests" ON public.ab_test_events
FOR SELECT USING (test_id IN (SELECT id FROM public.ab_tests WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can create events" ON public.ab_test_events
FOR INSERT WITH CHECK (true);

-- RLS Policies for ab_test_results
CREATE POLICY "Users can manage results for their tests" ON public.ab_test_results
FOR ALL USING (test_id IN (SELECT id FROM public.ab_tests WHERE user_id = auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_ab_tests_user_id ON public.ab_tests(user_id);
CREATE INDEX idx_ab_tests_status ON public.ab_tests(status);
CREATE INDEX idx_ab_test_variants_test_id ON public.ab_test_variants(test_id);
CREATE INDEX idx_ab_test_assignments_test_id ON public.ab_test_assignments(test_id);
CREATE INDEX idx_ab_test_assignments_user_id ON public.ab_test_assignments(user_id);
CREATE INDEX idx_ab_test_assignments_session_id ON public.ab_test_assignments(session_id);
CREATE INDEX idx_ab_test_events_test_id ON public.ab_test_events(test_id);
CREATE INDEX idx_ab_test_events_variant_id ON public.ab_test_events(variant_id);
CREATE INDEX idx_ab_test_events_created_at ON public.ab_test_events(created_at);
CREATE INDEX idx_ab_test_results_test_id ON public.ab_test_results(test_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_ab_tests_updated_at
BEFORE UPDATE ON public.ab_tests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ab_test_variants_updated_at
BEFORE UPDATE ON public.ab_test_variants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();