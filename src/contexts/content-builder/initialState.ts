
import { ContentBuilderState } from './types';

export const initialState: ContentBuilderState = {
  // Navigation
  activeStep: 0,
  steps: [
    { id: 0, name: 'Keywords', description: 'Select main and secondary keywords', completed: false, visited: true },
    { id: 1, name: 'Content Type', description: 'Choose content format and intent', completed: false, visited: false },
    { id: 2, name: 'SERP Analysis', description: 'Analyze search results', completed: false, visited: false },
    { id: 3, name: 'Outline', description: 'Create content structure', completed: false, visited: false },
    { id: 4, name: 'Write Content', description: 'Compose your content', completed: false, visited: false },
    { id: 5, name: 'Optimize', description: 'Enhance SEO performance', completed: false, visited: false },
    { id: 6, name: 'Publish', description: 'Review and publish content', completed: false, visited: false }
  ],
  
  // Keywords
  mainKeyword: '',
  selectedKeywords: [],
  searchedKeywords: [],
  
  // Content Type
  contentType: 'blog' as const,
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
