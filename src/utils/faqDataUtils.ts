
/**
 * Utility functions for standardizing and validating FAQ data
 */

export interface StandardizedFAQ {
  id: string;
  question: string;
  answer?: string;
  source?: string;
  metadata?: Record<string, any>;
}

export interface FAQValidationResult {
  isValid: boolean;
  error?: string;
  data?: StandardizedFAQ;
}

/**
 * Safely extracts string content from any data type
 */
export const extractStringContent = (content: any): string => {
  if (typeof content === 'string') {
    return content.trim();
  }
  
  if (typeof content === 'object' && content !== null) {
    // Handle objects with block_position and items
    if (content.items && Array.isArray(content.items)) {
      return content.items
        .map((item: any) => typeof item === 'string' ? item : String(item))
        .join(', ')
        .trim();
    }
    
    // Handle FAQ-specific object structures
    if (content.question) return String(content.question).trim();
    if (content.text) return String(content.text).trim();
    if (content.title) return String(content.title).trim();
    
    // Fallback for other objects
    try {
      return JSON.stringify(content);
    } catch {
      return String(content);
    }
  }
  
  return String(content || '').trim();
};

/**
 * Standardizes FAQ data from various sources into a consistent format
 */
export const standardizeFAQData = (rawData: any, index: number = 0): FAQValidationResult => {
  try {
    // Handle null or undefined data
    if (!rawData) {
      return {
        isValid: false,
        error: 'FAQ data is null or undefined'
      };
    }

    let question = '';
    let answer = '';
    let source = '';

    // Extract question based on data structure
    if (typeof rawData === 'string') {
      question = rawData;
    } else if (typeof rawData === 'object') {
      question = rawData.question || rawData.text || rawData.title || extractStringContent(rawData);
      answer = rawData.answer || rawData.snippet || '';
      source = rawData.source || rawData.link || rawData.url || '';
    }

    // Validate that we have at least a question
    if (!question || question.length < 3) {
      return {
        isValid: false,
        error: 'Question is too short or missing'
      };
    }

    // Create standardized FAQ object
    const standardizedFAQ: StandardizedFAQ = {
      id: `faq-${index}-${question.substring(0, 20).replace(/\s+/g, '-').toLowerCase()}`,
      question: question,
      answer: answer || undefined,
      source: source || undefined,
      metadata: {
        originalData: rawData,
        extractedAt: new Date().toISOString()
      }
    };

    return {
      isValid: true,
      data: standardizedFAQ
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Failed to standardize FAQ data: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Validates an array of FAQ data and returns only valid entries
 */
export const validateAndStandardizeFAQList = (rawFAQList: any[]): StandardizedFAQ[] => {
  if (!Array.isArray(rawFAQList)) {
    console.warn('FAQ list is not an array:', rawFAQList);
    return [];
  }

  const validFAQs: StandardizedFAQ[] = [];
  
  rawFAQList.forEach((rawFAQ, index) => {
    const result = standardizeFAQData(rawFAQ, index);
    if (result.isValid && result.data) {
      validFAQs.push(result.data);
    } else {
      console.warn(`Invalid FAQ at index ${index}:`, result.error);
    }
  });

  return validFAQs;
};

/**
 * Creates a unique identifier for FAQ content to ensure consistent selection tracking
 */
export const createFAQContentId = (faq: StandardizedFAQ): string => {
  // Create a consistent ID based on question content
  const cleanQuestion = faq.question.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
  return `faq-${cleanQuestion.substring(0, 50)}`;
};

/**
 * Checks if two FAQ items represent the same content
 */
export const isSameFAQContent = (faq1: StandardizedFAQ, faq2: StandardizedFAQ): boolean => {
  return createFAQContentId(faq1) === createFAQContentId(faq2);
};
