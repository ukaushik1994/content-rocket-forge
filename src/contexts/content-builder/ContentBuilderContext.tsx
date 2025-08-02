
import React, { createContext, useContext, useReducer } from 'react';
import { ContentBuilderState, ContentBuilderAction, ContentBuilderContextType } from './types';
import { contentBuilderReducer } from './reducer/contentBuilderReducer';
import { createContentBuilderActions } from './actions';
import { initialContentBuilderState } from './initialState';

const ContentBuilderContext = createContext<ContentBuilderContextType | null>(null);

export const ContentBuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(contentBuilderReducer, initialContentBuilderState);
  const actions = createContentBuilderActions(state, dispatch);

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

export const useContentBuilder = () => {
  const context = useContext(ContentBuilderContext);
  if (!context) {
    throw new Error('useContentBuilder must be used within a ContentBuilderProvider');
  }
  return context;
};
