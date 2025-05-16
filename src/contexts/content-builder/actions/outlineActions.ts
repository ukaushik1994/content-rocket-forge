
import { ContentBuilderState, ContentBuilderAction, OutlineSection } from '../types/index';

export const createOutlineActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const addOutlineSection = (title: string, level: number) => {
    const newSection: OutlineSection = {
      id: Math.random().toString(),
      title,
      level
    };
    
    const updatedSections = [...state.outlineSections, newSection];
    dispatch({ type: 'SET_OUTLINE_SECTIONS', payload: updatedSections });
  };
  
  const updateOutlineSection = (sectionId: string, title: string, level: number) => {
    const updatedSections = state.outlineSections.map(section => 
      section.id === sectionId ? { ...section, title, level } : section
    );
    
    dispatch({ type: 'SET_OUTLINE_SECTIONS', payload: updatedSections });
  };
  
  const removeOutlineSection = (sectionId: string) => {
    const updatedSections = state.outlineSections.filter(section => section.id !== sectionId);
    dispatch({ type: 'SET_OUTLINE_SECTIONS', payload: updatedSections });
  };
  
  const reorderOutlineSections = (sections: OutlineSection[]) => {
    dispatch({ type: 'SET_OUTLINE_SECTIONS', payload: sections });
  };

  const setOutline = (outline: string[]) => {
    dispatch({ type: 'SET_OUTLINE', payload: outline });
  };

  const setOutlineSections = (sections: OutlineSection[]) => {
    dispatch({ type: 'SET_OUTLINE_SECTIONS', payload: sections });
  };

  return {
    addOutlineSection,
    updateOutlineSection,
    removeOutlineSection,
    reorderOutlineSections,
    setOutline,
    setOutlineSections
  };
};
