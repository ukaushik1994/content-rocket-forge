
import { ContentBuilderState, ContentBuilderAction } from '../types';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { toast } from 'sonner';

/**
 * Actions related to keyword management in the content builder
 */
export const createKeywordActions = (
  state: ContentBuilderState,
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  // Analyze keyword functionality
  const analyzeKeyword = async (keyword: string) => {
    if (!keyword) {
      toast.error('Please enter a keyword to analyze');
      return;
    }

    dispatch({ type: 'SET_IS_ANALYZING', payload: true });
    try {
      const data = await analyzeKeywordSerp(keyword);
      dispatch({ type: 'SET_SERP_DATA', payload: data });
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: state.activeStep });
      toast.success(`Analysis completed for: ${keyword}`);
    } catch (error) {
      console.error('Error analyzing keyword:', error);
      toast.error('Failed to analyze keyword. Please try again.');
    } finally {
      dispatch({ type: 'SET_IS_ANALYZING', payload: false });
    }
  };

  // Set primary keyword
  const setPrimaryKeyword = (keyword: string) => {
    dispatch({ type: 'SET_PRIMARY_KEYWORD', payload: keyword });
  };

  // Add secondary keyword
  const addSecondaryKeyword = (keyword: string) => {
    dispatch({ type: 'ADD_SECONDARY_KEYWORD', payload: keyword });
  };

  // Remove secondary keyword
  const removeSecondaryKeyword = (keyword: string) => {
    dispatch({ type: 'REMOVE_SECONDARY_KEYWORD', payload: keyword });
  };

  // Set keyword clusters
  const setKeywordClusters = (clusters: { [key: string]: string[] }) => {
    dispatch({ type: 'SET_KEYWORD_CLUSTERS', payload: clusters });
  };

  return {
    analyzeKeyword,
    setPrimaryKeyword,
    addSecondaryKeyword,
    removeSecondaryKeyword,
    setKeywordClusters
  };
};
