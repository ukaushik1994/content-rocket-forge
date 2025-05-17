
// Re-export everything from the individual files
export * from './types';
export * from './storage';
export * from './promptTemplates';
export * from './brandGuidelines';
export * from './defaultTemplates';

// Import the supabase client for the original import, even though it's not used
import { supabase } from "@/integrations/supabase/client";
