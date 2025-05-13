
import { ContentBuilderState } from './types/state-types';

export const initialState: ContentBuilderState = {
  currentStep: 1,
  activeStep: 1,
  steps: [],
  mainKeyword: '',
  searchedKeywords: [],
  selectedKeywords: [],
  serpData: null,
  isAnalyzing: false,
  isSavingData: false,
  serpSelections: [],
  outline: [],
  outlineSections: [],
  content: '',
  isGenerating: false,
  contentTitle: '',
  suggestedTitles: [],
  selectedCluster: null,
  contentType: 'article',
  contentFormat: 'how-to',
  contentIntent: 'informational',
  availableSolutions: [
    {
      id: '1',
      name: 'Surfer SEO',
      description: 'Optimize your content with Surfer SEO',
      features: ['Keyword Research', 'Content Optimization', 'SERP Analysis'],
      type: 'seo',
      isConnected: false
    },
    {
      id: '2',
      name: 'Clearscope',
      description: 'Content optimization tool',
      features: ['Keyword Research', 'Content Optimization', 'SERP Analysis'],
      type: 'seo',
      isConnected: false
    },
  ],
  selectedSolution: null,
  metaTitle: '',
  metaDescription: '',
  documentStructure: {
    headings: [],
    paragraphs: [],
    images: [],
    links: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    hasSingleH1: false,
    hasLogicalHierarchy: false,
    lists: [],
    metadata: {
      wordCount: 0,
      characterCount: 0
    }
  },
  solutionIntegrationMetrics: {
    matchScore: 0,
    keywordUsage: 0,
    contentRelevance: 0,
    potentialImpact: 0,
    overallScore: 0,
    featureIncorporation: 0,
    positioningScore: 0,
    recommendations: []
  },
  additionalInstructions: '',
  selectedRegions: ['us']
};
