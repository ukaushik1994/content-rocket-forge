
/**
 * Utility for analyzing content structure
 */

interface ContentStructure {
  isInstructional: boolean;
  isAnalytical: boolean;
  hasList: boolean;
  hasQuestions: boolean;
  hasMetrics: boolean;
  hasDates: boolean;
  hasTrends: boolean;
  listItems: number;
  headingCount: number;
}

/**
 * Analyze content structure to determine its characteristics
 */
export const analyzeContentStructure = (content: string): ContentStructure => {
  const structure: ContentStructure = {
    isInstructional: false,
    isAnalytical: false,
    hasList: false,
    hasQuestions: false,
    hasMetrics: false,
    hasDates: false,
    hasTrends: false,
    listItems: 0,
    headingCount: 0
  };
  
  if (!content) return structure;
  
  // Normalize content
  const normalizedContent = content.toLowerCase();
  
  // Check for instructional language
  const instructionalPhrases = [
    'how to', 'step', 'guide', 'tutorial', 'instructions', 
    'follow these', 'learn', 'steps', 'here\'s how', 
    'process', 'method'
  ];
  
  structure.isInstructional = instructionalPhrases.some(phrase => 
    normalizedContent.includes(phrase)
  );
  
  // Check for analytical language
  const analyticalPhrases = [
    'analysis', 'research', 'study', 'data', 'statistics',
    'evidence', 'findings', 'suggests', 'indicates',
    'conclusion', 'therefore', 'however', 'furthermore'
  ];
  
  structure.isAnalytical = analyticalPhrases.some(phrase => 
    normalizedContent.includes(phrase)
  );
  
  // Check for list indicators
  structure.hasList = /(\d+\.\s|\*\s|-)/.test(content) || 
                      /(list|step|point|tip)s?/.test(normalizedContent);
  
  // Count list items
  const listMarkers = content.match(/(\d+\.\s|\*\s|-\s)/g);
  structure.listItems = listMarkers ? listMarkers.length : 0;
  
  // Check for question marks
  structure.hasQuestions = content.includes('?');
  
  // Check for metrics and numbers
  structure.hasMetrics = /\d+%|percent|metrics|analytics|measure|rate|ratio|score/.test(normalizedContent);
  
  // Check for dates and years
  structure.hasDates = /\b\d{4}\b|january|february|march|april|may|june|july|august|september|october|november|december/.test(normalizedContent);
  
  // Check for trends language
  structure.hasTrends = /trend|growing|increasing|decreasing|popular|emerging|latest|recent|current|forecast|future|predict/.test(normalizedContent);
  
  // Count headings (looking for bold text or potential headings)
  const potentialHeadings = content.match(/\*\*.*?\*\*|\n#+\s|^#+\s/g);
  structure.headingCount = potentialHeadings ? potentialHeadings.length : 0;
  
  return structure;
};

/**
 * Detect main topics in content 
 */
export const detectMainTopics = (content: string): string[] => {
  if (!content) return [];
  
  // Split into paragraphs
  const paragraphs = content.split(/\n\n+/);
  
  // Extract first sentence from each paragraph as potential topics
  const topics = paragraphs.map(p => {
    const firstSentence = p.split(/[.!?]/)
      .filter(Boolean)[0]?.trim();
    
    if (!firstSentence || firstSentence.length < 10) {
      return null;
    }
    
    // Further extract subject from sentence (simplistic approach)
    const simpleSubject = firstSentence.split(/\s+/).slice(0, 4).join(' ');
    
    return simpleSubject;
  }).filter(Boolean);
  
  // Remove duplicates and return
  return Array.from(new Set(topics)).slice(0, 5);
};
