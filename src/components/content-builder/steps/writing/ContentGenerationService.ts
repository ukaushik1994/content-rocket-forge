
import { toast } from "sonner";
import { AiProvider } from "@/services/aiService/types";
import { Solution } from "@/contexts/content-builder/types";
import { supabase } from "@/integrations/supabase/client";

export const generateContent = async (
  aiProvider: AiProvider,
  mainKeyword: string,
  contentTitle: string,
  outline: string,
  secondaryKeywords: string,
  selectedSolution: Solution | null,
  additionalInstructions: string,
  setIsGenerating: (isGenerating: boolean) => void,
  handleContentChange: (content: string) => void,
  selectedCountries: string[] = ['us'] // Add country parameter
) => {
  setIsGenerating(true);
  toast.loading("Generating content...");
  
  try {
    // In a real implementation, this would send the country parameter to the AI service
    // For now, we'll simulate a delay and generate mock content
    
    // Prepare solution context if available
    const solutionContext = selectedSolution
      ? `Integrate information about the solution "${selectedSolution.name}" which is ${selectedSolution.description}. Focus on how this solution helps with ${mainKeyword}.`
      : '';
    
    // Add country context to the prompt
    const countryContext = selectedCountries.length > 1 
      ? `Create content that's relevant for multiple regions: ${selectedCountries.join(', ')}. Include region-specific information where appropriate.`
      : selectedCountries[0] !== 'us'
        ? `Optimize this content for the ${selectedCountries[0]} market.`
        : '';
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate a mock article
    const article = generateMockArticle(
      mainKeyword,
      contentTitle,
      outline,
      secondaryKeywords,
      solutionContext,
      additionalInstructions,
      countryContext // Add country context to the mock generation
    );
    
    // Set the generated content
    handleContentChange(article);
    
    toast.success("Content generated successfully!");
  } catch (error) {
    console.error("Error generating content:", error);
    toast.error("Failed to generate content. Please try again.");
  } finally {
    setIsGenerating(false);
    toast.dismiss();
  }
};

const generateMockArticle = (
  mainKeyword: string, 
  title: string, 
  outline: string,
  secondaryKeywords: string,
  solutionContext: string,
  additionalInstructions: string,
  countryContext: string // Add country context parameter
) => {
  // Parse the outline into sections
  const outlineItems = outline
    .split('\n')
    .filter(Boolean)
    .map(line => line.replace(/^\d+\.\s*/, '').trim());
  
  // Create mock title if not provided
  const articleTitle = title || `The Ultimate Guide to ${mainKeyword}`;
  
  // Introduction
  let article = `# ${articleTitle}\n\n`;
  
  // Add country-specific introduction if country context exists
  if (countryContext) {
    article += `${countryContext}\n\n`;
  }
  
  article += `## Introduction\n\nWelcome to this comprehensive guide on ${mainKeyword}. `;
  article += `In this article, we'll explore everything you need to know about ${mainKeyword}, `;
  article += `including best practices, strategies, and implementation techniques. `;
  article += `${secondaryKeywords ? `We'll also cover related topics such as ${secondaryKeywords}.` : ''}\n\n`;
  
  // Add solution context if available
  if (solutionContext) {
    article += `${solutionContext}\n\n`;
  }
  
  // Generate content for each outline section
  outlineItems.forEach((section, index) => {
    // Skip Introduction and Conclusion as they're handled separately
    if (section.toLowerCase() === 'introduction') return;
    
    const isConclusion = section.toLowerCase() === 'conclusion';
    if (isConclusion) return;
    
    article += `## ${section}\n\n`;
    
    // Generate paragraphs based on the section title
    article += generateSectionContent(section, mainKeyword, secondaryKeywords.split(',').map(k => k.trim()));
    
    // Add a transition to the next section
    if (index < outlineItems.length - 1 && !isConclusion) {
      article += `\n\nNow, let's move on to discuss ${outlineItems[index + 1]}.\n\n`;
    }
  });
  
  // Conclusion
  article += `## Conclusion\n\n`;
  article += `In conclusion, ${mainKeyword} plays a crucial role in modern business and technology landscapes. `;
  article += `By implementing the strategies and best practices outlined in this guide, `;
  article += `you can effectively leverage ${mainKeyword} to achieve your goals. `;
  article += `Remember to stay updated with the latest trends and developments in ${mainKeyword} to maintain a competitive edge.\n\n`;
  
  // Add any additional instructions as notes at the end
  if (additionalInstructions) {
    article += `---\n\n`;
    article += `*Note: ${additionalInstructions}*\n`;
  }
  
  return article;
};

