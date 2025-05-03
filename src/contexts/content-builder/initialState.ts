
import { ContentBuilderState, ContentStep } from './types';

// Initial state for our context
export const initialSteps: ContentStep[] = [
  { id: 0, name: 'Keywords', description: 'Select your target keywords', completed: false },
  { id: 1, name: 'Content Type', description: 'Define your content purpose', completed: false },
  { id: 2, name: 'SERP Analysis', description: 'Analyze search results', completed: false },
  { id: 3, name: 'Outline', description: 'Structure your content', completed: false },
  { id: 4, name: 'Write', description: 'Create your content', completed: false },
  { id: 5, name: 'Optimize', description: 'Improve SEO score', completed: false },
  { id: 6, name: 'Publish', description: 'Publish and share', completed: false },
];

export const initialState: ContentBuilderState = {
  activeStep: 0,
  steps: initialSteps,
  mainKeyword: '',
  selectedKeywords: [],
  selectedCluster: null,
  contentType: null,
  selectedSolution: null,
  serpData: null,
  serpSelections: [],
  isAnalyzing: false,
  outline: [],
  content: '',
  seoScore: 0,
  additionalInstructions: '',
};
