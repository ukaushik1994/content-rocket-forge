import { GlossaryBuilderState, GlossaryBuilderAction, GlossaryBuilderContextType, Glossary, GlossaryTerm } from './types';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates and combines all glossary builder actions
 */
export const createGlossaryBuilderActions = (
  state: GlossaryBuilderState,
  dispatch: React.Dispatch<GlossaryBuilderAction>
): Omit<GlossaryBuilderContextType, 'state' | 'dispatch'> => {

  const createGlossary = async (name: string, description?: string): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const glossary: Glossary = {
        id: uuidv4(),
        name,
        description,
        isActive: true,
        terms: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { error } = await supabase
        .from('glossaries')
        .insert({
          id: glossary.id,
          user_id: user.id,
          name,
          description,
          is_active: true
        });

      if (error) throw error;

      dispatch({ type: 'ADD_GLOSSARY', payload: glossary });
    } catch (error) {
      console.error('Error creating glossary:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create glossary' });
    }
  };

  const updateGlossary = async (glossary: Glossary): Promise<void> => {
    try {
      const { error } = await supabase
        .from('glossaries')
        .update({
          name: glossary.name,
          description: glossary.description,
          domain_url: glossary.domainUrl,
          is_active: glossary.isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', glossary.id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_GLOSSARY', payload: glossary });
    } catch (error) {
      console.error('Error updating glossary:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update glossary' });
    }
  };

  const deleteGlossary = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('glossaries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      dispatch({ type: 'DELETE_GLOSSARY', payload: id });
    } catch (error) {
      console.error('Error deleting glossary:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete glossary' });
    }
  };

  const addTerm = async (term: GlossaryTerm): Promise<void> => {
    try {
      if (!state.currentGlossary) throw new Error('No active glossary');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('glossary_terms')
        .insert({
          id: term.id,
          glossary_id: state.currentGlossary.id,
          user_id: user.id,
          term: term.term,
          short_definition: term.shortDefinition,
          expanded_explanation: term.expandedExplanation,
          search_volume: term.searchVolume,
          keyword_difficulty: term.keywordDifficulty,
          related_terms: term.relatedTerms,
          paa_questions: term.paaQuestions,
          internal_links: term.internalLinks
        });

      if (error) throw error;

      dispatch({ type: 'ADD_TERM', payload: term });
    } catch (error) {
      console.error('Error adding term:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add term' });
    }
  };

  const updateTerm = async (term: GlossaryTerm): Promise<void> => {
    try {
      const { error } = await supabase
        .from('glossary_terms')
        .update({
          term: term.term,
          short_definition: term.shortDefinition,
          expanded_explanation: term.expandedExplanation,
          search_volume: term.searchVolume,
          keyword_difficulty: term.keywordDifficulty,
          related_terms: term.relatedTerms,
          paa_questions: term.paaQuestions,
          internal_links: term.internalLinks,
          last_updated: new Date().toISOString()
        })
        .eq('id', term.id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_TERM', payload: term });
    } catch (error) {
      console.error('Error updating term:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update term' });
    }
  };

  const deleteTerm = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('glossary_terms')
        .delete()
        .eq('id', id);

      if (error) throw error;

      dispatch({ type: 'DELETE_TERM', payload: id });
    } catch (error) {
      console.error('Error deleting term:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete term' });
    }
  };

  const generateDefinitions = async (terms: string[], solutionContext?: any): Promise<void> => {
    dispatch({ type: 'SET_GENERATING', payload: true });
    dispatch({ type: 'SET_GENERATION_PROGRESS', payload: 0 });
    
    try {
      // Call edge function to generate definitions
      const { data, error } = await supabase.functions.invoke('glossary-generator', {
        body: { 
          terms, 
          action: 'generate_definitions',
          solutionContext 
        }
      });

      if (error) throw error;

      // Process generated definitions and add terms with progress tracking
      const totalTerms = data.terms.length;
      for (let i = 0; i < data.terms.length; i++) {
        const termData = data.terms[i];
        const term: GlossaryTerm = {
          id: uuidv4(),
          term: termData.term,
          shortDefinition: termData.shortDefinition,
          expandedExplanation: termData.expandedExplanation,
          relatedTerms: termData.relatedTerms || [],
          paaQuestions: termData.paaQuestions || [],
          internalLinks: [],
          lastUpdated: new Date().toISOString(),
          status: 'completed'
        };
        
        await addTerm(term);
        
        // Update progress
        const progress = Math.round(((i + 1) / totalTerms) * 100);
        dispatch({ type: 'SET_GENERATION_PROGRESS', payload: progress });
      }
    } catch (error) {
      console.error('Error generating definitions:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate definitions' });
    } finally {
      dispatch({ type: 'SET_GENERATING', payload: false });
      dispatch({ type: 'SET_GENERATION_PROGRESS', payload: 0 });
    }
  };

  const analyzeDomain = async (url: string): Promise<void> => {
    dispatch({ type: 'SET_ANALYZING', payload: true });
    try {
      const { data, error } = await supabase.functions.invoke('glossary-generator', {
        body: { url, action: 'analyze_domain' }
      });

      if (error) throw error;

      dispatch({ type: 'SET_SUGGESTED_TERMS', payload: data.terms });
    } catch (error) {
      console.error('Error analyzing domain:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to analyze domain' });
    } finally {
      dispatch({ type: 'SET_ANALYZING', payload: false });
    }
  };

  const suggestTopicTerms = async (topic: string): Promise<void> => {
    dispatch({ type: 'SET_ANALYZING', payload: true });
    try {
      const { data, error } = await supabase.functions.invoke('glossary-generator', {
        body: { topic, action: 'suggest_topic_terms' }
      });

      if (error) throw error;

      dispatch({ type: 'SET_SUGGESTED_TERMS', payload: data.terms });
    } catch (error) {
      console.error('Error suggesting topic terms:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to suggest terms' });
    } finally {
      dispatch({ type: 'SET_ANALYZING', payload: false });
    }
  };

  const exportGlossary = async (format: 'markdown' | 'json' | 'csv'): Promise<void> => {
    try {
      if (!state.currentGlossary) throw new Error('No active glossary');

      const { data, error } = await supabase.functions.invoke('glossary-exporter', {
        body: { 
          glossary: state.currentGlossary,
          format 
        }
      });

      if (error) throw error;

      // Download the exported file
      const blob = new Blob([data.content], { type: data.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${state.currentGlossary.name}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting glossary:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to export glossary' });
    }
  };

  const navigateToStep = (step: number): void => {
    dispatch({ type: 'NAVIGATE_TO_STEP', payload: step });
  };

  const saveGlossary = async (): Promise<void> => {
    dispatch({ type: 'SET_SAVING', payload: true });
    try {
      if (!state.currentGlossary) throw new Error('No active glossary');

      await updateGlossary(state.currentGlossary);
      dispatch({ type: 'SET_LAST_SAVE_TIMESTAMP', payload: new Date().toISOString() });
    } catch (error) {
      console.error('Error saving glossary:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save glossary' });
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  };

  return {
    createGlossary,
    updateGlossary,
    deleteGlossary,
    addTerm,
    updateTerm,
    deleteTerm,
    generateDefinitions,
    analyzeDomain,
    suggestTopicTerms,
    exportGlossary,
    navigateToStep,
    saveGlossary
  };
};