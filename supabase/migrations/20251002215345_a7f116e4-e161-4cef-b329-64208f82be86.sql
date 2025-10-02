-- Phase 5: Advanced AI Personalization & Machine Learning
-- Database Schema for ML, Predictions, and Personalization

-- ML Models: Store trained model metadata and configurations
CREATE TABLE public.ml_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  model_name TEXT NOT NULL,
  model_type TEXT NOT NULL, -- 'content_prediction', 'workflow_optimization', 'behavior_analysis', 'recommendation'
  model_version TEXT NOT NULL DEFAULT '1.0.0',
  training_data_source TEXT NOT NULL, -- 'content_analytics', 'workflow_executions', 'user_behavior', etc.
  model_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  training_metrics JSONB DEFAULT '{}'::jsonb, -- accuracy, precision, recall, etc.
  status TEXT NOT NULL DEFAULT 'training', -- 'training', 'active', 'inactive', 'failed'
  accuracy_score FLOAT,
  last_trained_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prediction Results: Store prediction outcomes
CREATE TABLE public.prediction_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  model_id UUID REFERENCES public.ml_models(id) ON DELETE CASCADE,
  prediction_type TEXT NOT NULL, -- 'content_performance', 'workflow_duration', 'serp_position', 'team_productivity'
  target_entity_id UUID, -- content_id, workflow_id, etc.
  target_entity_type TEXT, -- 'content', 'workflow', 'keyword', etc.
  predicted_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence_score FLOAT,
  actual_values JSONB DEFAULT '{}'::jsonb, -- filled in after actual event occurs
  prediction_accuracy FLOAT, -- calculated after actual values are known
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- User Behavior Patterns: Detailed behavioral tracking for ML
CREATE TABLE public.user_behavior_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pattern_type TEXT NOT NULL, -- 'navigation', 'content_creation', 'workflow_usage', 'feature_usage'
  pattern_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  frequency_score FLOAT DEFAULT 0,
  recency_score FLOAT DEFAULT 0,
  importance_score FLOAT DEFAULT 0,
  time_of_day_pattern JSONB DEFAULT '[]'::jsonb, -- hourly usage patterns
  day_of_week_pattern JSONB DEFAULT '[]'::jsonb, -- weekly usage patterns
  session_duration_avg INTEGER, -- average session duration in seconds
  features_used JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personalization Profiles: User-specific AI preferences
CREATE TABLE public.personalization_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  ai_personality_preference TEXT DEFAULT 'professional', -- 'professional', 'friendly', 'concise', 'detailed'
  preferred_content_types JSONB DEFAULT '[]'::jsonb,
  preferred_workflows JSONB DEFAULT '[]'::jsonb,
  learning_style TEXT DEFAULT 'balanced', -- 'visual', 'textual', 'hands-on', 'balanced'
  expertise_level TEXT DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced', 'expert'
  automation_preference TEXT DEFAULT 'balanced', -- 'manual', 'balanced', 'automated'
  notification_preferences JSONB DEFAULT '{}'::jsonb,
  ui_preferences JSONB DEFAULT '{}'::jsonb,
  custom_ai_instructions TEXT,
  success_metrics JSONB DEFAULT '{}'::jsonb, -- what success means for this user
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Performance Predictions: Forecasted content metrics
CREATE TABLE public.content_performance_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_id UUID,
  keyword TEXT,
  predicted_impressions INTEGER,
  predicted_clicks INTEGER,
  predicted_ctr FLOAT,
  predicted_position FLOAT,
  predicted_engagement_score FLOAT,
  confidence_interval JSONB DEFAULT '{}'::jsonb, -- min/max ranges
  prediction_date DATE NOT NULL,
  prediction_horizon TEXT NOT NULL, -- '7_days', '30_days', '90_days'
  factors JSONB DEFAULT '[]'::jsonb, -- factors contributing to prediction
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Predictions: Predicted workflow outcomes
CREATE TABLE public.workflow_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workflow_id UUID,
  workflow_type TEXT NOT NULL,
  predicted_duration INTEGER, -- in seconds
  predicted_completion_date TIMESTAMP WITH TIME ZONE,
  predicted_bottlenecks JSONB DEFAULT '[]'::jsonb,
  predicted_resource_needs JSONB DEFAULT '{}'::jsonb,
  predicted_success_probability FLOAT,
  risk_factors JSONB DEFAULT '[]'::jsonb,
  optimization_suggestions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automation Triggers: Smart automation rules learned from behavior
