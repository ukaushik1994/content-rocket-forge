
/**
 * Advanced utility for generating data-driven title suggestions
 */
import { extractKeyPhrases } from '../nlp/textAnalysis';
import { analyzeContentStructure } from '../nlp/contentStructure';

/**
 * Generate compelling title suggestions based on content and keywords
 * using advanced content analysis
 */
export const generateTitleSuggestions = async (content: string, mainKeyword: string, selectedKeywords: string[] = []) => {
  console.log("[documentAnalysis] Generating title suggestions for:", mainKeyword);
  
  if (!content || content.length < 100) {
    return getBasicTitles(mainKeyword, selectedKeywords);
  }
  
  // Analyze first 300 words of content to extract themes
  const firstWords = content.split(/\s+/).slice(0, 300).join(' ');
  
  // Extract key phrases and topics from the content
  const keyPhrases = extractKeyPhrases(firstWords);
  
  // Analyze content structure to determine best title format
  const contentStructure = analyzeContentStructure(firstWords);
  
  // Create different title patterns based on content analysis
  const titleFormats = [];
  
  // If content is instructional, use How-to format
  if (contentStructure.isInstructional) {
    titleFormats.push(`How to Master ${mainKeyword}: A Complete Guide`);
    titleFormats.push(`${mainKeyword} Tutorial: Step-by-Step Guide to Success`);
  }
  
  // If content has metrics or lists, use list format
  if (contentStructure.hasList || contentStructure.hasMetrics) {
    const number = contentStructure.listItems > 0 ? contentStructure.listItems : 
                  (Math.floor(Math.random() * 3) + 5); // 5-7 if we can't detect exact number
    titleFormats.push(`Top ${number} ${mainKeyword} Strategies for Better Results`);
    titleFormats.push(`${number} Effective Ways to Improve Your ${mainKeyword}`);
  }
  
  // If content is question-heavy, use question format
  if (contentStructure.hasQuestions) {
    titleFormats.push(`Why is ${mainKeyword} Essential for Your Strategy?`);
    titleFormats.push(`What Makes ${mainKeyword} So Important in ${new Date().getFullYear()}?`);
  }
  
  // Get a relevant secondary phrase from the content
  let secondaryPhrase = keyPhrases.length > 0 ? 
    keyPhrases[0].replace(mainKeyword.toLowerCase(), '').trim() : 
    '';
  
  if (secondaryPhrase) {
    // Capitalize first letter
    secondaryPhrase = secondaryPhrase.charAt(0).toUpperCase() + secondaryPhrase.slice(1);
    
    // Add benefit-driven title with the extracted phrase
    titleFormats.push(`${mainKeyword}: ${secondaryPhrase} for Better Results`);
  }
  
  // Add default formats to ensure we have enough options
  titleFormats.push(`The Ultimate Guide to ${mainKeyword}`);
  titleFormats.push(`${mainKeyword}: Best Practices for Success in ${new Date().getFullYear()}`);
  titleFormats.push(`Mastering ${mainKeyword}: A Comprehensive Guide`);
  
  // Add secondary keywords to some titles if available
  if (selectedKeywords && selectedKeywords.length > 0) {
    const secondaryKeyword = selectedKeywords[0];
    if (secondaryKeyword && secondaryKeyword !== mainKeyword) {
      titleFormats.push(`${mainKeyword} and ${secondaryKeyword}: The Perfect Combination`);
      
      // If content is analytical, use strategic format
      if (contentStructure.isAnalytical) {
        titleFormats.push(`${mainKeyword} Strategy: Incorporating ${secondaryKeyword} for Better Results`);
      }
    }
  }
  
  // Add a title with year if the content mentions dates or trends
  if (contentStructure.hasDates || contentStructure.hasTrends) {
    const currentYear = new Date().getFullYear();
    titleFormats.push(`${mainKeyword} in ${currentYear}: Trends and Best Practices`);
  }
  
  // Filter out duplicate title styles and limit to 10
  const uniqueTitles = Array.from(new Set(titleFormats)).slice(0, 10);
  
  console.log("[documentAnalysis] Generated title suggestions:", uniqueTitles);
  return uniqueTitles;
};

/**
 * Generate basic titles when content analysis isn't possible
 */
const getBasicTitles = (mainKeyword: string, selectedKeywords: string[] = []) => {
  const titles = [
    `The Ultimate Guide to ${mainKeyword}`,
    `How to Master ${mainKeyword}: Complete Guide`,
    `${mainKeyword}: Best Practices for Success`,
    `Mastering ${mainKeyword}: Everything You Need to Know`,
    `${mainKeyword} 101: A Beginner's Guide`,
  ];
  
  // Add secondary keyword if available
  if (selectedKeywords.length > 0) {
    const secondaryKeyword = selectedKeywords[0];
    if (secondaryKeyword && secondaryKeyword !== mainKeyword) {
      titles.push(`${mainKeyword} and ${secondaryKeyword}: The Perfect Combination`);
    }
  }
  
  return titles;
};
