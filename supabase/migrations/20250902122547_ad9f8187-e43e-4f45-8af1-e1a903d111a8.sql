-- Check if persona_type enum exists, create if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'persona_type') THEN
        CREATE TYPE public.persona_type AS ENUM ('end_user', 'decision_maker', 'influencer');
    END IF;
END$$;

-- Update solution_personas table to use the correct column name and type
ALTER TABLE public.solution_personas 
  DROP COLUMN IF EXISTS persona_category,
  ADD COLUMN IF NOT EXISTS persona_type persona_type;

-- Add constraint to ensure persona_type is not null
ALTER TABLE public.solution_personas 
  ALTER COLUMN persona_type SET NOT NULL;

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'solution_personas_solution_id_persona_type_key') THEN
        ALTER TABLE public.solution_personas ADD CONSTRAINT solution_personas_solution_id_persona_type_key UNIQUE(solution_id, persona_type);
    END IF;
END$$;