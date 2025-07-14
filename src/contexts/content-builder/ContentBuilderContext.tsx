
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { contentBuilderReducer } from './reducer';
import { initialState } from './initialState';
import { createContentBuilderActions } from './actions';
import { ContentBuilderContextType, ContentBuilderState, ContentBuilderAction } from './types/index';
import { loadStateFromStorage, autoSaveState, hasSavedState } from './utils/persistence';

// Create the context
const ContentBuilderContext = createContext<ContentBuilderContextType | undefined>(undefined);

// Provider component
export const ContentBuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with saved data if available
  const getInitialState = (): ContentBuilderState => {
    if (hasSavedState()) {
      const savedState = loadStateFromStorage();
      if (savedState) {
        return { ...initialState, ...savedState };
      }
    }
    return initialState;
  };

  const [state, dispatch] = useReducer(contentBuilderReducer, getInitialState());
  
  // Auto-save state changes
  useEffect(() => {
    autoSaveState(state);
  }, [state]);
  
  // Create actions
  const actions = createContentBuilderActions(state, dispatch);

  return (
    <ContentBuilderContext.Provider
      value={{ 
        state, 
        dispatch, 
        ...actions
      }}
    >
      {children}
    </ContentBuilderContext.Provider>
  );
};

// Custom hook to use the context
export const useContentBuilder = () => {
  const context = useContext(ContentBuilderContext);
  if (context === undefined) {
    throw new Error('useContentBuilder must be used within a ContentBuilderProvider');
  }
  return context;
};