const generateSectionContent = (section: string, mainKeyword: string, secondaryKeywords: string[]) => {
  // Extract key terms from the section title
  const sectionLower = section.toLowerCase();
  let content = '';
  
  // Generate 2-3 paragraphs based on section title
  for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
    if (sectionLower.includes('what is') || sectionLower.includes('understanding')) {
      content += generateDefinitionParagraph(mainKeyword, secondaryKeywords);
    } else if (sectionLower.includes('benefits') || sectionLower.includes('advantages')) {
      content += generateBenefitsParagraph(mainKeyword, secondaryKeywords);
    } else if (sectionLower.includes('how to') || sectionLower.includes('implement')) {
      content += generateHowToParagraph(mainKeyword, secondaryKeywords);
    } else if (sectionLower.includes('best practices') || sectionLower.includes('strategies')) {
      content += generateBestPracticesParagraph(mainKeyword, secondaryKeywords);
    } else if (sectionLower.includes('case stud') || sectionLower.includes('example')) {
      content += generateCaseStudyParagraph(mainKeyword, secondaryKeywords);
    } else {
      content += generateGenericParagraph(mainKeyword, section, secondaryKeywords);
    }
    content += '\n\n';
  }
  
  // Occasionally add a list or bullet points
  if (Math.random() > 0.5) {
    content += generateBulletPoints(section, mainKeyword);
    content += '\n\n';
  }
  
  return content;
};

// Helper functions to generate different types of paragraphs
const generateDefinitionParagraph = (keyword: string, secondaryKeywords: string[]) => {
  // Mock definition paragraph
  return `${keyword} refers to a set of methodologies and tools designed to optimize business processes and improve outcomes. As organizations increasingly focus on digital transformation, ${keyword} has emerged as a critical component of modern strategy. It encompasses various techniques, technologies, and approaches that enable businesses to achieve their goals more efficiently.`;
};

const generateBenefitsParagraph = (keyword: string, secondaryKeywords: string[]) => {
  // Mock benefits paragraph
  return `Implementing ${keyword} offers numerous benefits, including increased efficiency, cost reduction, and improved customer satisfaction. Organizations that effectively leverage ${keyword} typically see a significant return on investment within the first year. Beyond the immediate financial benefits, ${keyword} also helps businesses stay competitive in rapidly evolving markets.`;
};

const generateHowToParagraph = (keyword: string, secondaryKeywords: string[]) => {
  // Mock how-to paragraph
  return `To implement ${keyword} successfully, start by defining clear objectives and key performance indicators. Then, assemble a cross-functional team with expertise in relevant areas such as ${secondaryKeywords[0] || 'analytics'} and ${secondaryKeywords[1] || 'strategy'}. Develop a phased implementation plan that allows for testing and refinement at each stage. This iterative approach minimizes risks and enables continuous improvement.`;
};

const generateBestPracticesParagraph = (keyword: string, secondaryKeywords: string[]) => {
  // Mock best practices paragraph
  return `When working with ${keyword}, it's essential to follow established best practices. These include regular monitoring and evaluation, stakeholder engagement, and continuous learning. Successful organizations often establish centers of excellence for ${keyword} to standardize approaches and share knowledge across departments. Documentation and training are also critical components of a successful ${keyword} program.`;
};

const generateCaseStudyParagraph = (keyword: string, secondaryKeywords: string[]) => {
  // Mock case study paragraph
  return `A leading company in the ${secondaryKeywords[0] || 'technology'} sector implemented ${keyword} across their operations and saw a 35% increase in productivity within six months. Their approach involved integrating ${keyword} with existing ${secondaryKeywords[1] || 'systems'} and providing comprehensive training to all staff. The organization particularly focused on measuring outcomes and refining their approach based on data-driven insights.`;
};

const generateGenericParagraph = (keyword: string, section: string, secondaryKeywords: string[]) => {
  // Mock generic paragraph that incorporates the section title
  return `${section} is a crucial aspect of ${keyword} that deserves careful attention. Organizations that excel in this area typically develop comprehensive strategies that address both immediate needs and long-term objectives. By focusing on ${section.toLowerCase()}, businesses can unlock new opportunities and overcome common challenges in the ${keyword} landscape.`;
};

const generateBulletPoints = (section: string, keyword: string) => {
  // Generate a list of bullet points relevant to the section
  const points = [
    `Regularly audit your ${keyword} implementations for optimization opportunities`,
    `Integrate ${keyword} with existing business processes for seamless operations`,
    `Train team members on ${keyword} best practices and latest developments`,
    `Measure and analyze the impact of ${keyword} on business objectives`,
    `Stay informed about industry trends and emerging technologies related to ${keyword}`
  ];
  
  let bulletList = `Key points to remember about ${section}:\n\n`;
  points.forEach(point => {
    bulletList += `- ${point}\n`;
  });
  
  return bulletList;
};

export const saveContentToDraft = async (
  title: string,
  content: string,
  mainKeyword: string,
  secondaryKeywords: string[],
  notes: string,
  outline: string[],
  setIsSaving: (isSaving: boolean) => void,
  setShowSaveDialog: (show: boolean) => void
) => {
  setIsSaving(true);
  toast.loading("Saving content draft...");
  
  try {
    // In a real implementation, this would save to a database via an API
    // For now, we'll simulate a delay and show a success message
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Add the content to the supabase table
    const { data, error } = await supabase.from('content_drafts').insert({
      title,
      content,
      main_keyword: mainKeyword,
      secondary_keywords: secondaryKeywords,
      notes,
      outline,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'draft',
      user_id: '1', // In a real app, this would be the actual user's ID
    });
    
    if (error) throw error;
    
    toast.success("Content saved to drafts!");
    setShowSaveDialog(false);
  } catch (error) {
    console.error("Error saving content draft:", error);
    toast.error("Failed to save content. Please try again.");
  } finally {
    setIsSaving(false);
    toast.dismiss();
  }
};
