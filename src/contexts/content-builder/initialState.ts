
import { ContentBuilderState } from './types';

export const initialState: ContentBuilderState = {
  // Navigation
  activeStep: 0,
  steps: [
    { id: 0, name: 'Keywords', completed: false, visited: true },
    { id: 1, name: 'Content Type', completed: false, visited: false },
    { id: 2, name: 'SERP Analysis', completed: false, visited: false },
    { id: 3, name: 'Outline', completed: false, visited: false },
    { id: 4, name: 'Write Content', completed: false, visited: false },
    { id: 5, name: 'Optimize', completed: false, visited: false },
    { id: 6, name: 'Publish', completed: false, visited: false }
  ],
  
  // Keywords
  mainKeyword: '',
  selectedKeywords: [],
  searchedKeywords: [],
  
  // Content Type
  contentType: 'article' as const,
  contentFormat: 'article' as const,
  contentIntent: 'inform',
  
  // Solutions
  selectedSolution: null,
  
  // Titles
  contentTitle: '',
  suggestedTitles: [],
  
  // SERP Data
  serpData: null,
  serpSelections: [],
  isAnalyzing: false,
  
  // Outline
  outline: [],
  outlineSections: [],
  
  // Content
  content: '',
  isGenerating: false,
  isSaving: false,
  
  // SEO
  seoScore: 0,
  seoImprovements: [],
  optimizationSkipped: false,
  
  // Selected Cluster
  selectedCluster: null,
  
  // Meta Information
  metaTitle: null,
  metaDescription: null,
  
  // Document Structure
  documentStructure: null,
  
  // Solution Integration
  solutionIntegrationMetrics: null,
  
  // Additional Instructions
  additionalInstructions: ''
};
