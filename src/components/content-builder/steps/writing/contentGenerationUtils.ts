
import { OutlineSection, Solution } from '@/contexts/content-builder/types';

/**
 * DEPRECATED: Mock content generation - use real AI instead
 * This function should only be used as a last resort fallback
 */
export const generateDemoContent = (
  title: string,
  mainKeyword: string,
  outline: OutlineSection[],
  selectedSolution: Solution | null
): string => {
  console.warn('⚠️ Using deprecated demo content generation. Please configure OpenRouter API key for real content generation.');
  // Create a title based on the main keyword if not provided
  const contentTitle = title || `Complete Guide to ${mainKeyword}`;
  
  // Start with the title as an H1
  let content = `# ${contentTitle}\n\n`;
  
  // Add an introduction
  content += `## Introduction\n\n`;
  content += `Welcome to our comprehensive guide on ${mainKeyword}. In this article, we'll explore everything you need to know about this topic, providing valuable insights and practical advice.\n\n`;
  
  // If there's a selected solution, mention it in the intro
  if (selectedSolution) {
    content += `As experts in ${mainKeyword}, we understand the challenges you face. That's why we recommend ${selectedSolution.name} as a solution that can address your needs effectively.\n\n`;
  }
  
  // Add content sections from the outline
  if (outline && outline.length > 0) {
    outline.forEach(section => {
      const headingLevel = section.level || 2;
      const headingMarker = '#'.repeat(headingLevel);
      
      content += `${headingMarker} ${section.title}\n\n`;
      
      // Add demo paragraph content
      content += `This section covers important aspects of ${section.title.toLowerCase()}. ${generateRandomParagraph(mainKeyword, section.title)}\n\n`;
      
      // Add subsections if they exist
      if (section.children && section.children.length > 0) {
        section.children.forEach(subSection => {
          const subHeadingLevel = (headingLevel + 1) > 6 ? 6 : (headingLevel + 1);
          const subHeadingMarker = '#'.repeat(subHeadingLevel);
          
          content += `${subHeadingMarker} ${subSection.title}\n\n`;
          content += `${generateRandomParagraph(mainKeyword, subSection.title)}\n\n`;
        });
      }
    });
  } else {
    // Generate some default sections if no outline is provided
    const defaultSections = [
      "What is " + mainKeyword,
      "Benefits of " + mainKeyword,
      "How to Get Started with " + mainKeyword,
      "Common Challenges and Solutions",
      "Best Practices for " + mainKeyword
    ];
    
    defaultSections.forEach(sectionTitle => {
      content += `## ${sectionTitle}\n\n`;
      content += `${generateRandomParagraph(mainKeyword, sectionTitle)}\n\n`;
    });
  }
  
  // Add a conclusion
  content += `## Conclusion\n\n`;
  content += `In conclusion, ${mainKeyword} offers significant benefits for those who take the time to understand and implement it correctly. We hope this guide has provided you with valuable information to help you succeed with ${mainKeyword}.\n\n`;
  
  // If there's a solution, add a call-to-action
  if (selectedSolution) {
    content += `### Ready to take your ${mainKeyword} strategy to the next level?\n\n`;
    content += `${selectedSolution.name} provides all the tools and features you need to excel with ${mainKeyword}. With benefits like ${selectedSolution.features.slice(0, 3).join(', ')}, you'll be well-equipped to overcome common challenges and achieve your goals.\n\n`;
  }
  
  return content;
};

/**
 * Generates a random paragraph related to the keyword and section title
 */
const generateRandomParagraph = (keyword: string, sectionTitle: string): string => {
  const paragraphs = [
    `${sectionTitle} is a crucial aspect of ${keyword} that deserves careful attention. By understanding the core principles involved, you can develop more effective strategies and achieve better results. Many experts in the field recommend starting with a thorough analysis of your current approach before making any significant changes.`,
    
    `When exploring ${sectionTitle.toLowerCase()}, it's important to consider how it fits within your broader ${keyword} strategy. This interconnection allows for a more holistic approach and ensures that all elements work together harmoniously. Research has shown that an integrated approach yields significantly better outcomes than treating each component in isolation.`,
    
    `Recent developments in ${keyword} have transformed how we think about ${sectionTitle.toLowerCase()}. These innovations have opened up new possibilities and challenged traditional assumptions in the field. By staying informed about these changes, you can position yourself at the forefront of industry best practices.`,
    
    `Successful implementation of ${sectionTitle.toLowerCase()} requires both technical knowledge and strategic thinking. It's not enough to simply understand the mechanics; you must also appreciate how these elements contribute to your overall objectives related to ${keyword}. This dual perspective enables more nuanced decision-making and better resource allocation.`,
    
    `Many organizations struggle with optimizing their ${sectionTitle.toLowerCase()} within their ${keyword} framework. Common challenges include inadequate planning, insufficient resources, and a lack of clear metrics for success. By addressing these issues proactively, you can avoid the pitfalls that hinder progress and limit potential gains.`
  ];
  
  // Return a random paragraph from the list
  return paragraphs[Math.floor(Math.random() * paragraphs.length)];
};
