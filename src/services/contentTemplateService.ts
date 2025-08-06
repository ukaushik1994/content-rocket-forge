
import { PromptTemplate, getPromptTemplateById, getPromptTemplatesByType } from './userPreferencesService';
import AIServiceController from './aiService/AIServiceController';
import { toast } from 'sonner';

/**
 * Generate content using a prompt template
 */
export async function generateContentWithTemplate(
  templateId: string,
  topic: string,
  additionalContext?: Record<string, string>
): Promise<string | null> {
  try {
    console.log(`🎯 Generating content using template ${templateId} for topic: ${topic}`);
    
    const template = getPromptTemplateById(templateId);
    if (!template) {
      console.warn(`❌ Template ${templateId} not found, falling back to default prompt`);
      return null;
    }

    console.log(`✅ Using custom template: ${template.name} (${template.formatType})`);
    return await generateWithTemplate(template, topic, additionalContext);
  } catch (error) {
    console.error('❌ Error generating content with template:', error);
    return null;
  }
}

/**
 * Generate content using a specified content format type
 * Will use the first available template for that format type
 */
export async function generateContentByFormatType(
  formatType: string,
  topic: string,
  additionalContext?: Record<string, string>
): Promise<{ content: string | null; templateUsed: { name: string; isCustom: boolean } | null }> {
  try {
    console.log(`🎯 Generating content for format type: ${formatType}, topic: ${topic}`);
    
    // First, try to find a custom template for this format type
    const customTemplates = getPromptTemplatesByType(formatType);
    
    if (customTemplates.length > 0) {
      // Use the first available template for this format type
      const template = customTemplates[0];
      console.log(`✅ Using custom template: ${template.name} for ${formatType}`);
      const content = await generateWithTemplate(template, topic, additionalContext);
      return {
        content,
        templateUsed: { name: template.name, isCustom: true }
      };
    }
    
    // If no custom template exists, use the default prompt
    console.log(`⚠️ No custom template found for ${formatType}, using default prompt`);
    const content = await generateWithDefaultPrompt(formatType, topic, additionalContext);
    return {
      content,
      templateUsed: { name: `Default ${formatType}`, isCustom: false }
    };
  } catch (error) {
    console.error('❌ Error generating content by format type:', error);
    return { content: null, templateUsed: null };
  }
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
    
    // Try OpenRouter first if available, then fallback to OpenAI
    let response;
    try {
      response = await AIServiceController.generate({
        input: prompt,
        use_case: 'repurpose',
        temperature: 0.7
      });
    } catch (error) {
      console.log('OpenRouter not available, falling back to OpenAI');
      response = await AIServiceController.generate({
        input: prompt,
        use_case: 'repurpose',
        temperature: 0.7
      });
    }
    
    if (response?.content) {
      return response.content;
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
    
    console.log(`🚀 Sending request to AI service using template: ${template.name}`);
    
    // Try OpenRouter first if available, then fallback to OpenAI
    let response;
    response = await AIServiceController.generate({
      input: promptText,
      use_case: 'repurpose',
      temperature: 0.7
    });
    
    if (response?.content) {
      console.log(`✅ Content generated successfully using template: ${template.name}`);
      return response.content;
    } else {
      console.error('❌ Failed to generate content - no response content');
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
