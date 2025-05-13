
import { ContentBuilderState } from './types/index';
import { v4 as uuid } from 'uuid';

/**
 * Initial state for the Content Builder
 */
export const initialState: ContentBuilderState = {
  currentStep: 0,
  activeStep: 0,
  steps: [
    { id: 0, title: 'Keyword Selection', completed: false, visited: true, analyzed: false },
    { id: 1, title: 'Content Type', completed: false, visited: false, analyzed: false },
    { id: 2, title: 'SERP Analysis', completed: false, visited: false, analyzed: false },
    { id: 3, title: 'Outline', completed: false, visited: false, analyzed: false },
    { id: 4, title: 'Content Writing', completed: false, visited: false, analyzed: false },
    { id: 5, title: 'Optimize & Review', completed: false, visited: false, analyzed: false },
    { id: 6, title: 'Save & Export', completed: false, visited: false, analyzed: false }
  ],
  mainKeyword: '',
  selectedKeywords: [],
  searchedKeywords: [],
  serpData: null,
  isAnalyzing: false,
  isSavingData: false,
  serpSelections: [],
  outline: [],
  outlineSections: [],
  isGenerating: false,
  content: '',
  contentTitle: '',
  suggestedTitles: [],
  selectedCluster: null,
  contentType: '',
  contentFormat: '',
  contentIntent: '',
  selectedSolution: null,
  seoScore: 0,
  seoImprovements: [],
  metaTitle: '',
  metaDescription: '',
  additionalInstructions: '',
  documentStructure: {
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    paragraphs: [],
    images: [],
    links: [],
    lists: [],
    hasSingleH1: false,
    hasLogicalHierarchy: false,
    wordCount: 0,
    readingTime: 0,
    headings: []
  },
  solutionIntegrationMetrics: {
    matchScore: 0,
    keywordUsage: 0,
    contentRelevance: 0,
    potentialImpact: 0,
    overallScore: 0,
    featureIncorporation: 0,
    positioningScore: 0,
    recommendations: [],
    keywordMatches: 0,
    mentionedFeatures: [],
    nameMentions: 0,
    painPointsAddressed: 0,
    audienceAlignment: 0
  },
  selectedRegions: ['us', 'uk'],
  availableSolutions: []
};
