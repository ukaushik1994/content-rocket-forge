
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
      // Call API to analyze keyword
      const data = await analyzeKeywordSerp(keyword);
      
      // Always ensure we have data, even if it's mock data
      if (data) {
        dispatch({ type: 'SET_SERP_DATA', payload: data });
        dispatch({ type: 'MARK_STEP_COMPLETED', payload: state.activeStep });
        
        // Show different toast messages based on whether we're using mock or real data
        if (data.isMockData) {
          toast.info(`Analysis completed for: ${keyword} (using mock data)`);
        } else {
          toast.success(`Analysis completed for: ${keyword}`);
        }
      } else {
        // If for some reason we don't get data back, show an error
        toast.error('Failed to analyze keyword. Please try again.');
      }
    } catch (error: any) {
      console.error('Error analyzing keyword:', error);
      toast.error(`Analysis error: ${error.message || 'Failed to analyze keyword'}`);
    } finally {
      // Always set analyzing state to false to ensure UI is updated
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
