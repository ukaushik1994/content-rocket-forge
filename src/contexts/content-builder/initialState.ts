
import { ContentBuilderState } from './types';

export const initialState: ContentBuilderState = {
  activeStep: 0,
  steps: [
    {
      id: 0,
      name: 'Keywords',
      description: 'Select your target keywords to optimize your content.',
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
      name: 'SERP Analysis',
      description: 'Analyze search results to optimize your content strategy.',
      completed: false
    },
    {
      id: 3,
      name: 'Outline',
      description: 'Create a structured outline for your content.',
      completed: false
    },
    {
      id: 4,
      name: 'Content',
      description: 'Write your content with AI assistance.',
      completed: false
    },
    {
      id: 5,
      name: 'Optimize',
      description: 'Optimize your content for search engines.',
      completed: false
    },
    {
      id: 6,
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
