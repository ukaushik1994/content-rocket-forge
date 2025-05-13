
import { ContentBuilderState, ContentBuilderAction, OutlineSection } from '../types/index';

export const createOutlineActions = (
  state: ContentBuilderState,
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const addOutlineItem = (index: number) => {
    const newOutline = [...state.outline];
    const newItem = typeof newOutline[0] === 'string' 
      ? 'New Section' 
      : { 
          id: Math.random().toString(36).substr(2, 9), 
          title: 'New Section', 
          level: 1 
        };
    
    newOutline.splice(index + 1, 0, newItem);
    dispatch({ type: 'SET_OUTLINE', payload: newOutline });
  };

  const removeOutlineItem = (index: number) => {
    const newOutline = [...state.outline];
    newOutline.splice(index, 1);
    dispatch({ type: 'SET_OUTLINE', payload: newOutline });
  };

  const updateOutlineItem = (index: number, updatedItem: string | OutlineSection) => {
    const newOutline = [...state.outline];
    newOutline[index] = updatedItem;
    dispatch({ type: 'SET_OUTLINE', payload: newOutline });
  };

  const moveOutlineItem = (fromIndex: number, toIndex: number) => {
    const newOutline = [...state.outline];
    const [movedItem] = newOutline.splice(fromIndex, 1);
    newOutline.splice(toIndex, 0, movedItem);
    dispatch({ type: 'SET_OUTLINE', payload: newOutline });
  };

  const setContentLeadIn = (leadIn: string) => {
    // Implement this function if needed
    console.log('Content lead-in set to:', leadIn);
  };

  return {
    addOutlineItem,
    removeOutlineItem,
    updateOutlineItem,
    moveOutlineItem,
    setContentLeadIn
  };
};
