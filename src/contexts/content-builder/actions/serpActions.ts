
import { ContentBuilderState, ContentBuilderAction, SerpSelection, ContentOutlineSection } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const createSerpActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const analyzeKeyword = async (keyword: string) => {
    if (!keyword) return;
    
    // Start loading
    dispatch({ type: 'SET_IS_ANALYZING', payload: true });
    
    try {
      // In a real implementation, make API call to analyze keyword
      // For now, simulate with mock data
      const mockData = await getMockSerpData(keyword);
      
      // Update SERP data in state
      dispatch({ type: 'SET_SERP_DATA', payload: mockData });
    } catch (error) {
      console.error('Error analyzing keyword:', error);
      // Handle error
    } finally {
      // End loading
      dispatch({ type: 'SET_IS_ANALYZING', payload: false });
    }
  };
  
  const addSerpSelection = (selection: SerpSelection) => {
    dispatch({ type: 'ADD_SERP_SELECTION', payload: selection });
  };
  
  const addContentFromSerp = (content: string, type: string) => {
    const selection: SerpSelection = {
      type,
      content,
      selected: true
    };
    
    dispatch({ type: 'ADD_SERP_SELECTION', payload: selection });
  };
  
  const toggleSerpSelection = (type: string, content: string) => {
    dispatch({ type: 'TOGGLE_SERP_SELECTION', payload: { type, content } });
  };
  
  const generateOutlineFromSelections = () => {
    const { serpSelections } = state;
    const selectedItems = serpSelections.filter(item => item.selected);
    
    if (selectedItems.length === 0) return;
    
    // Group by type
    const questionItems = selectedItems.filter(item => item.type === 'question');
    const keywordItems = selectedItems.filter(item => item.type === 'keyword');
    const headingItems = selectedItems.filter(item => item.type === 'heading');
    const contentGapItems = selectedItems.filter(item => item.type === 'contentGap');
    
    // Generate outline sections
    const outlineSections: ContentOutlineSection[] = [];
    
    // Add introduction
    outlineSections.push({
      id: uuidv4(),
      title: 'Introduction',
      type: 'section',
      content: `Introduction to ${state.mainKeyword}`,
      relatedKeywords: keywordItems.slice(0, 3).map(item => item.content)
    });
    
    // Add sections from headings
    headingItems.forEach(item => {
      outlineSections.push({
        id: uuidv4(),
        title: item.content,
        type: 'section',
        content: '',
        relatedKeywords: []
      });
    });
    
    // Add FAQ section from questions
    if (questionItems.length > 0) {
      const faqSection: ContentOutlineSection = {
        id: uuidv4(),
        title: 'Frequently Asked Questions',
        type: 'faq',
        content: '',
        subsections: questionItems.map(item => ({
          id: uuidv4(),
          title: item.content
        }))
      };
      outlineSections.push(faqSection);
    }
    
    // Add content gaps as sections
    contentGapItems.forEach(item => {
      outlineSections.push({
        id: uuidv4(),
        title: item.content,
        type: 'section',
        content: '',
        relatedKeywords: []
      });
    });
    
    // Add conclusion
    outlineSections.push({
      id: uuidv4(),
      title: 'Conclusion',
      type: 'section',
      content: `Summary and key takeaways about ${state.mainKeyword}`,
      relatedKeywords: []
    });
    
    // Update outline in state
    dispatch({ type: 'SET_OUTLINE', payload: outlineSections });
  };
  
  return {
    analyzeKeyword,
    addSerpSelection,
    addContentFromSerp,
    toggleSerpSelection,
    generateOutlineFromSelections
  };
};

// Helper function to get mock SERP data
const getMockSerpData = async (keyword: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    keyword,
    searchVolume: Math.floor(Math.random() * 20000) + 1000,
    keywordDifficulty: Math.floor(Math.random() * 100),
    competitionScore: Math.random(),
    peopleAlsoAsk: [
      { 
        question: `What is ${keyword}?`, 
        answer: `${keyword} is a popular topic in digital marketing that refers to strategies for optimizing content.` 
      },
      { 
        question: `How to improve ${keyword}?`, 
        answer: `To improve ${keyword}, focus on creating high-quality content, optimizing meta tags, and building backlinks.` 
      },
      { 
        question: `Why is ${keyword} important?`, 
        answer: `${keyword} is important because it helps websites rank higher in search results, driving more organic traffic.` 
      },
    ],
    relatedSearches: [
      { query: `${keyword} strategy`, volume: 2500 },
      { query: `${keyword} tips`, volume: 1800 },
      { query: `best ${keyword} tools`, volume: 3200 },
      { query: `${keyword} examples`, volume: 1200 },
      { query: `how to learn ${keyword}`, volume: 2100 },
    ],
    topResults: [
      { 
        position: 1,
        title: `The Ultimate Guide to ${keyword}`,
        snippet: `Learn everything about ${keyword} with our comprehensive guide covering strategies, tools, and best practices.`,
        link: 'https://example.com/guide'
      },
      { 
        position: 2,
        title: `10 ${keyword} Strategies That Work in 2023`,
        snippet: `Discover the most effective ${keyword} strategies that are working right now, with real-world examples.`,
        link: 'https://example.com/strategies'
      },
      { 
        position: 3,
        title: `How To Master ${keyword} in 30 Days`,
        snippet: `Our step-by-step program shows you exactly how to become proficient in ${keyword} within just one month.`,
        link: 'https://example.com/course'
      },
    ],
    entities: [
      { name: 'Google', type: 'Organization' },
      { name: 'Website Traffic', type: 'Concept' },
      { name: 'Content Marketing', type: 'Topic' },
      { name: 'Analytics', type: 'Tool' },
    ],
    headings: [
      { text: `What is ${keyword}?`, level: 'h2' },
      { text: `Benefits of ${keyword}`, level: 'h2' },
      { text: `${keyword} Best Practices`, level: 'h2' },
      { text: `${keyword} Tools and Resources`, level: 'h2' },
    ],
    contentGaps: [
      { topic: `${keyword} for E-commerce`, description: 'Specialized strategies for online stores' },
      { topic: `${keyword} ROI Calculation`, description: 'How to measure return on investment' },
      { topic: `${keyword} Case Studies`, description: 'Real-world success stories' },
    ],
    recommendations: [
      `Focus on long-form content about ${keyword} that addresses user questions`,
      `Include step-by-step instructions for implementing ${keyword} strategies`,
      `Create comparison tables showing different ${keyword} approaches`,
      `Add visual elements like infographics explaining ${keyword} concepts`,
    ],
    isMockData: true
  };
};
