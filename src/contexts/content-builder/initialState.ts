
import { ContentBuilderState } from './types/index';

export const initialState: ContentBuilderState = {
  // Navigation
  activeStep: 0,
  steps: [
    { id: 0, name: 'Keywords', completed: false, visited: false, analyzed: false },
    { id: 1, name: 'SERP Analysis', completed: false, visited: false, analyzed: false },
    { id: 2, name: 'Content Type & Outline', completed: false, visited: false, analyzed: false },
    { id: 3, name: 'Writing', completed: false, visited: false, analyzed: false },
    { id: 4, name: 'Optimize & Review', completed: false, visited: false, analyzed: false },
    { id: 5, name: 'Save', completed: false, visited: false, analyzed: false }
  ],
  
  // Keywords
  mainKeyword: '',
  selectedKeywords: [],
  searchedKeywords: [],
  
  // Content Type
  contentType: 'article',
  contentFormat: 'blog-post',
  contentIntent: 'informational',
  
  // Solutions
  selectedSolution: null,
  
  // Titles
  contentTitle: '',
  suggestedTitles: [],
  
  // SERP Data
  serpData: null,
  serpSelections: [],
  isAnalyzing: false,
  
  // Enhanced SERP Analysis Data
  comprehensiveSerpData: null,
  
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
  additionalInstructions: '',

  // Enhanced Analytics
  comprehensiveAnalytics: null,
  isAnalyzingContent: false,
  lastAnalysisHash: null
};
