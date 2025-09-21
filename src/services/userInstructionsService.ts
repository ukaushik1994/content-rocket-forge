import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserInstruction {
  id: string;
  user_id: string;
  content_id?: string;
  instruction_text: string;
  use_case: string;
  format_type?: string;
  session_id?: string;
  applied_count: number;
  effectiveness_score?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Save user instruction to database for future prompt enhancement
 */
export async function saveUserInstruction(
  instructionText: string,
  useCase: string = 'content_generation',
  formatType?: string,
  contentId?: string,
  sessionId?: string
): Promise<boolean> {
  try {
    if (!instructionText.trim()) {
      return false; // Don't save empty instructions
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('No authenticated user to save instruction');
      return false;
    }

    // Check if this exact instruction already exists for this user and use case
    const { data: existingInstructions } = await supabase
      .from('user_content_instructions')
      .select('id, applied_count')
      .eq('user_id', user.id)
      .eq('instruction_text', instructionText.trim())
      .eq('use_case', useCase)
      .limit(1);

    if (existingInstructions && existingInstructions.length > 0) {
      // Update existing instruction - increment applied count
      const { error } = await supabase
        .from('user_content_instructions')
        .update({ 
          applied_count: existingInstructions[0].applied_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingInstructions[0].id);

      if (error) {
        console.error('Failed to update existing instruction:', error);
        return false;
      }
      
      console.log('📝 Updated existing user instruction');
      return true;
    } else {
      // Create new instruction
      const { error } = await supabase
        .from('user_content_instructions')
        .insert({
          user_id: user.id,
          content_id: contentId,
          instruction_text: instructionText.trim(),
          use_case: useCase,
          format_type: formatType,
          session_id: sessionId,
          applied_count: 1
        });

      if (error) {
        console.error('Failed to save user instruction:', error);
        return false;
      }
      
      console.log('📝 Saved new user instruction for prompt enhancement');
      return true;
    }
  } catch (error) {
    console.error('Error saving user instruction:', error);
    return false;
  }
}

/**
 * Get recent user instructions for a specific use case
 */
export async function getRecentUserInstructions(
  useCase: string = 'content_generation',
  formatType?: string,
  limit: number = 10
): Promise<UserInstruction[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return [];
    }

    let query = supabase
      .from('user_content_instructions')
      .select('*')
      .eq('user_id', user.id)
      .eq('use_case', useCase)
      .order('applied_count', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (formatType) {
      query = query.eq('format_type', formatType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch user instructions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user instructions:', error);
    return [];
  }
}

/**
 * Get most effective user instructions based on usage patterns
 */
export async function getMostEffectiveInstructions(
  useCase: string = 'content_generation',
  formatType?: string,
  limit: number = 5
): Promise<UserInstruction[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return [];
    }

    let query = supabase
      .from('user_content_instructions')
      .select('*')
      .eq('user_id', user.id)
      .eq('use_case', useCase)
      .gte('applied_count', 2) // Only instructions used more than once
      .order('applied_count', { ascending: false })
      .limit(limit);

    if (formatType) {
      query = query.eq('format_type', formatType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch effective instructions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching effective instructions:', error);
    return [];
  }
}

/**
 * Delete a user instruction
 */
export async function deleteUserInstruction(instructionId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return false;
    }

    const { error } = await supabase
      .from('user_content_instructions')
      .delete()
      .eq('id', instructionId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to delete user instruction:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting user instruction:', error);
    return false;
  }
}