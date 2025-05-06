/**
 * Advanced utility for generating meta tags suggestions
 */

import { extractKeyPhrases } from '../nlp/textAnalysis';
import { analyzeContentStructure } from '../nlp/contentStructure';

/**
 * Generate meta title and description suggestions based on content analysis
 */
export const generateMetaSuggestions = (content: string, mainKeyword: string, contentTitle: string) => {
  console.log("[documentAnalysis] Generating meta suggestions for:", { mainKeyword, contentTitle });
  
  if (!content || content.length < 100) {
    return getBasicMetaSuggestions(mainKeyword, contentTitle);
  }
  
  // Extract first paragraph or ~200 chars for analysis
  const firstParagraph = content.split(/\n\n+/)[0] || '';
  const previewText = content.substring(0, 300);
  
  // Extract key phrases from the content
  const keyPhrases = extractKeyPhrases(previewText);
  
  // Analyze content structure
  const contentStructure = analyzeContentStructure(previewText);
  
  // Generate title based on content analysis and existing title
  let metaTitle = generateMetaTitle(contentTitle, mainKeyword, keyPhrases, contentStructure);
  
  // Generate description based on content analysis
  const metaDescription = generateMetaDescription(
    firstParagraph, 
    mainKeyword, 
    keyPhrases, 
    contentStructure
  );
  
  console.log("[documentAnalysis] Generated:", { metaTitle, metaDescription });
  
  return {
    metaTitle,
    metaDescription
  };
};

/**
 * Generate meta title based on content analysis
 */
const generateMetaTitle = (
  existingTitle: string, 
  mainKeyword: string, 
  keyPhrases: string[], 
  contentStructure: any
): string => {
  // If we have a good existing title, optimize it
  if (existingTitle && existingTitle !== 'Untitled' && existingTitle.length > 10) {
    // Check if the title already contains the main keyword
    if (existingTitle.toLowerCase().includes(mainKeyword.toLowerCase())) {
      // Title already has keyword, just optimize length if needed
      if (existingTitle.length > 60) {
        return existingTitle.substring(0, 57) + '...';
      }
      return existingTitle;
    }
    
    // Add keyword if not present and title is short enough
    if (existingTitle.length + mainKeyword.length + 3 <= 60) {
      return `${existingTitle} | ${mainKeyword}`;
    }
    
    // If adding keyword would make it too long, truncate existing title
    const maxLength = 60 - mainKeyword.length - 3;
    return `${existingTitle.substring(0, maxLength)}... | ${mainKeyword}`;
  }
  
  // Generate new title based on content structure and keyword
  let newTitle = '';
  
  // If content is instructional, use How-to format
  if (contentStructure.isInstructional) {
    newTitle = `How to Master ${mainKeyword}: Complete Guide`;
  }
  // If content has lists or metrics, use list format
  else if (contentStructure.hasList || contentStructure.hasMetrics) {
    newTitle = `Top Strategies for ${mainKeyword} Success`;
  }
  // If content is question-heavy, use question format
  else if (contentStructure.hasQuestions) {
    newTitle = `${mainKeyword}: Essential Questions Answered`;
  }
  // Default format with secondary keyword if available
  else if (keyPhrases.length > 0) {
    const secondaryPhrase = keyPhrases[0]
      .replace(mainKeyword.toLowerCase(), '')
      .trim();
    
    if (secondaryPhrase) {
      // Capitalize first letter of phrase
      const capitalizedPhrase = secondaryPhrase.charAt(0).toUpperCase() + secondaryPhrase.slice(1);
      newTitle = `${mainKeyword}: ${capitalizedPhrase}`;
    } else {
      newTitle = `${mainKeyword} - Complete Guide ${new Date().getFullYear()}`;
    }
  } else {
    newTitle = `${mainKeyword} - Complete Guide ${new Date().getFullYear()}`;
  }
  
  // Ensure title isn't too long for SEO
  if (newTitle.length > 60) {
    newTitle = newTitle.substring(0, 57) + '...';
  }
  
  return newTitle;
};

