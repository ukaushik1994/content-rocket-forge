
import { ContentBuilderState } from './types';

export const initialState: ContentBuilderState = {
  // Steps for the content builder wizard
  steps: [
    { id: 0, name: 'Keyword Selection', description: 'Choose main and secondary keywords', completed: false, visited: true },
    { id: 1, name: 'Content Type', description: 'Select content type and format', completed: false, visited: false },
    { id: 2, name: 'SERP Analysis', description: 'Analyze search results', completed: false, visited: false },
    { id: 3, name: 'Creation', description: 'Create outline and write content', completed: false, visited: false }, // Changed from "Outline" to "Creation"
    { id: 5, name: 'Optimization', description: 'Optimize for SEO and readability', completed: false, visited: false },
    { id: 6, name: 'Final Review', description: 'Review and publish', completed: false, visited: false }
  ],
  activeStep: 0,
  
  // Keyword data
  mainKeyword: '',
  secondaryKeywords: [],
  keywordClusters: [],
  selectedKeywords: [],
  selectedCluster: null,
  
  // Content type and format
  contentType: '',
  contentFormat: '',
  contentIntent: '',
  contentTitle: '',
  
  // SERP data
  isAnalyzing: false,
  serpData: null,
  serpSelections: [],
  
  // Outline data
  outline: [],
  isGeneratingOutline: false,
  
  // Content data
  content: '',
  isGeneratingContent: false,
  documentStructure: null,
  additionalInstructions: '',
  
  // Meta data
  metaTitle: '',
  metaDescription: '',
  
  // SEO data
  seoScore: 0,
  seoImprovements: [],
  
  // Solution integration
  selectedSolution: null,
  solutionIntegrationMetrics: {
    mentions: 0,
    contextualReferences: 0,
    naturalness: 0,
    featureIncorporation: 0,
    positioningScore: 0,
    overallScore: 0,
    nameMentions: 0,
    audienceAlignment: 0,
    painPointsAddressed: [],
    ctaMentions: 0
  },
  
  // UI state
  isSaving: false
};
