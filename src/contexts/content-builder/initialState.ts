
import { ContentBuilderState } from './types/state-types';
import { ContentFormat, ContentIntent } from './types/content-types';

export const initialState: ContentBuilderState = {
  currentStep: 0,
  activeStep: 0,
  steps: [
    {
      id: 0,
      name: 'Keyword Selection',
      title: 'Keyword Selection',
      description: 'Choose your target keywords',
      completed: false,
      visited: false,
      analyzed: false
    },
    {
      id: 1,
      name: 'Content Type',
      title: 'Content Type',
      description: 'Select your content format',
      completed: false,
      visited: false,
      analyzed: false
    },
    {
      id: 2,
      name: 'SERP Analysis',
      title: 'SERP Analysis',
      description: 'Analyze search results',
      completed: false,
      visited: false,
      analyzed: false
    },
    {
      id: 3,
      name: 'Content Outline',
      title: 'Content Outline',
      description: 'Create your content structure',
      completed: false,
      visited: false,
      analyzed: false
    },
    {
      id: 4,
      name: 'Content Writing',
      title: 'Content Writing',
      description: 'Write your content',
      completed: false,
      visited: false,
      analyzed: false
    },
    {
      id: 5,
      name: 'Optimize & Review',
      title: 'Optimize & Review',
      description: 'Enhance your content',
      completed: false,
      visited: false,
      analyzed: false
    }
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
  contentType: 'blog', // Using string literal instead of ContentType.BLOG_POST
  contentFormat: ContentFormat.LONG_FORM,
  contentIntent: ContentIntent.INFORM,
  selectedSolution: null,
  seoScore: 0,
  seoImprovements: [],
  metaTitle: '',
  metaDescription: '',
  additionalInstructions: '',
  solutionIntegrationMetrics: {
    keywordMatches: 0,
    featureCoverage: 0,
    naturalIntegration: 0,
    overallScore: 0,
    featureIncorporation: 0,
    positioningScore: 0,
    mentionedFeatures: [],
    painPointsAddressed: [],
    nameMentions: 0,
    audienceAlignment: 0,
    ctaEffectiveness: 0
  },
  selectedRegions: ['uk', 'us', 'mea', 'global']
};
