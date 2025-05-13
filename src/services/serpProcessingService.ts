
import { SerpSelection } from '@/contexts/content-builder/types';
import { OutlineSection } from '@/contexts/content-builder/types';

// Process SERP data for use in the application
export const serpProcessingService = {
  // Process raw SERP data into a format usable by the application
  processSerpData: (serpData: any, keyword: string) => {
    // In a real implementation, this would transform the raw SERP data
    // For now, just return the data as-is
    return {
      ...serpData,
      mainKeyword: keyword,
      processedAt: new Date().toISOString()
    };
  },
  
  // Convert selected SERP items into outline sections
  convertSelectionsToOutline: (selections: SerpSelection[]): OutlineSection[] => {
    if (!selections || selections.length === 0) {
      return [];
    }
    
    const outline: OutlineSection[] = [];
    
    // First add questions as main sections
    const questions = selections.filter(item => item.type === 'question');
    questions.forEach(question => {
      outline.push({
        id: Math.random().toString(36).substr(2, 9),
        title: question.content,
        type: 'heading',
        level: 2,
        content: ''
      });
    });
    
    // Add headings from SERP
    const headings = selections.filter(item => item.type === 'heading');
    headings.forEach(heading => {
      outline.push({
        id: Math.random().toString(36).substr(2, 9),
        title: heading.content,
        type: 'heading',
        level: 2,
        content: ''
      });
    });
    
    // Add keywords and entities as sections if there aren't enough sections
    if (outline.length < 3) {
      const keywords = selections.filter(item => item.type === 'keyword');
      const entities = selections.filter(item => item.type === 'entity');
      
      // Add some keywords as sections
      keywords.slice(0, 2).forEach(keyword => {
        outline.push({
          id: Math.random().toString(36).substr(2, 9),
          title: `About ${keyword.content}`,
          type: 'heading',
          level: 2,
          content: ''
        });
      });
      
      // Add entities as sections
      entities.slice(0, 2).forEach(entity => {
        outline.push({
          id: Math.random().toString(36).substr(2, 9),
          title: `Understanding ${entity.content}`,
          type: 'heading',
          level: 2,
          content: ''
        });
      });
    }
    
    // Add introduction and conclusion sections
    outline.unshift({
      id: 'intro-' + Math.random().toString(36).substr(2, 9),
      title: 'Introduction',
      type: 'heading',
      level: 1,
      content: ''
    });
    
    outline.push({
      id: 'conclusion-' + Math.random().toString(36).substr(2, 9),
      title: 'Conclusion',
      type: 'heading',
      level: 2,
      content: ''
    });
    
    return outline;
  }
};
