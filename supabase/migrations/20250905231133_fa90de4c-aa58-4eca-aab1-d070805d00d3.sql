-- Enable leaked password protection for better security
-- This addresses the security warning detected after the previous migration

-- Enable leaked password protection in auth configuration
UPDATE auth.config SET
  enable_password_history = true,
  password_min_length = 8,
  enable_leaked_password_protection = true;