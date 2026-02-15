
-- Add description columns to journeys and engage_automations
ALTER TABLE public.journeys ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.engage_automations ADD COLUMN IF NOT EXISTS description text;
