-- Fix security: Set search_path on update_queue_timestamp function
CREATE OR REPLACE FUNCTION update_queue_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';