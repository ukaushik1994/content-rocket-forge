
import { ContentBuilderState } from './types/state-types';
import { Step } from './types/step-types';

// Define steps for the content builder workflow
const contentBuilderSteps: Step[] = [
  { id: 0, name: 'Keyword Selection', completed: false, analyzed: false },
  { id: 1, name: 'Content Type', completed: false, analyzed: false },
  { id: 2, name: 'SERP Analysis', completed: false, analyzed: false },
  { id: 3, name: 'Outline', completed: false, analyzed: false },
  { id: 4, name: 'Content Writing', completed: false, analyzed: false },
  { id: 5, name: 'Optimize & Review', completed: false, analyzed: false }
];

// Initial state for content builder
export const initialState: ContentBuilderState = {
  currentStep: 0,
  activeStep: 0,
  steps: contentBuilderSteps,
  
  // Keyword related state
  mainKeyword: '',
  selectedKeywords: [],
  searchedKeywords: [],
  selectedRegions: ['us'],
  
  // SERP analysis related state
  serpData: null,
  isAnalyzing: false,
  serpSelections: [],
  
  // Content related state
  outline: [],
  outlineSections: [],
  content: '',
  contentTitle: '',
  suggestedTitles: [],
  isGenerating: false,
  
  // Content type related state
  contentType: '',
  contentFormat: '',
  contentIntent: '',
  
  // Cluster data
  selectedCluster: null,
  
  // Solution related state
  selectedSolution: null,
  availableSolutions: [],
  
  // SEO related state
  seoScore: 0,
  seoImprovements: [],
  metaTitle: '',
  metaDescription: '',
  
  // Additional state
  additionalInstructions: '',
  isSavingData: false,
  
  // Technical SEO analysis
  solutionIntegrationMetrics: {
    matchScore: 0,
    keywordUsage: 0,
    contentRelevance: 0,
    potentialImpact: 0,
    overallScore: 0,
    featureIncorporation: 0,
    positioningScore: 0,
    recommendations: [],
    mentionedFeatures: []
  }
};