/**
 * Generate meta description based on content analysis
 */
const generateMetaDescription = (
  firstParagraph: string, 
  mainKeyword: string, 
  keyPhrases: string[], 
  contentStructure: any
): string => {
  let description = '';
  
  // Try to extract a meaningful description from the first paragraph
  if (firstParagraph && firstParagraph.length > 50) {
    // Remove markdown and clean up
    const cleanParagraph = firstParagraph
      .replace(/[*#_\[\]()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // If paragraph is short enough, use it directly
    if (cleanParagraph.length <= 155) {
      description = cleanParagraph;
    }
    // Otherwise, trim it and ensure it ends with a complete sentence
    else {
      const sentences = cleanParagraph.split(/[.!?]+/).filter(Boolean);
      
      if (sentences.length === 1) {
        // Single long sentence, just trim it
        description = cleanParagraph.substring(0, 155) + '...';
      } else {
        // Multiple sentences, use as many complete ones as fit
        let currentDesc = '';
        let i = 0;
        
        while (i < sentences.length && 
               (currentDesc + sentences[i] + '.').length <= 155) {
          currentDesc += sentences[i] + '. ';
          i++;
        }
        
        description = currentDesc.trim();
      }
    }
    
    // Ensure the description contains the main keyword
    if (!description.toLowerCase().includes(mainKeyword.toLowerCase())) {
      // Try to prepend with keyword if there's space
      const withKeyword = `${mainKeyword}: ${description}`;
      
      if (withKeyword.length <= 155) {
        description = withKeyword;
      }
      // Otherwise, create a new description with the keyword
      else {
        description = `Learn about ${mainKeyword} in this comprehensive guide. ${
          description.substring(0, 155 - 25 - mainKeyword.length)
        }...`;
      }
    }
  } 
  // If we can't extract from first paragraph, create a generic description
  else {
    // Base description
    description = `Learn about ${mainKeyword} in this comprehensive guide.`;
    
    // Add secondary phrase if available
    if (keyPhrases.length > 0) {
      const secondaryPhrase = keyPhrases[0]
        .replace(mainKeyword.toLowerCase(), '')
        .trim();
      
      if (secondaryPhrase && description.length + secondaryPhrase.length + 10 <= 155) {
        description += ` Discover ${secondaryPhrase} and more.`;
      }
    }
    
    // Add more context based on content structure
    if (contentStructure.isInstructional && description.length + 30 <= 155) {
      description += ` Step-by-step instructions included.`;
    } else if (contentStructure.hasList && description.length + 35 <= 155) {
      description += ` Includes practical tips and strategies.`;
    }
    
    // Add a call to action if there's room
    if (description.length + 20 <= 155) {
      description += ` Read more now.`;
    }
  }
  
  // Ensure it's not too long
  if (description.length > 155) {
    description = description.substring(0, 152) + '...';
  }
  
  return description;
};

/**
 * Generate basic meta suggestions when content analysis isn't possible
 */
const getBasicMetaSuggestions = (mainKeyword: string, contentTitle: string) => {
  let metaTitle = '';
  
  // Use existing content title if meaningful
  if (contentTitle && contentTitle !== 'Untitled') {
    metaTitle = contentTitle.includes(mainKeyword) 
      ? contentTitle 
      : `${contentTitle} | ${mainKeyword}`;
  } else {
    // Create a new title
    metaTitle = `${mainKeyword} - Complete Guide`;
  }
  
  // Ensure title isn't too long
  if (metaTitle.length > 60) {
    metaTitle = metaTitle.substring(0, 57) + '...';
  }
  
  // Create a generic meta description
  const metaDescription = `Learn about ${mainKeyword} in this comprehensive guide. Get expert tips, strategies, and insights to improve your results.`;
  
  return {
    metaTitle,
    metaDescription
  };
};
