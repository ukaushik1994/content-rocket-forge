
import { ContentBuilderState } from './types';

export const initialState: ContentBuilderState = {
  // Navigation
  activeStep: 0,
  steps: [
    {
      id: 0,
      name: 'Keyword Research',
      description: 'Research and select keywords for your content',
      completed: false,
      visited: true
    },
    {
      id: 1,
      name: 'Content Type',
      description: 'Choose the type of content you want to create',
      completed: false,
      visited: false
    },
    {
      id: 2,
      name: 'SERP Analysis',
      description: 'Analyze search results for your keywords',
      completed: false,
      visited: false
    },
    {
      id: 3,
      name: 'Content Outline',
      description: 'Create an outline for your content',
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
      name: 'Optimization',
      description: 'Optimize your content for SEO',
      completed: false,
      visited: false
    },
    {
      id: 6,
      name: 'Final Review',
      description: 'Review and finalize your content',
      completed: false,
      visited: false
    }
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
  
  // Selected Cluster
  selectedCluster: null
};
