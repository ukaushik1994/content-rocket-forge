
import { ContentBuilderState, ContentBuilderAction, OutlineSection } from '../types/index';
import { v4 as uuid } from 'uuid';

export const createOutlineActions = (
  state: ContentBuilderState,
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const setOutline = (outline: string[]) => {
    dispatch({ type: 'SET_OUTLINE', payload: outline });
  };

  const setOutlineSections = (sections: OutlineSection[]) => {
    dispatch({ type: 'SET_OUTLINE_SECTIONS', payload: sections });
  };

  const addOutlineItem = (index: number) => {
    const updatedOutline = Array.isArray(state.outline) ? [...state.outline] : [];
    
    // Insert a new item at the specified index
    if (typeof updatedOutline[0] === 'string') {
      // Handle string array case
      updatedOutline.splice(index + 1, 0, 'New Section');
      dispatch({ type: 'SET_OUTLINE', payload: updatedOutline as string[] });
    } else {
      // Handle OutlineSection array case
      const newSection: OutlineSection = {
        id: uuid(),
        title: 'New Section',
        content: '',
        type: 'heading',
        level: 1
      };
      const updatedSections = [...state.outlineSections];
      updatedSections.splice(index + 1, 0, newSection);
      dispatch({ type: 'SET_OUTLINE_SECTIONS', payload: updatedSections });
    }
  };

  const removeOutlineItem = (index: number) => {
    if (Array.isArray(state.outline)) {
      const updatedOutline = [...state.outline];
      
      // Remove the item at the specified index
      updatedOutline.splice(index, 1);
      
      if (typeof updatedOutline[0] === 'string') {
        // Handle string array case
        dispatch({ type: 'SET_OUTLINE', payload: updatedOutline as string[] });
      } else {
        // Using outlineSections instead
        const updatedSections = [...state.outlineSections];
        updatedSections.splice(index, 1);
        dispatch({ type: 'SET_OUTLINE_SECTIONS', payload: updatedSections });
      }
    }
  };

  const updateOutlineItem = (index: number, updatedItem: string | OutlineSection) => {
    if (Array.isArray(state.outline)) {
      if (typeof updatedItem === 'string') {
        // Handle string array case
        const updatedOutline = [...state.outline];
        updatedOutline[index] = updatedItem;
        dispatch({ type: 'SET_OUTLINE', payload: updatedOutline as string[] });
      } else {
        // Using outlineSections with OutlineSection objects
        const updatedSections = [...state.outlineSections];
        updatedSections[index] = updatedItem;
        dispatch({ type: 'SET_OUTLINE_SECTIONS', payload: updatedSections });
      }
    }
  };

  const moveOutlineItem = (fromIndex: number, toIndex: number) => {
    // Using outlineSections for drag and drop
    const updatedSections = [...state.outlineSections];
    const [movedItem] = updatedSections.splice(fromIndex, 1);
    updatedSections.splice(toIndex, 0, movedItem);
    dispatch({ type: 'SET_OUTLINE_SECTIONS', payload: updatedSections });
  };

  return {
    setOutline,
    setOutlineSections,
    addOutlineItem,
    removeOutlineItem,
    updateOutlineItem,
    moveOutlineItem
  };
};
