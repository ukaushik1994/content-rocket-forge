-- Create intelligent workflows tables for Phase 4.1: Intelligent Workflow Orchestration

-- Table for storing workflow definitions and templates
CREATE TABLE public.intelligent_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  workflow_type TEXT NOT NULL DEFAULT 'custom', -- 'custom', 'template', 'ai_generated'
  category TEXT DEFAULT 'general', -- 'content', 'analysis', 'solution_integration', 'general'
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'archived', 'template'
  workflow_data JSONB NOT NULL DEFAULT '{}', -- Stores workflow steps, configuration
  solution_integrations JSONB DEFAULT '[]', -- Array of solution IDs used in workflow
  template_metadata JSONB DEFAULT '{}', -- For template workflows: tags, difficulty, etc
  success_metrics JSONB DEFAULT '{}', -- KPIs and success criteria
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for tracking workflow executions
CREATE TABLE public.workflow_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.intelligent_workflows(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  execution_name TEXT, -- Optional custom name for this execution
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'cancelled'
  progress JSONB NOT NULL DEFAULT '{"current_step": 0, "total_steps": 0, "completed_steps": []}',
  input_context JSONB DEFAULT '{}', -- Initial context/inputs for the workflow
  output_results JSONB DEFAULT '{}', -- Final results and artifacts
  error_details JSONB DEFAULT '{}', -- Error information if failed
  performance_metrics JSONB DEFAULT '{}', -- Execution time, success rate, etc
  ai_provider TEXT, -- Which AI provider was used
  ai_model TEXT, -- Which AI model was used
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for detailed step execution logging
CREATE TABLE public.workflow_steps_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  execution_id UUID NOT NULL REFERENCES public.workflow_executions(id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  step_type TEXT NOT NULL, -- 'ai_task', 'solution_integration', 'data_processing', 'user_input'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'skipped'
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  error_message TEXT,
  ai_prompt TEXT, -- If this step involved AI
  ai_response TEXT, -- AI response for this step
  solution_id TEXT, -- If this step used a specific solution
  execution_time_ms INTEGER, -- How long this step took
  retry_count INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for pre-built workflow templates
CREATE TABLE public.workflow_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  difficulty_level TEXT DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  estimated_duration TEXT, -- e.g., '15 minutes', '1 hour'
  template_data JSONB NOT NULL DEFAULT '{}', -- The workflow definition
  required_solutions JSONB DEFAULT '[]', -- Array of solution IDs required
  tags JSONB DEFAULT '[]', -- Searchable tags
  use_count INTEGER DEFAULT 0, -- Track popularity
  success_rate NUMERIC(5,2) DEFAULT 0, -- Success rate percentage
  is_public BOOLEAN DEFAULT true, -- Whether template is available to all users
  created_by UUID, -- User who created this template (nullable for system templates)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.intelligent_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for intelligent_workflows
CREATE POLICY "Users can view their own workflows"
ON public.intelligent_workflows
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflows"
ON public.intelligent_workflows
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflows"
ON public.intelligent_workflows
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflows"
ON public.intelligent_workflows
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for workflow_executions
CREATE POLICY "Users can view their own workflow executions"
ON public.workflow_executions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflow executions"
ON public.workflow_executions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflow executions"
ON public.workflow_executions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflow executions"
ON public.workflow_executions
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for workflow_steps_log
CREATE POLICY "Users can view logs for their workflow executions"
ON public.workflow_steps_log
FOR SELECT
USING (execution_id IN (
  SELECT id FROM public.workflow_executions WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create logs for their workflow executions"
ON public.workflow_steps_log
FOR INSERT
WITH CHECK (execution_id IN (
  SELECT id FROM public.workflow_executions WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update logs for their workflow executions"
ON public.workflow_steps_log
FOR UPDATE
USING (execution_id IN (
  SELECT id FROM public.workflow_executions WHERE user_id = auth.uid()
));

-- RLS Policies for workflow_templates
CREATE POLICY "Users can view public templates and their own templates"
ON public.workflow_templates
FOR SELECT
USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create their own templates"
ON public.workflow_templates
FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own templates"
ON public.workflow_templates
FOR UPDATE
USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own templates"
ON public.workflow_templates
FOR DELETE
USING (created_by = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_intelligent_workflows_user_id ON public.intelligent_workflows(user_id);
CREATE INDEX idx_intelligent_workflows_status ON public.intelligent_workflows(status);
CREATE INDEX idx_intelligent_workflows_category ON public.intelligent_workflows(category);

CREATE INDEX idx_workflow_executions_workflow_id ON public.workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_user_id ON public.workflow_executions(user_id);
CREATE INDEX idx_workflow_executions_status ON public.workflow_executions(status);

CREATE INDEX idx_workflow_steps_log_execution_id ON public.workflow_steps_log(execution_id);
CREATE INDEX idx_workflow_steps_log_status ON public.workflow_steps_log(status);

CREATE INDEX idx_workflow_templates_category ON public.workflow_templates(category);
CREATE INDEX idx_workflow_templates_is_public ON public.workflow_templates(is_public);

-- Create triggers for updated_at columns
CREATE TRIGGER update_intelligent_workflows_updated_at
  BEFORE UPDATE ON public.intelligent_workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER update_workflow_executions_updated_at
  BEFORE UPDATE ON public.workflow_executions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER update_workflow_templates_updated_at
  BEFORE UPDATE ON public.workflow_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

-- Insert some default workflow templates
INSERT INTO public.workflow_templates (name, description, category, difficulty_level, estimated_duration, template_data, required_solutions, tags) VALUES
('Content Strategy Workflow', 'Complete content strategy from keyword research to optimization', 'content', 'intermediate', '2 hours', 
 '{"steps": [{"name": "Keyword Research", "type": "ai_task", "description": "Analyze target keywords and competition"}, {"name": "Content Planning", "type": "ai_task", "description": "Create content outline and structure"}, {"name": "Content Creation", "type": "ai_task", "description": "Generate optimized content"}, {"name": "SEO Optimization", "type": "ai_task", "description": "Optimize for search engines"}, {"name": "Performance Tracking", "type": "solution_integration", "description": "Set up analytics tracking"}]}',
 '["content-optimizer", "seo-analyzer"]', '["content", "seo", "strategy"]'),

('Solution Integration Analysis', 'Analyze content and recommend optimal solution integrations', 'analysis', 'beginner', '30 minutes',
 '{"steps": [{"name": "Content Analysis", "type": "ai_task", "description": "Analyze existing content performance"}, {"name": "Solution Mapping", "type": "ai_task", "description": "Map content needs to available solutions"}, {"name": "Integration Planning", "type": "ai_task", "description": "Create integration roadmap"}, {"name": "Implementation Guide", "type": "ai_task", "description": "Generate step-by-step implementation guide"}]}',
 '[]', '["analysis", "integration", "solutions"]'),

('Performance Analytics Workflow', 'Comprehensive performance analysis and optimization recommendations', 'analysis', 'advanced', '1.5 hours',
 '{"steps": [{"name": "Data Collection", "type": "solution_integration", "description": "Gather performance data from all sources"}, {"name": "Trend Analysis", "type": "ai_task", "description": "Identify patterns and trends"}, {"name": "Competitive Analysis", "type": "ai_task", "description": "Compare against industry benchmarks"}, {"name": "Optimization Recommendations", "type": "ai_task", "description": "Generate actionable improvement suggestions"}, {"name": "Implementation Plan", "type": "ai_task", "description": "Create prioritized action plan"}]}',
 '["analytics-connector", "performance-tracker"]', '["analytics", "performance", "optimization"]');