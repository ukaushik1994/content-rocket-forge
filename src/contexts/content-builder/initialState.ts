
import { ContentBuilderState } from './types';

export const initialState: ContentBuilderState = {
  // Navigation
  activeStep: 0,
  steps: [
    {
      id: 0,
      name: 'Keyword Selection',
      description: 'Choose your target keywords',
      completed: false,
      visited: false
    },
    {
      id: 1,
      name: 'Content Type',
      description: 'Select content format and type',
      completed: false,
      visited: false
    },
    {
      id: 2,
      name: 'SERP Analysis',
      description: 'Analyze search results for insights',
      completed: false,
      visited: false
    },
    {
      id: 3,
      name: 'Content Outline',
      description: 'Create your content structure',
      completed: false,
      visited: false
    },
    {
      id: 4,
      name: 'Content Writing',
      description: 'Write or generate your content',
      completed: false,
      visited: false
    },
    {
      id: 5,
      name: 'Optimize & Review',
      description: 'Optimize your content for SEO',
      completed: false,
      visited: false,
      analyzed: false
    },
    {
      id: 6,
      name: 'Save & Publish',
      description: 'Save or publish your content',
      completed: false,
      visited: false
    }
  ],
  
  // Keywords
  mainKeyword: '',
  selectedKeywords: [],
  searchedKeywords: [],
  
  // Content Type
  contentType: 'blog',
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
