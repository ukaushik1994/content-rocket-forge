import { supabase } from "@/integrations/supabase/client";

export interface WizardContextExtraction {
  keyword: string;
  solution_id: string | null;
  content_type: string;
  tone: string;
  target_audience: string;
  content_goal: string;
  writing_style: string;
  specific_points: string[];
  additional_instructions: string;
}

interface ConversationMessage {
  role: string;
  content: string;
}

interface Solution {
  id: string;
  name: string;
}

/**
 * Call the extract-wizard-context edge function to parse user input
 * and conversation history into structured wizard fields.
 */
export async function extractWizardContext(
  userPrompt: string,
  conversationHistory: ConversationMessage[],
  solutions: Solution[]
): Promise<WizardContextExtraction> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    console.warn('No session for wizard context extraction, using defaults');
    return getDefaultExtraction(userPrompt);
  }

  try {
    const { data, error } = await supabase.functions.invoke('extract-wizard-context', {
      body: JSON.stringify({
        userPrompt,
        conversationHistory: conversationHistory.slice(-10),
        solutions,
      }),
    });

    if (error) {
      console.error('Wizard context extraction error:', error);
      return getDefaultExtraction(userPrompt);
    }

    return {
      keyword: data?.keyword || userPrompt,
      solution_id: data?.solution_id || null,
      content_type: data?.content_type || 'blog',
      tone: data?.tone || '',
      target_audience: data?.target_audience || '',
      content_goal: data?.content_goal || '',
      writing_style: data?.writing_style || 'conversational',
      specific_points: Array.isArray(data?.specific_points) ? data.specific_points : [],
      additional_instructions: data?.additional_instructions || '',
    };
  } catch (err) {
    console.error('Failed to extract wizard context:', err);
    return getDefaultExtraction(userPrompt);
  }
}

function getDefaultExtraction(userPrompt: string): WizardContextExtraction {
  return {
    keyword: userPrompt,
    solution_id: null,
    content_type: 'blog',
    tone: '',
    target_audience: '',
    content_goal: '',
    writing_style: 'conversational',
    specific_points: [],
    additional_instructions: '',
  };
}
