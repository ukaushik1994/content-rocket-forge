
import React, { createContext, useContext, useReducer } from 'react';
import { contentBuilderReducer } from './reducer';
import { initialState } from './initialState';
import { createContentBuilderActions } from './actions';
import { ContentBuilderContextType, ContentBuilderState, ContentBuilderAction } from './types/index';

// Create the context
const ContentBuilderContext = createContext<ContentBuilderContextType | undefined>(undefined);

// Provider component
export const ContentBuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(contentBuilderReducer, initialState);
  
  // Create actions
  const actions = createContentBuilderActions(state, dispatch);

  // Make sure we have all required functions from the context type
  const contextValue: ContentBuilderContextType = {
    state,
    dispatch,
    ...actions
  };

  return (
    <ContentBuilderContext.Provider value={contextValue}>
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
