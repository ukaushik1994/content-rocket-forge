import { ContentBuilderState } from './types';
import { getPreferredSerpProvider } from '@/services/serpApiService';

export const initialState: ContentBuilderState = {
  // Navigation
  activeStep: 0,
  steps: [
    { id: 0, name: 'Keyword Selection', description: 'Choose your target keywords', completed: false, visited: true },
    { id: 1, name: 'Content Type', description: 'Select content type and format', completed: false, visited: false },
    { id: 2, name: 'SERP Analysis', description: 'Analyze search results', completed: false, visited: false },
    { id: 3, name: 'Content Outline', description: 'Create your outline', completed: false, visited: false },
    { id: 4, name: 'Content Writing', description: 'Write your content', completed: false, visited: false },
    { id: 5, name: 'Optimize & Review', description: 'Optimize and review your content', completed: false, visited: false, analyzed: false }
  ],
  
  // Keywords
  mainKeyword: '',
  selectedKeywords: [],
  searchedKeywords: [],
  
  // Content Type
  contentType: 'article',
  contentFormat: 'long-form',
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
  preferredSerpProvider: getPreferredSerpProvider(),
  
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
