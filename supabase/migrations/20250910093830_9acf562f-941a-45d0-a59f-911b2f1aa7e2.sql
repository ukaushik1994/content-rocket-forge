-- Create realtime notifications table
CREATE TABLE IF NOT EXISTS public.realtime_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('content', 'performance', 'collaboration', 'system')),
  read BOOLEAN NOT NULL DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  action_url TEXT,
  action_label TEXT,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.realtime_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications" 
ON public.realtime_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" 
ON public.realtime_notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.realtime_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
ON public.realtime_notifications 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.realtime_notifications;

-- Create indexes for better performance
CREATE INDEX idx_realtime_notifications_user_id ON public.realtime_notifications(user_id);
CREATE INDEX idx_realtime_notifications_timestamp ON public.realtime_notifications(timestamp DESC);
CREATE INDEX idx_realtime_notifications_read ON public.realtime_notifications(read);

-- Create trigger for updated_at
CREATE TRIGGER update_realtime_notifications_updated_at
  BEFORE UPDATE ON public.realtime_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();