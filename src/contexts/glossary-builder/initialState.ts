import { GlossaryBuilderState } from './types';

export const initialState: GlossaryBuilderState = {
  currentGlossary: null,
  glossaries: [],
  selectedTerms: [],
  isGenerating: false,
  isAnalyzing: false,
  lastError: null,
  activeMode: 'domain',
  suggestedTerms: [],
  exportFormat: 'markdown',
  currentStep: 0,
  stepProgress: {}
};