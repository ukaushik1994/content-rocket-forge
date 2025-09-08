-- Enable Row Level Security on notification_categories table
ALTER TABLE public.notification_categories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read notification categories
-- This table appears to contain reference data that should be readable by all authenticated users
CREATE POLICY "Anyone can read notification categories" 
ON public.notification_categories 
FOR SELECT 
USING (true);

-- Restrict insert/update/delete to only admin users or system operations
-- Since this appears to be a reference/lookup table, only admins should modify it
CREATE POLICY "Only admins can modify notification categories" 
ON public.notification_categories 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));