-- Create function to auto-update campaign status based on queue
CREATE OR REPLACE FUNCTION update_campaign_status_from_queue()
RETURNS TRIGGER AS $$
DECLARE
  total_items INTEGER;
  completed_items INTEGER;
  failed_items INTEGER;
  processing_items INTEGER;
  pending_items INTEGER;
BEGIN
  -- Count queue items for this campaign
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status = 'failed'),
    COUNT(*) FILTER (WHERE status = 'processing'),
    COUNT(*) FILTER (WHERE status = 'pending')
  INTO 
    total_items,
    completed_items,
    failed_items,
    processing_items,
    pending_items
  FROM content_generation_queue
  WHERE campaign_id = COALESCE(NEW.campaign_id, OLD.campaign_id);

  -- Update campaign status based on queue state
  IF total_items = 0 THEN
    -- No items in queue, set to draft
    UPDATE campaigns 
    SET status = 'draft', updated_at = NOW()
    WHERE id = COALESCE(NEW.campaign_id, OLD.campaign_id);
    
  ELSIF processing_items > 0 OR pending_items > 0 THEN
    -- Items are still being processed
    UPDATE campaigns 
    SET status = 'active', updated_at = NOW()
    WHERE id = COALESCE(NEW.campaign_id, OLD.campaign_id);
    
  ELSIF completed_items = total_items THEN
    -- All items completed successfully
    UPDATE campaigns 
    SET status = 'completed', updated_at = NOW()
    WHERE id = COALESCE(NEW.campaign_id, OLD.campaign_id);
    
  ELSIF failed_items = total_items THEN
    -- All items failed
    UPDATE campaigns 
    SET status = 'draft', updated_at = NOW()
    WHERE id = COALESCE(NEW.campaign_id, OLD.campaign_id);
    
  ELSE
    -- Mixed results (some completed, some failed)
    UPDATE campaigns 
    SET status = 'active', updated_at = NOW()
    WHERE id = COALESCE(NEW.campaign_id, OLD.campaign_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Create trigger on queue table
DROP TRIGGER IF EXISTS queue_status_update_campaign ON content_generation_queue;
CREATE TRIGGER queue_status_update_campaign
  AFTER INSERT OR UPDATE OR DELETE ON content_generation_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_status_from_queue();