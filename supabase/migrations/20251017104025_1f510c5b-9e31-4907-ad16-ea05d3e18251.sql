-- Add unique constraint for keyword upserts to work properly
ALTER TABLE unified_keywords 
  ADD CONSTRAINT unified_keywords_user_keyword_unique 
  UNIQUE (user_id, keyword);