
-- Phase 3b: Enable pg_net extension for cron HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule 4 background edge functions via pg_cron
-- engage-social-poster: every 5 minutes
SELECT cron.schedule(
  'engage-social-poster',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url:='https://iqiundzzcepmuykcnfbc.supabase.co/functions/v1/engage-social-poster',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxaXVuZHp6Y2VwbXV5a2NuZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMTU0MTYsImV4cCI6MjA2MTc5MTQxNn0.k3PVN3ETBJ-ho4gtmTf8XisS-FbTwzTaAc62nL6cFtA"}'::jsonb,
    body:=concat('{"time": "', now(), '"}')::jsonb
  ) AS request_id;
  $$
);

-- engage-journey-processor: every 10 minutes
SELECT cron.schedule(
  'engage-journey-processor',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url:='https://iqiundzzcepmuykcnfbc.supabase.co/functions/v1/engage-journey-processor',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxaXVuZHp6Y2VwbXV5a2NuZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMTU0MTYsImV4cCI6MjA2MTc5MTQxNn0.k3PVN3ETBJ-ho4gtmTf8XisS-FbTwzTaAc62nL6cFtA"}'::jsonb,
    body:=concat('{"time": "', now(), '"}')::jsonb
  ) AS request_id;
  $$
);

-- process-content-queue: every 5 minutes
SELECT cron.schedule(
  'process-content-queue',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url:='https://iqiundzzcepmuykcnfbc.supabase.co/functions/v1/process-content-queue',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxaXVuZHp6Y2VwbXV5a2NuZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMTU0MTYsImV4cCI6MjA2MTc5MTQxNn0.k3PVN3ETBJ-ho4gtmTf8XisS-FbTwzTaAc62nL6cFtA"}'::jsonb,
    body:=concat('{"time": "', now(), '"}')::jsonb
  ) AS request_id;
  $$
);

-- engage-job-runner: every 15 minutes
SELECT cron.schedule(
  'engage-job-runner',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url:='https://iqiundzzcepmuykcnfbc.supabase.co/functions/v1/engage-job-runner',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxaXVuZHp6Y2VwbXV5a2NuZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMTU0MTYsImV4cCI6MjA2MTc5MTQxNn0.k3PVN3ETBJ-ho4gtmTf8XisS-FbTwzTaAc62nL6cFtA"}'::jsonb,
    body:=concat('{"time": "', now(), '"}')::jsonb
  ) AS request_id;
  $$
);
