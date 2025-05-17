
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
    default:
      return 'You are an expert content writer who creates high-quality, engaging content. Follow the provided guidelines and structure to create content that meets the user\'s needs.';
  }
}
