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
  activeStep: 0,
  steps: [
    { id: 0, name: 'Term Discovery', description: 'Find and collect terms', completed: false },
    { id: 1, name: 'Term Selection', description: 'Select terms to define', completed: false },
    { id: 2, name: 'Solution Context', description: 'Choose solution reference', completed: false },
    { id: 3, name: 'Definition Generation', description: 'Generate AI definitions', completed: false },
    { id: 4, name: 'Save & Export', description: 'Save and export glossary', completed: false }
  ],
  selectedSolution: null,
  generationProgress: 0,
  isSaving: false,
  lastSaveTimestamp: null
};