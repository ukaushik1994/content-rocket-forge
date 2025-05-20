
/**
 * AI Processing Service
 * Handles AI text generation and processing
 */
import { toast } from 'sonner';
 
/**
 * Generate an SEO report for given content and keywords
 */
export const generateSeoReport = async (
  content: string, 
  keywords: string[]
): Promise<string> => {
  try {
    // This is a mock implementation for now
    // For a real implementation, this would call an AI API
    console.log('Generating SEO report for content with keywords:', keywords);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate a mock score between 60 and 95
    const score = Math.floor(Math.random() * 36) + 60;
    
    // Basic mock report based on word count and keyword usage
    const wordCount = content.split(/\s+/).length;
    const keywordDensity = keywords.map(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = content.match(regex);
      const count = matches ? matches.length : 0;
      const density = wordCount > 0 ? (count / wordCount) * 100 : 0;
      return { keyword, count, density: density.toFixed(1) };
    });
    
    // Build the report
    let report = `SEO Analysis Report\n\n`;
    report += `Score: ${score}\n\n`;
    report += `Content Length: ${wordCount} words\n`;
    report += wordCount < 300 ? '⚠️ Content may be too short for optimal SEO\n' : '✅ Content length is good\n';
    
    report += `\nKeyword Analysis:\n`;
    keywordDensity.forEach(k => {
      report += `- "${k.keyword}": ${k.count} occurrences (${k.density}%)\n`;
      if (parseFloat(k.density) > 3) {
        report += `  ⚠️ Keyword density may be too high, consider reducing usage\n`;
      } else if (parseFloat(k.density) < 0.5) {
        report += `  ⚠️ Keyword density may be too low, consider adding more occurrences\n`;
      } else {
        report += `  ✅ Keyword density is within good range\n`;
      }
    });
    
    report += `\nRecommendations:\n`;
    if (wordCount < 300) {
      report += `- Add more content to reach at least 500 words for better SEO\n`;
    }
    if (!content.includes('<h1>') && !content.includes('<h2>')) {
      report += `- Add header tags (H1, H2) to structure your content\n`;
    }
    report += `- Ensure your content answers user questions related to the main keywords\n`;
    report += `- Add internal links to other relevant content on your site\n`;
    
    return report;
  } catch (error) {
    console.error('Error generating SEO report:', error);
    toast.error('Failed to generate SEO report');
    return 'Could not generate SEO report. Please try again later.';
  }
};

/**
 * Generate meta title and description based on content
 */
export const generateMetaTags = async (content: string, keywords: string[]): Promise<{
  metaTitle: string;
  metaDescription: string;
}> => {
  try {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Use the primary keyword for the title if available
    const primaryKeyword = keywords.length > 0 ? keywords[0] : '';
    const contentStart = content.substring(0, 200);
    
    // Generate a simple meta title
    let metaTitle = primaryKeyword ? 
      `${primaryKeyword.charAt(0).toUpperCase() + primaryKeyword.slice(1)}: Complete Guide & Tips` :
      'Complete Guide & Best Practices';
    
    // Generate a simple meta description
    let metaDescription = contentStart.length > 120 ?
      contentStart.substring(0, 120) + '...' :
      contentStart;
    
    if (primaryKeyword && !metaDescription.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      metaDescription = `Learn all about ${primaryKeyword} in this guide. ${metaDescription}`;
    }
    
    // Truncate if too long
    if (metaTitle.length > 60) metaTitle = metaTitle.substring(0, 57) + '...';
    if (metaDescription.length > 160) metaDescription = metaDescription.substring(0, 157) + '...';
    
    return { metaTitle, metaDescription };
  } catch (error) {
    console.error('Error generating meta tags:', error);
    toast.error('Failed to generate meta tags');
    return { 
      metaTitle: 'Generated Title', 
      metaDescription: 'Generated description for this content. Please edit this to add more details about your content.'
    };
  }
};
