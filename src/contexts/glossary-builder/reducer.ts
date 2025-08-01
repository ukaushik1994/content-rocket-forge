import { GlossaryBuilderState, GlossaryBuilderAction } from './types';

export const glossaryBuilderReducer = (
  state: GlossaryBuilderState,
  action: GlossaryBuilderAction
): GlossaryBuilderState => {
  switch (action.type) {
    case 'SET_CURRENT_GLOSSARY':
      return {
        ...state,
        currentGlossary: action.payload
      };

    case 'ADD_GLOSSARY':
      return {
        ...state,
        glossaries: [...state.glossaries, action.payload],
        currentGlossary: action.payload
      };

    case 'UPDATE_GLOSSARY':
      return {
        ...state,
        glossaries: state.glossaries.map(g => 
          g.id === action.payload.id ? action.payload : g
        ),
        currentGlossary: state.currentGlossary?.id === action.payload.id 
          ? action.payload 
          : state.currentGlossary
      };

    case 'DELETE_GLOSSARY':
      return {
        ...state,
        glossaries: state.glossaries.filter(g => g.id !== action.payload),
        currentGlossary: state.currentGlossary?.id === action.payload 
          ? null 
          : state.currentGlossary
      };

    case 'ADD_TERM':
      if (!state.currentGlossary) return state;
      
      const updatedGlossaryWithTerm = {
        ...state.currentGlossary,
        terms: [...state.currentGlossary.terms, action.payload]
      };
      
      return {
        ...state,
        currentGlossary: updatedGlossaryWithTerm,
        glossaries: state.glossaries.map(g => 
          g.id === state.currentGlossary!.id ? updatedGlossaryWithTerm : g
        )
      };

    case 'UPDATE_TERM':
      if (!state.currentGlossary) return state;
      
      const updatedGlossaryWithUpdatedTerm = {
        ...state.currentGlossary,
        terms: state.currentGlossary.terms.map(t => 
          t.id === action.payload.id ? action.payload : t
        )
      };
      
      return {
        ...state,
        currentGlossary: updatedGlossaryWithUpdatedTerm,
        glossaries: state.glossaries.map(g => 
          g.id === state.currentGlossary!.id ? updatedGlossaryWithUpdatedTerm : g
        )
      };

    case 'DELETE_TERM':
      if (!state.currentGlossary) return state;
      
      const updatedGlossaryWithoutTerm = {
        ...state.currentGlossary,
        terms: state.currentGlossary.terms.filter(t => t.id !== action.payload)
      };
      
      return {
        ...state,
        currentGlossary: updatedGlossaryWithoutTerm,
        glossaries: state.glossaries.map(g => 
          g.id === state.currentGlossary!.id ? updatedGlossaryWithoutTerm : g
        )
      };

    case 'SELECT_TERMS':
      return {
        ...state,
        selectedTerms: action.payload
      };

    case 'SET_GENERATING':
      return {
        ...state,
        isGenerating: action.payload
      };

    case 'SET_ANALYZING':
      return {
        ...state,
        isAnalyzing: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        lastError: action.payload
      };

    case 'SET_ACTIVE_MODE':
      return {
        ...state,
        activeMode: action.payload
      };

    case 'SET_SUGGESTED_TERMS':
      return {
        ...state,
        suggestedTerms: action.payload
      };

    case 'SET_EXPORT_FORMAT':
      return {
        ...state,
        exportFormat: action.payload
      };

    default:
      return state;
  }
};