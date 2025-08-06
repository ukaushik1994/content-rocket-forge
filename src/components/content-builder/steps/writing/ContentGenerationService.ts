
import { toast } from 'sonner';
import { AiProvider } from '@/services/aiService/types';
import { Solution, SerpSelection } from '@/contexts/content-builder/types';
import { sendChatRequest } from '@/services/aiService';
import { getUserPreference } from '@/services/userPreferencesService';
import { getBestAvailableProvider } from '@/services/providerAvailabilityService';

/**
 * Generate content using AI with SERP data integration
 */
export const generateContent = async (
  preferredProvider: AiProvider | null,
  mainKeyword: string,
  contentTitle: string | null,
  outlineText: string,
  secondaryKeywords: string,
  selectedSolution: Solution | null,
  additionalInstructions: string,
  serpSelections: SerpSelection[],
  wordCountLimit?: number,
  setIsGenerating?: (value: boolean) => void,
  setContent?: (content: string) => void
): Promise<boolean> => {
  if (!mainKeyword) {
    toast.error("Please set a main keyword first");
    return false;
  }
  
  if (setIsGenerating) {
    setIsGenerating(true);
  }
  
  try {
    // Get the best available AI provider
    const aiProvider = preferredProvider || await getBestAvailableProvider();
    if (!aiProvider) {
      toast.error('No AI provider is configured. Please set up an API key in Settings.');
      return false;
    }
    // Organize SERP selections by type for better prompt structure
    const serpData = organizeSerpSelections(serpSelections);
    
    // Create a comprehensive prompt that includes all available data
    const prompt = createComprehensivePrompt({
      mainKeyword,
      contentTitle,
      outlineText,
      secondaryKeywords,
      selectedSolution,
      additionalInstructions,
      serpData,
      wordCountLimit
    });
    
    // Enhanced system prompt for better content quality
    const systemPrompt = createEnhancedSystemPrompt();
    
    // Call the AI API via our service
    console.log(`🚀 Generating content with ${aiProvider}`);
    const chatResponse = await sendChatRequest(aiProvider, {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      maxTokens: 4000
    });
    
    if (chatResponse?.choices?.[0]?.message?.content) {
      // Use the AI-generated content
      const generatedContent = chatResponse.choices[0].message.content;
      
      // If content doesn't start with the title as an H1, add it
      let finalContent = generatedContent;
      const titleAsH1 = `# ${contentTitle || `Complete Guide to ${mainKeyword}`}`;
      
      if (!finalContent.trim().startsWith('#')) {
        finalContent = `${titleAsH1}\n\n${finalContent}`;
      }
      
      // Save the word count in localStorage for future reference
      if (wordCountLimit) {
        localStorage.setItem('content_builder_word_count', wordCountLimit.toString());
      }
      
      if (setContent) {
        setContent(finalContent);
      }
      
      toast.success('Content generated successfully with SERP insights');
      return true;
    } else {
      toast.error('Failed to generate content. Please try again.');
      return false;
    }
  } catch (error) {
    console.error('Error generating content:', error);
    toast.error('Failed to generate content. Please try again or check your API configuration.');
    return false;
  } finally {
    if (setIsGenerating) {
      setIsGenerating(false);
    }
  }
};

/**
 * Organize SERP selections by type for better prompt structure
 */
const organizeSerpSelections = (serpSelections: SerpSelection[]) => {
  const selectedItems = serpSelections.filter(item => item.selected);
  
  return {
    keywords: selectedItems.filter(item => item.type === 'keyword').map(item => item.content),
    questions: selectedItems.filter(item => item.type === 'question').map(item => item.content),
    entities: selectedItems.filter(item => item.type === 'entity').map(item => item.content),
    headings: selectedItems.filter(item => item.type === 'heading').map(item => item.content),
    contentGaps: selectedItems.filter(item => item.type === 'contentGap').map(item => item.content),
    topResults: selectedItems.filter(item => item.type === 'topRank').map(item => item.content),
    competitors: selectedItems.filter(item => item.type === 'competitor').map(item => item.content),
    snippets: selectedItems.filter(item => item.type === 'snippet').map(item => item.content)
  };
};

/**
 * Create a comprehensive prompt that includes all available research data
 */