CREATE TABLE public.automation_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  trigger_name TEXT NOT NULL,
  trigger_type TEXT NOT NULL, -- 'time_based', 'event_based', 'condition_based', 'ml_predicted'
  trigger_conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
  action_type TEXT NOT NULL, -- 'content_schedule', 'workflow_start', 'notification', 'analysis'
  action_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  confidence_threshold FLOAT DEFAULT 0.7,
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recommendation Cache: Personalized recommendations
CREATE TABLE public.recommendation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recommendation_type TEXT NOT NULL, -- 'content_topic', 'workflow', 'feature', 'learning', 'optimization'
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  relevance_scores JSONB DEFAULT '[]'::jsonb,
  generation_method TEXT NOT NULL, -- 'ml_model', 'collaborative_filtering', 'content_based', 'hybrid'
  personalization_factors JSONB DEFAULT '[]'::jsonb,
  cache_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  interaction_tracking JSONB DEFAULT '{}'::jsonb, -- click, dismiss, accept rates
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Behavioral Analytics Sessions: Detailed session tracking
CREATE TABLE public.behavioral_analytics_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL,
  session_end TIMESTAMP WITH TIME ZONE,
  session_duration INTEGER, -- in seconds
  pages_visited JSONB DEFAULT '[]'::jsonb,
  actions_performed JSONB DEFAULT '[]'::jsonb,
  features_used JSONB DEFAULT '[]'::jsonb,
  workflows_completed JSONB DEFAULT '[]'::jsonb,
  content_created INTEGER DEFAULT 0,
  ai_interactions_count INTEGER DEFAULT 0,
  productivity_score FLOAT,
  engagement_score FLOAT,
  session_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adaptive UI State: Store learned UI preferences
CREATE TABLE public.adaptive_ui_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  preferred_layout TEXT DEFAULT 'default', -- 'default', 'compact', 'expanded'
  widget_positions JSONB DEFAULT '{}'::jsonb,
  collapsed_sections JSONB DEFAULT '[]'::jsonb,
  favorite_features JSONB DEFAULT '[]'::jsonb,
  quick_access_items JSONB DEFAULT '[]'::jsonb,
  theme_preferences JSONB DEFAULT '{}'::jsonb,
  dashboard_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_ml_models_user ON public.ml_models(user_id);
CREATE INDEX idx_ml_models_type ON public.ml_models(model_type);
CREATE INDEX idx_ml_models_status ON public.ml_models(status);

CREATE INDEX idx_prediction_results_user ON public.prediction_results(user_id);
CREATE INDEX idx_prediction_results_model ON public.prediction_results(model_id);
CREATE INDEX idx_prediction_results_type ON public.prediction_results(prediction_type);
CREATE INDEX idx_prediction_results_entity ON public.prediction_results(target_entity_id, target_entity_type);

CREATE INDEX idx_user_behavior_patterns_user ON public.user_behavior_patterns(user_id);
CREATE INDEX idx_user_behavior_patterns_type ON public.user_behavior_patterns(pattern_type);

CREATE INDEX idx_content_performance_predictions_user ON public.content_performance_predictions(user_id);
CREATE INDEX idx_content_performance_predictions_date ON public.content_performance_predictions(prediction_date);
CREATE INDEX idx_content_performance_predictions_content ON public.content_performance_predictions(content_id);

CREATE INDEX idx_workflow_predictions_user ON public.workflow_predictions(user_id);
CREATE INDEX idx_workflow_predictions_workflow ON public.workflow_predictions(workflow_id);

CREATE INDEX idx_automation_triggers_user ON public.automation_triggers(user_id);
CREATE INDEX idx_automation_triggers_active ON public.automation_triggers(is_active);

CREATE INDEX idx_recommendation_cache_user ON public.recommendation_cache(user_id);
CREATE INDEX idx_recommendation_cache_type ON public.recommendation_cache(recommendation_type);
CREATE INDEX idx_recommendation_cache_expires ON public.recommendation_cache(cache_expires_at);

CREATE INDEX idx_behavioral_analytics_sessions_user ON public.behavioral_analytics_sessions(user_id);
CREATE INDEX idx_behavioral_analytics_sessions_start ON public.behavioral_analytics_sessions(session_start);

-- RLS Policies
ALTER TABLE public.ml_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalization_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_performance_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_ui_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own ML models" ON public.ml_models FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own predictions" ON public.prediction_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own behavior patterns" ON public.user_behavior_patterns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own personalization" ON public.personalization_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own content predictions" ON public.content_performance_predictions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own workflow predictions" ON public.workflow_predictions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own automation triggers" ON public.automation_triggers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own recommendations" ON public.recommendation_cache FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own analytics sessions" ON public.behavioral_analytics_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own UI state" ON public.adaptive_ui_state FOR ALL USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_ml_models_updated_at
  BEFORE UPDATE ON public.ml_models
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_behavior_patterns_updated_at
  BEFORE UPDATE ON public.user_behavior_patterns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_personalization_profiles_updated_at
  BEFORE UPDATE ON public.personalization_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_automation_triggers_updated_at
  BEFORE UPDATE ON public.automation_triggers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_adaptive_ui_state_updated_at
  BEFORE UPDATE ON public.adaptive_ui_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();