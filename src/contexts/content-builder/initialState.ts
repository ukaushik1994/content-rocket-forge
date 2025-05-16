
import { ContentBuilderState } from './types';

/**
 * Initial state for the Content Builder
 */
export const initialState: ContentBuilderState = {
  steps: [
    {
      id: 0,
      name: 'Keyword Selection',
      description: 'Select target keywords for your content',
      completed: false,
      visited: false,
    },
    {
      id: 1,
      name: 'Content Type',
      description: 'Choose the type of content to create',
      completed: false,
      visited: false,
    },
    {
      id: 2,
      name: 'SERP Analysis',
      description: 'Analyze search results for insights',
      completed: false,
      visited: false,
    },
    {
      id: 3,
      name: 'Outline Creation',
      description: 'Create a structured content outline',
      completed: false,
      visited: false,
    },
    {
      id: 4,
      name: 'Content Writing',
      description: 'Generate and refine your content',
      completed: false,
      visited: false,
    },
    {
      id: 5,
      name: 'Optimize & Review',
      description: 'Analyze and improve content performance',
      completed: false,
      visited: false,
    },
    {
      id: 6, 
      name: 'Save & Export',
      description: 'Download or save your content',
      completed: false,
      visited: false,
    }
  ],
  currentStep: 0,
  mainKeyword: '',
  searchedKeywords: [],
  selectedKeywords: [],
  selectedCluster: null,
  serpData: {},
  serpSelections: [],
  isAnalyzing: false,
  outline: [],
  outlineSections: [],
  content: '',
  isGenerating: false,
  isSavingData: false,
  contentTitle: '',
  suggestedTitles: [],
  seoScore: 0,
  seoImprovements: [],
  contentType: 'article',
  contentFormat: 'long-form',
  contentIntent: 'inform',
  selectedSolution: null,
  metaTitle: '',
  metaDescription: '',
  documentStructure: {
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    hasSingleH1: false,
    hasLogicalHierarchy: false,
    headings: [],
    headingCounts: {
      h1: 0,
      h2: 0,
      h3: 0,
      h4: 0,
      h5: 0,
      h6: 0
    },
    paragraphs: [],
    lists: [],
    images: [],
    links: [],
    metadata: {
      wordCount: 0,
      characterCount: 0
    }
  },
  solutionIntegrationMetrics: {
    featureIncorporation: 0,
    positioningScore: 0,
    audienceAlignment: 0,
    overall: 0
  },
  additionalInstructions: '',
  selectedRegions: []
};
