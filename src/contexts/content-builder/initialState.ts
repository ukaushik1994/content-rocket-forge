
import { ContentBuilderState } from './types';

export const initialState: ContentBuilderState = {
  activeStep: 0,
  steps: [
    {
      id: 0,
      name: 'Keyword Selection',
      description: 'Select target keywords for your content',
      completed: false,
    },
    {
      id: 1,
      name: 'Content Type',
      description: 'Choose the type and format of content',
      completed: false,
    },
    {
      id: 2,
      name: 'SERP Analysis',
      description: 'Analyze search results for your keywords',
      completed: false,
    },
    {
      id: 3,
      name: 'Content Outline',
      description: 'Create an outline for your content',
      completed: false,
    },
    {
      id: 4,
      name: 'Content Writing',
      description: 'Write your content based on the outline',
      completed: false,
    },
    {
      id: 5,
      name: 'SEO Optimization',
      description: 'Optimize your content for search engines',
      completed: false,
    },
    {
      id: 6,
      name: 'Save & Export',
      description: 'Save your content to library or export',
      completed: false,
    },
  ],
  primaryKeyword: '',
  secondaryKeywords: [],
  keywordClusters: {},
  contentType: 'article',
  contentFormat: '',
  contentTitle: '',
  outlineSections: [],
  serpAnalysisResults: null,
  serpKeywordsSelected: [],
  serpQuestionsSelected: [],
  isAnalyzing: false,
  isSaving: false,
  isPublishing: false,
  content: '',
  mainKeyword: '',
  selectedKeywords: [],
  selectedCluster: null,
  selectedSolution: null,
  serpData: null,
  serpSelections: [],
  outline: [],
  seoScore: 0,
  additionalInstructions: '',
  seoImprovements: []
};
