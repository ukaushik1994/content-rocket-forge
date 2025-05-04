
/**
 * Utility for generating meta tags suggestions
 */

/**
 * Generate meta title and description suggestions based on content
 */
export const generateMetaSuggestions = (content: string, mainKeyword: string, contentTitle: string) => {
  console.log("[documentAnalysis] Generating meta suggestions for:", { mainKeyword, contentTitle });
  
  // Generate a meta title (50-60 characters)
  let metaTitle = '';
  if (contentTitle && contentTitle.length > 0 && contentTitle !== 'Untitled') {
    // Use existing content title if it's meaningful
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
  
  // Generate a meta description (150-160 characters)
  const metaDescription = `Learn about ${mainKeyword} in this comprehensive guide. Get expert tips, strategies, and insights to improve your SEO and boost your search engine rankings.`;
  
  console.log("[documentAnalysis] Generated:", { metaTitle, metaDescription });
  
  return {
    metaTitle,
    metaDescription
  };
};
