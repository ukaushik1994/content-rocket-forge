import React, { createContext, useContext, useReducer } from 'react';
import { glossaryBuilderReducer } from './reducer';
import { initialState } from './initialState';
import { createGlossaryBuilderActions } from './actions';
import { GlossaryBuilderContextType, GlossaryBuilderState, GlossaryBuilderAction } from './types';

// Create the context
const GlossaryBuilderContext = createContext<GlossaryBuilderContextType | undefined>(undefined);

// Provider component
export const GlossaryBuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(glossaryBuilderReducer, initialState);
  
  // Create actions
  const actions = createGlossaryBuilderActions(state, dispatch);

  return (
    <GlossaryBuilderContext.Provider
      value={{ 
        state, 
        dispatch, 
        ...actions
      }}
    >
      {children}
    </GlossaryBuilderContext.Provider>
  );
};

// Custom hook to use the context
export const useGlossaryBuilder = () => {
  const context = useContext(GlossaryBuilderContext);
  if (context === undefined) {
    throw new Error('useGlossaryBuilder must be used within a GlossaryBuilderProvider');
  }
  return context;
};