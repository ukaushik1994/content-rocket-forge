
import { ContentBuilderState } from './types/index';

export const initialState: ContentBuilderState = {
  steps: [
    { id: 1, name: 'Keyword Selection', completed: false, visited: false },
    { id: 2, name: 'SERP Analysis', completed: false, visited: false },
    { id: 3, name: 'Outline Creation', completed: false, visited: false },
    { id: 4, name: 'Content Writing', completed: false, visited: false },
    { id: 5, name: 'Optimize & Review', completed: false, visited: false },
    { id: 6, name: 'Save & Export', completed: false, visited: false }
  ],
  currentStep: 1,
  mainKeyword: '',
  searchedKeywords: [],
  selectedKeywords: [],
  selectedCluster: null,
  serpData: null,
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
  contentFormat: 'blog',
  contentIntent: 'informational',
  selectedSolution: null,
  metaTitle: '',
  metaDescription: '',
  documentStructure: {
    headingsCount: 0,
    paragraphsCount: 0,
    wordsCount: 0,
    readingTime: 0,
    hasIntroduction: false,
    hasConclusion: false,
    hasFAQSection: false,
  },
  solutionIntegrationMetrics: {
    keywordRelevance: 0,
    contentMatch: 0,
    overallScore: 0,
  },
  additionalInstructions: '',
  selectedRegions: ['us'], // Default to US region
};
