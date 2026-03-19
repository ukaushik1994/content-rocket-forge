
-- Phase 1: Add missing columns to existing tables

-- email_campaigns: add columns the edge functions try to insert
ALTER TABLE public.email_campaigns 
  ADD COLUMN IF NOT EXISTS subject text,
  ADD COLUMN IF NOT EXISTS body_html text,
  ADD COLUMN IF NOT EXISTS segment_id uuid,
  ADD COLUMN IF NOT EXISTS from_name text,
  ADD COLUMN IF NOT EXISTS from_email text;

-- journeys: add description and trigger_type
ALTER TABLE public.journeys 
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS trigger_type text DEFAULT 'manual';

-- journey_enrollments: add current_step_index
ALTER TABLE public.journey_enrollments 
  ADD COLUMN IF NOT EXISTS current_step_index integer DEFAULT 0;
