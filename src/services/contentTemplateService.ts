
import { PromptTemplate, getPromptTemplateById, getPromptTemplatesByType } from './userPreferencesService';
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
    // No custom template found, use format-specific default prompts
    console.log(`No custom template found for ${formatType}, using default prompt`);
    return generateWithDefaultPrompt(formatType, topic, additionalContext);
  }
  
  console.log(`Found custom template for ${formatType}:`, templates[0].name);
  
  // Use the first template
  return generateWithTemplate(templates[0], topic, additionalContext);
}

/**
 * Generate content using default prompts when no custom template is available
 */
async function generateWithDefaultPrompt(
  formatType: string,
  topic: string,
  additionalContext?: Record<string, string>
): Promise<string | null> {
  try {
    // Create default prompt based on format type
    const { prompt, systemMessage } = createDefaultPrompt(formatType, topic, additionalContext);
    
    // Make the API call
    const response = await sendChatRequest('openai', {
      messages: [
        { 
          role: 'system', 
          content: systemMessage
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ],
      temperature: 0.7
    });
    
    if (response?.choices?.[0]?.message?.content) {
      return response.choices[0].message.content;
    } else {
      toast.error(`Failed to generate ${formatType} content`);
      return null;
    }
  } catch (error) {
    console.error('Error generating content with default prompt:', error);
    toast.error('Error generating content');
    return null;
  }
}

/**
 * Creates default prompts based on format type
 */
function createDefaultPrompt(
  formatType: string, 
  topic: string, 
  additionalContext?: Record<string, string>
): { prompt: string, systemMessage: string } {
  const content = additionalContext?.content || '';
  const keyword = additionalContext?.keyword || topic;

  switch (formatType) {
    case 'meme':
      return {
        systemMessage: 'You are a creative meme writer who can transform serious content into humorous meme text. Create appropriate captions for top text and bottom text format.',
        prompt: `Create a meme based on this content about "${topic}". 
        Original content: ${content.substring(0, 500)}...
        
        Provide the meme in this format:
        Image description: [describe what image would work well]
        Top text: [catchy phrase for the top of the meme]
        Bottom text: [punchline for the bottom of the meme]
        Alternative caption: [single caption alternative]
        Context explanation: [brief explanation of the joke for those who might not get it]`
      };
      
    case 'carousel':
      return {
        systemMessage: 'You are an expert in creating engaging social media carousel content that breaks down complex topics into digestible slides.',
        prompt: `Transform this content about "${topic}" into a 5-7 slide carousel post format.
        Original content: ${content.substring(0, 800)}...
        
        Format your response as:
        
        Slide 1: [attention-grabbing headline and introduction]
        
        Slide 2: [key point 1]
        
        Slide 3: [key point 2]
        
        Slide 4: [key point 3]
        
        Slide 5: [key point 4 if applicable]
        
        Slide 6: [key point 5 if applicable]
        
        Final Slide: [call to action]
        
        Each slide should have no more than 2-3 sentences. Make it engaging and visual-friendly.`
      };
      
    // Handle other format types with their specific structures
    case 'social-twitter':
      return {
        systemMessage: 'You are a Twitter/X specialist who creates engaging tweets within character limits.',
        prompt: `Create a Twitter/X post (max 280 characters) about "${topic}" based on this content: ${content.substring(0, 300)}...`
      };
      
    case 'glossary':
      return {
        systemMessage: 'You are a technical writer specializing in creating clear, concise definitions and explanations.',
        prompt: `Create a glossary of key terms related to "${topic}" based on this content: ${content.substring(0, 800)}...
        
        Format each entry as:
        
        Term: [term]
        Definition: [concise definition]
        Usage example: [example of the term in context]
        
        Include at least 5-8 key terms from the content.`
      };
      
    default:
      return {
        systemMessage: 'You are an expert content writer who creates high-quality, engaging content.',
        prompt: `Transform this content about "${topic}" for the ${formatType} format.
                Content: ${content.substring(0, 800)}...
                Make it appropriate for the ${formatType} format with all necessary elements.`
      };
  }
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
        promptText = promptText.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '');
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
    
    console.log(`Generating content using custom template: ${template.name}`);
    
    // Make the API call
    const response = await sendChatRequest('openai', {
      messages: [
        { 
          role: 'system', 
          content: systemMessage
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
    case 'social-linkedin':
    case 'social-facebook':
    case 'social-instagram':
      return 'You are a social media expert who creates concise, engaging posts optimized for the specified platform. Follow character limits and best practices for the target platform.';
    case 'script':
      return 'You are a professional scriptwriter who creates clear, engaging scripts for video or audio content. Include appropriate timing, visual cues, and narrative structure.';
    case 'email':
      return 'You are an email marketing specialist who creates compelling newsletter content with high open and click-through rates. Create content that is scannable and drives action.';
    case 'glossary':
      return 'You are a technical writer specializing in creating clear, concise definitions and explanations for complex topics. Provide comprehensive information in an accessible format.';
    case 'meme':
      return 'You are a creative meme writer who can transform serious content into humorous meme text. Create appropriate captions that would work well in meme format.';
    case 'carousel':
      return 'You are an expert in creating engaging social media carousel content that breaks down complex topics into digestible slides. Structure content to flow naturally across multiple slides.';
    default:
      return 'You are an expert content writer who creates high-quality, engaging content. Follow the provided guidelines and structure to create content that meets the user\'s needs.';
  }
}
