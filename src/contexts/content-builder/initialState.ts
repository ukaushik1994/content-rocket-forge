
import { ContentBuilderState } from './types/index';

export const initialState: ContentBuilderState = {
  steps: [
    { id: 1, name: 'Keyword Selection', description: 'Select primary and secondary keywords for your content', completed: false, visited: false },
    { id: 2, name: 'SERP Analysis', description: 'Analyze search results to understand search intent', completed: false, visited: false },
    { id: 3, name: 'Outline Creation', description: 'Generate a structured outline for your content', completed: false, visited: false },
    { id: 4, name: 'Content Writing', description: 'Create engaging content based on your outline', completed: false, visited: false },
    { id: 5, name: 'Optimize & Review', description: 'Analyze and improve content performance', completed: false, visited: false },
    { id: 6, name: 'Save & Export', description: 'Save your content and export it to desired formats', completed: false, visited: false }
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
  contentFormat: 'long-form',
  contentIntent: 'inform',
  selectedSolution: null,
  metaTitle: '',
  metaDescription: '',
  documentStructure: {
    totalWordCount: 0,
    paragraphCount: 0,
    sentenceCount: 0,
    readability: {
      score: 0,
      level: 'standard'
    },
    headingCounts: {
      h1: 0,
      h2: 0,
      h3: 0,
      h4: 0
    },
    hasIntroduction: false,
    hasConclusion: false,
    hasFAQSection: false
  },
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
    ctaEffectiveness: 0,
    ctaMentions: 0,
    mentions: ''
  },
  additionalInstructions: '',
  selectedRegions: ['us'], // Default to US region
};
