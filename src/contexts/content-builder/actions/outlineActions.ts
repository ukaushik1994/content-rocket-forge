
import { ContentBuilderState, ContentBuilderAction, OutlineSection } from '../types';

export const createOutlineActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const setOutline = (outline: string[]) => {
    dispatch({ type: 'SET_OUTLINE', payload: outline });
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 3 });
  };
  
  const setOutlineSections = (sections: OutlineSection[]) => {
    dispatch({ type: 'SET_OUTLINE_SECTIONS', payload: sections });
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 3 });
  };
  
  const generateOutlineFromSelections = () => {
    if (state.serpSelections.length === 0) {
      console.error('No SERP selections to create outline from');
      return;
    }
    
    // Create outline sections from SERP selections
    const outlineSections = state.serpSelections.map(selection => ({
      title: selection.content.substring(0, 100),
      content: '',
      type: selection.type
    }));
    
    setOutlineSections(outlineSections);
  };
  
  return {
    setOutline,
    setOutlineSections,
    generateOutlineFromSelections
  };
};
