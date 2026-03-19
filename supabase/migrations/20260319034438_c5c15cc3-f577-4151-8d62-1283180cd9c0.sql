-- Schedule daily proactive insights generation at 6 AM UTC
SELECT cron.schedule(
  'generate-proactive-insights-daily',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url:='https://iqiundzzcepmuykcnfbc.supabase.co/functions/v1/generate-proactive-insights',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxaXVuZHp6Y2VwbXV5a2NuZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMTU0MTYsImV4cCI6MjA2MTc5MTQxNn0.k3PVN3ETBJ-ho4gtmTf8XisS-FbTwzTaAc62nL6cFtA"}'::jsonb,
    body:='{"time": "daily"}'::jsonb
  ) as request_id;
  $$
);