const createComprehensivePrompt = ({
  mainKeyword,
  contentTitle,
  outlineText,
  secondaryKeywords,
  selectedSolution,
  additionalInstructions,
  serpData,
  wordCountLimit
}: {
  mainKeyword: string;
  contentTitle: string | null;
  outlineText: string;
  secondaryKeywords: string;
  selectedSolution: Solution | null;
  additionalInstructions: string;
  serpData: any;
  wordCountLimit?: number;
}) => {
  const title = contentTitle || `Complete Guide to ${mainKeyword}`;
  
  let prompt = `Write comprehensive, helpful content for an article with the title: "${title}".

CONTENT REQUIREMENTS:
- Title: ${title}
- Primary Keyword: ${mainKeyword}
${secondaryKeywords ? `- Secondary Keywords: ${secondaryKeywords}` : ''}
${wordCountLimit ? `- Word Count Target: Exactly ${wordCountLimit} words (with a margin of error of +/- 3 words)` : ''}

STRUCTURE TO FOLLOW:
The content MUST start with the title as an H1 heading: # ${title}

Then follow this outline structure:
${outlineText}
`;

  // Add SERP research insights if available
  if (serpData.questions.length > 0) {
    prompt += `\nIMPORTANT QUESTIONS TO ADDRESS:
Based on search research, users are asking these questions. Make sure to answer them thoroughly:
${serpData.questions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}
`;
  }

  if (serpData.entities.length > 0) {
    prompt += `\nKEY CONCEPTS TO INCLUDE:
These important concepts should be naturally incorporated and explained:
${serpData.entities.map((e: string, i: number) => `- ${e}`).join('\n')}
`;
  }

  if (serpData.contentGaps.length > 0) {
    prompt += `\nCONTENT OPPORTUNITIES:
Address these gaps that competitors are missing:
${serpData.contentGaps.map((gap: string, i: number) => `- ${gap}`).join('\n')}
`;
  }

  if (serpData.keywords.length > 0) {
    prompt += `\nADDITIONAL KEYWORDS TO INCORPORATE:
Naturally include these related keywords where relevant:
${serpData.keywords.join(', ')}
`;
  }

  if (serpData.headings.length > 0) {
    prompt += `\nCOMPETITOR HEADING INSIGHTS:
Consider these heading patterns from top-ranking content:
${serpData.headings.map((h: string, i: number) => `- ${h}`).join('\n')}
`;
  }

  if (selectedSolution) {
    prompt += `\nSOLUTION TO HIGHLIGHT:
Mention the solution "${selectedSolution.name}" and highlight these features: ${selectedSolution.features.slice(0,3).join(', ')}.
`;
  }

  if (additionalInstructions) {
    prompt += `\nADDITIONAL INSTRUCTIONS:
${additionalInstructions}
`;
  }

  prompt += `\nFORMATTING REQUIREMENTS:
- Use Markdown syntax with proper headings (H1, H2, H3, etc.)
- Create engaging, scannable content with bullet points and numbered lists
- Include a compelling introduction that hooks the reader
- Write a strong conclusion that summarizes key takeaways
- Optimize for readability and search engines
- Make the content genuinely helpful and actionable for readers
${wordCountLimit ? `- CRITICAL: Hit exactly ${wordCountLimit} words (±3 words). Count carefully.` : ''}

CONTENT QUALITY FOCUS:
- Answer user questions comprehensively
- Provide practical, actionable advice
- Include relevant examples where helpful
- Ensure accuracy and helpfulness above all else`;

  return prompt;
};

/**
 * Create an enhanced system prompt for better content quality
 */
const createEnhancedSystemPrompt = () => {
  return `You are an expert content writer specializing in creating comprehensive, SEO-optimized articles that genuinely help readers. Your content is:

1. HELPFUL FIRST: Always prioritize providing real value to readers over SEO optimization
2. ACCURATE: Base content on factual information and best practices
3. COMPREHENSIVE: Cover topics thoroughly while remaining focused
4. ACTIONABLE: Provide concrete steps and practical advice readers can implement
5. ENGAGING: Use clear, conversational language that keeps readers interested
6. WELL-STRUCTURED: Follow logical flow with proper headings and formatting

When incorporating research data:
- Answer user questions directly and thoroughly
- Explain concepts and entities clearly for all knowledge levels
- Address content gaps that competitors miss
- Use keywords naturally without keyword stuffing
- Structure content based on proven heading patterns

Always start with the title as an H1 heading and follow the provided outline structure. Focus on creating content that readers will find genuinely useful and that search engines will recognize as high-quality.`;
};

/**
 * Save content to drafts
 */
export const saveContentToDraft = async (
  title: string,
  content: string,
  mainKeyword: string,
  secondaryKeywords: string[],
  note: string,
  outline: string[],
  setIsSaving: (value: boolean) => void,
  setShowSaveDialog: (value: boolean) => void
): Promise<boolean> => {
  if (!title || !content) {
    toast.error("Title and content are required");
    return false;
  }
  
  setIsSaving(true);
  
  try {
    // Here you could implement actual saving to a database or service
    // For now we're just simulating a successful save
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store in localStorage as a backup
    const draft = {
      title,
      content,
      mainKeyword,
      secondaryKeywords,
      note,
      outline,
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    const drafts = JSON.parse(localStorage.getItem('content_drafts') || '[]');
    drafts.push(draft);
    localStorage.setItem('content_drafts', JSON.stringify(drafts));
    
    toast.success('Content saved to drafts');
    setShowSaveDialog(false);
    return true;
  } catch (error) {
    console.error('Error saving draft:', error);
    toast.error('Failed to save content');
    return false;
  } finally {
    setIsSaving(false);
  }
};
