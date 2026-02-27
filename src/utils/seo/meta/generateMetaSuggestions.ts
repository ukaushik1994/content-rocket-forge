/**
 * Utility for generating meta tags suggestions
 */

/**
 * Generate meta title and description suggestions based on content
 */
export const generateMetaSuggestions = (content: string, mainKeyword: string, contentTitle: string) => {
  console.log("[documentAnalysis] Generating meta suggestions for:", { mainKeyword, contentTitle });
  
  // Extract first paragraph for potential description content
  const firstParagraph = content.split('\n\n')[0].replace(/[#*_]/g, '').trim();
  const contentExcerpt = content.substring(0, 300).replace(/[#*_]/g, '').trim();
  
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
  
  // Ensure title is within 50-60 character range
  if (metaTitle.length > 60) {
    metaTitle = metaTitle.substring(0, 57) + '...';
  }
  
  // Pad short titles to reach minimum 50 characters
  if (metaTitle.length < 50) {
    // Try appending keyword context
    if (!metaTitle.includes(mainKeyword) && metaTitle.length + mainKeyword.length + 3 <= 60) {
      metaTitle = `${metaTitle} | ${mainKeyword}`;
    }
    // Try adding a year or descriptor
    if (metaTitle.length < 50) {
      const year = new Date().getFullYear();
      if (metaTitle.length + 7 <= 60) {
        metaTitle = `${metaTitle} (${year})`;
      }
    }
    // Final pad with "Expert Guide" or similar
    if (metaTitle.length < 50 && metaTitle.length + 16 <= 60) {
      metaTitle = `${metaTitle} - Expert Guide`;
    }
  }
  
  // Generate a meta description (max 160 characters)
  let metaDescription = '';
  
  if (firstParagraph && firstParagraph.length > 20) {
    // Use the first paragraph if it's substantial
    metaDescription = firstParagraph;
  } else if (contentExcerpt) {
    // Otherwise use general content excerpt
    metaDescription = `${contentExcerpt}...`;
  } else {
    // Fallback to a generic description
    metaDescription = `Learn about ${mainKeyword} in this comprehensive guide. Get expert tips, strategies, and insights to improve your knowledge.`;
  }
  
  // Ensure description isn't too long
  if (metaDescription.length > 160) {
    metaDescription = metaDescription.substring(0, 157) + '...';
  }
  
  console.log("[documentAnalysis] Generated:", { metaTitle, metaDescription });
  
  return {
    metaTitle,
    metaDescription
  };
};
