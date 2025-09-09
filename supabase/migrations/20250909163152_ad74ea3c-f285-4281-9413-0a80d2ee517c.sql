-- Add source proposal tracking columns to content_calendar
ALTER TABLE public.content_calendar 
ADD COLUMN source_proposal_id UUID,
ADD COLUMN proposal_data JSONB;

-- Add comment for clarity
COMMENT ON COLUMN public.content_calendar.source_proposal_id IS 'References the original AI proposal that generated this calendar item';
COMMENT ON COLUMN public.content_calendar.proposal_data IS 'Stores original proposal data for restoration if content becomes overdue';