
import { 
  PromptTemplate, 
  getPromptTemplateById, 
  getPromptTemplatesByType, 
  getBrandGuidelines 
} from './userPreferences';
import { sendChatRequest } from './aiService';
import { toast } from 'sonner';

/**
 * Generate content using a prompt template
 */
export async function generateContentWithTemplate(
  templateId: string,
  topic: string,
  additionalContext?: Record<string, string>
): Promise<string | null> {
  // Get the template
  const template = getPromptTemplateById(templateId);
  if (!template) {
    toast.error('Template not found');
    return null;
  }
  
  return generateWithTemplate(template, topic, additionalContext);
}

/**
 * Generate content using a specified content format type
 * Will use the first available template for that format type
 */
export async function generateContentByFormatType(
  formatType: string,
  topic: string,
  additionalContext?: Record<string, string>
): Promise<string | null> {
  // Get templates for this format type
  const templates = getPromptTemplatesByType(formatType);
  
  if (!templates || templates.length === 0) {
    toast.error(`No templates found for ${formatType}`);
    return null;
  }
  
  // Use the first template
  return generateWithTemplate(templates[0], topic, additionalContext);
}

/**
 * Internal method to generate content using a template
 */
async function generateWithTemplate(
  template: PromptTemplate,
  topic: string,
  additionalContext?: Record<string, string>
): Promise<string | null> {
  try {
    // Replace placeholders in the prompt template
    let promptText = template.promptTemplate.replace(/\{topic\}/g, topic);
    
    // Replace any additional context placeholders
    if (additionalContext) {
      Object.entries(additionalContext).forEach(([key, value]) => {
        promptText = promptText.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      });
    }
    
    // Create a system message based on the content type
    const systemMessage = getSystemMessageForContentType(template.formatType);
    
    // Include structure template if available
    const structureInfo = template.structureTemplate 
      ? `\n\nUse this structure for your response:\n${template.structureTemplate}`
      : '';
    
    // Add structure to prompt if available
    if (structureInfo) {
      promptText += structureInfo;
    }
    
    // Add brand guidelines if available
    const brandGuidelines = getBrandGuidelines();
    let brandGuidelinesText = '';
    
    if (brandGuidelines) {
      brandGuidelinesText = `
IMPORTANT: Follow these brand guidelines when creating the content:

Brand Name: ${brandGuidelines.brandName}
Brand Tone: ${brandGuidelines.brandTone}
Target Audience: ${brandGuidelines.targetAudience}

Key Brand Values:
${brandGuidelines.keyValues.map(value => `- ${value}`).join('\n')}

Do:
${brandGuidelines.doGuidelines.map(guideline => `- ${guideline}`).join('\n')}

Don't:
${brandGuidelines.dontGuidelines.map(guideline => `- ${guideline}`).join('\n')}
${brandGuidelines.companyDescription ? `\nCompany Description: ${brandGuidelines.companyDescription}` : ''}
`;

      promptText += `\n\n${brandGuidelinesText}`;
    }
    
    // Make the API call
    const response = await sendChatRequest('openai', {
      messages: [
        { 
          role: 'system', 
          content: systemMessage + (brandGuidelines ? "\n\nAdhere strictly to the brand guidelines provided in the user's message." : "")
        },
        { 
          role: 'user', 
          content: promptText 
        }
      ],
      temperature: 0.7
    });
    
    if (response?.choices?.[0]?.message?.content) {
      return response.choices[0].message.content;
    } else {
      toast.error('Failed to generate content');
      return null;
    }
  } catch (error) {
    console.error('Error generating content with template:', error);
    toast.error('Error generating content');
    return null;
  }
}

/**
 * Get an appropriate system message for a content type
 */
function getSystemMessageForContentType(formatType: string): string {
  switch (formatType) {
    case 'blog':
      return 'You are an expert content writer specializing in SEO-optimized blog posts. Create well-structured, engaging content that follows the provided guidelines.';
    
    case 'social-twitter':
      return 'You are a social media expert who creates concise, engaging Twitter content. Create content that follows Twitter's 280 character limit per tweet, uses effective hashtags, and drives engagement. For threads, ensure a cohesive flow between tweets.';
    
    case 'social-linkedin':
      return 'You are a LinkedIn content strategist who creates professional, thought-leadership content optimized for the platform. Create content that establishes expertise, uses appropriate professional tone, and encourages meaningful engagement from a professional network.';
    
    case 'social-facebook':
      return 'You are a social media expert who creates engaging Facebook posts that drive community interaction. Create content that encourages comments and shares, uses a conversational tone, and works well with Facebook's algorithm.';
    
    case 'social-instagram':
      return 'You are an Instagram caption specialist who creates engaging, authentic captions that complement visual content. Create captions that include effective hashtags, encourage engagement, and maintain an authentic voice that resonates with Instagram audiences.';
    
    case 'script':
      return 'You are a professional scriptwriter who creates clear, engaging scripts for video or audio content. Include appropriate timing, visual cues, and narrative structure. Write in a way that sounds natural when spoken aloud.';
    
    case 'email':
      return 'You are an email marketing specialist who creates compelling newsletter content with high open and click-through rates. Create content that is scannable, valuable to subscribers, and drives specific actions.';
    
    case 'infographic':
      return 'You are a content specialist who creates concise, data-focused content for infographics. Create content that communicates complex information visually, uses minimal text, and follows a clear visual hierarchy.';
    
    case 'glossary':
      return 'You are a technical writer specializing in creating clear, concise definitions and explanations for complex topics. Provide comprehensive information in an accessible format.';
    
    case 'case-study':
      return 'You are a business case study writer who creates compelling narratives about successful problem-solving. Create content that follows a clear problem-solution-results structure, includes specific metrics and outcomes, and tells a compelling transformation story.';
    
    case 'product-description':
      return 'You are a copywriter specializing in product descriptions that drive conversions. Create content that highlights benefits rather than just features, uses persuasive language, and addresses customer pain points.';
    
    case 'white-paper':
      return 'You are a professional technical writer who creates authoritative white papers. Create content that is research-backed, solution-oriented, and positions the brand as a thought leader while maintaining a professional tone.';
    
    case 'press-release':
      return 'You are a PR specialist who writes press releases following AP style guidelines. Create content that follows the inverted pyramid structure, uses an objective third-person tone, and effectively communicates newsworthy information.';
    
    case 'carousel':
      return 'You are a social media content specialist who excels at creating engaging carousel posts with concise, impactful slides that flow well together. Each slide should be focused on a single point and include suggestions for complementary visuals. Number each slide clearly (Slide 1, Slide 2, etc.) and provide a title and brief engaging content for each slide. Include a compelling opening slide and summary closing slide.';
    
    case 'meme':
      return 'You are a creative social media marketer who specializes in creating humorous, relevant meme concepts that resonate with the target audience while aligning with brand values. Describe both the image and text components clearly, and explain how the meme relates to the topic. Provide text for the top and bottom of the meme, or whichever format is most appropriate for the concept.';
    
    case 'custom':
      return 'You are an expert content writer who creates high-quality, engaging content customized to specific requirements. Follow the provided guidelines and structure to create content that precisely meets the user\'s specifications.';
    
    default:
      return 'You are an expert content writer who creates high-quality, engaging content. Follow the provided guidelines and structure to create content that meets the user\'s needs.';
  }
}
