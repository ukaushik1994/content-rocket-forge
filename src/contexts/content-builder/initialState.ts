
import { ContentBuilderState } from './types';

export const initialState: ContentBuilderState = {
  activeStep: 0,
  steps: [
    {
      id: 0,
      name: 'SERP Analysis',
      description: 'Research keywords and analyze search results to optimize your content.',
      completed: false
    },
    {
      id: 1,
      name: 'Content Type',
      description: 'Choose the type of content you want to create.',
      completed: false
    },
    {
      id: 2,
      name: 'Outline',
      description: 'Create a structured outline for your content.',
      completed: false
    },
    {
      id: 3,
      name: 'Content',
      description: 'Write your content with AI assistance.',
      completed: false
    },
    {
      id: 4,
      name: 'Optimize',
      description: 'Optimize your content for search engines.',
      completed: false
    },
    {
      id: 5,
      name: 'Publish',
      description: 'Prepare your content for publication.',
      completed: false
    }
  ],
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
  contentTitle: '',
  seoScore: 0,
  additionalInstructions: ''
};
