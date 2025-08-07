
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import AIServiceController from '@/services/aiService/AIServiceController';
import { ContentBuilderState, SerpSelection } from '@/contexts/content-builder/types';
import { getUserPreference } from '@/services/userPreferencesService';
import { AISolutionIntegrationService } from '@/services/aiSolutionIntegrationService';

type AiProvider = 'openai' | 'anthropic' | 'gemini' | 'mistral' | 'lmstudio' | 'openrouter';

export function useContentGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiProvider, setAiProvider] = useState<AiProvider>('openrouter'); // Default to OpenRouter
  const [availableProviders, setAvailableProviders] = useState<AiProvider[]>([]);

  // Load available providers and the default AI provider from user preferences
  useEffect(() => {
    const loadProviders = async () => {
      try {
        // Get active providers from centralized service
        const activeProviders = await AIServiceController.getActiveProviders();
        const providerNames = activeProviders.map(p => p.provider as AiProvider);
        setAvailableProviders(providerNames);
        
        // Set default provider from preferences or best available (OpenRouter prioritized)
        const defaultProvider = getUserPreference('defaultAiProvider') as AiProvider;
        if (defaultProvider && providerNames.includes(defaultProvider)) {
          setAiProvider(defaultProvider);
        } else if (activeProviders.length > 0) {
          // Use highest priority provider
          const bestProvider = activeProviders.sort((a, b) => a.priority - b.priority)[0];
          setAiProvider(bestProvider.provider as AiProvider);
        }
      } catch (error) {
        console.error('Error loading AI providers:', error);
      }
    };
    
    loadProviders();
  }, []);

  const generateContent = async (
    state: ContentBuilderState,
    setContent: (content: string) => void
  ) => {
    const { 
      mainKeyword, 
      outline, 
      additionalInstructions, 
      selectedSolution,
      contentTitle,
      selectedKeywords,
      serpSelections
    } = state;
    
    if (!mainKeyword) {
      toast.error("Please set a main keyword first");
      return false;
    }
    
    // Check if provider is available and active
    if (!availableProviders.includes(aiProvider)) {
      toast.error(`${aiProvider} is not configured or active. Please check your provider settings.`);
      return false;
    }
    
    setIsGenerating(true);
    
    try {
      // Organize SERP selections by type for better prompt structure
      const serpData = organizeSerpSelections(serpSelections);
      
      // Convert outline to a formatted string for the prompt
      const outlineText = Array.isArray(outline) 
        ? outline.map((item, index) => {
            if (typeof item === 'string') {
              return `${index + 1}. ${item}`;
            } else if (item && typeof item === 'object' && 'title' in item) {
              return `${index + 1}. ${(item as { title: string }).title}`;
            }
            return '';
          }).filter(Boolean).join('\n')
        : '';
        
      // Prepare secondary keywords
      const secondaryKeywords = selectedKeywords?.join(', ') || '';
      
      // Create comprehensive prompt with enhanced solution context
      let prompt = createComprehensivePrompt({
        mainKeyword,
        contentTitle,
        outlineText,
        secondaryKeywords,
        selectedSolution,
        additionalInstructions,
        serpData
      });

      // Enhance prompt with solution-aware context if solution is selected
      if (selectedSolution && state.contentType && state.contentIntent) {
        prompt = AISolutionIntegrationService.createSolutionAwarePrompt({
          solution: selectedSolution,
          contentType: state.contentType,
          contentIntent: state.contentIntent,
          targetKeywords: [mainKeyword, ...(selectedKeywords || [])],
          audience: selectedSolution.targetAudience.join(', ')
        }, prompt);
      }
      
      // Enhanced system prompt
      const systemPrompt = createEnhancedSystemPrompt();
      
      console.info("AI Content Generation prompt:", prompt);
      
      console.log(`🎯 Generating content with centralized AI service`);
      
      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'content_generation',
        temperature: 0.7,
        max_tokens: 4000
      });
      
      if (response?.content) {
        // Use the AI-generated content
        const generatedContent = response.content;
        
        // If content doesn't start with the title as an H1, add it
        let finalContent = generatedContent;
        if (contentTitle && !finalContent.trim().startsWith('#')) {
          const titleAsH1 = `# ${contentTitle}`;
          finalContent = `${titleAsH1}\n\n${finalContent}`;
        }
        
        setContent(finalContent);
        toast.success(`Content generated successfully using ${response.provider_used || 'AI service'}!`);
        return true;
      } else {
        toast.error('Failed to generate content. Please check your AI service configuration.');
        return false;
      }
      
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content. Please try again or check your API configuration.');
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    aiProvider,
    setAiProvider,
    generateContent,
    availableProviders
  };
}

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
  serpData
}: {
  mainKeyword: string;
  contentTitle: string | null;
  outlineText: string;
  secondaryKeywords: string;
  selectedSolution: any;
  additionalInstructions: string;
  serpData: any;
}) => {
  const title = contentTitle || `${mainKeyword}: Comprehensive Analysis and Insights`;
  
  let prompt = `Write comprehensive, helpful content for an article with the title: "${title}".

CONTENT REQUIREMENTS:
- Title: ${title}
- Primary Keyword: ${mainKeyword}
${secondaryKeywords ? `- Secondary Keywords: ${secondaryKeywords}` : ''}

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
    prompt += `\nSOLUTION INTEGRATION:
Solution: ${selectedSolution.name}
Category: ${selectedSolution.category}
Key Features: ${selectedSolution.features.slice(0,5).join(', ')}
Pain Points Addressed: ${selectedSolution.painPoints.slice(0,3).join(', ')}
Target Audience: ${selectedSolution.targetAudience.join(', ')}
Use Cases: ${selectedSolution.useCases.slice(0,3).join(', ')}`;

    if (selectedSolution.uniqueValuePropositions) {
      prompt += `
Value Propositions: ${selectedSolution.uniqueValuePropositions.slice(0,3).join(', ')}`;
    }

    if (selectedSolution.keyDifferentiators) {
      prompt += `
Key Differentiators: ${selectedSolution.keyDifferentiators.slice(0,3).join(', ')}`;
    }

    if (selectedSolution.marketData) {
      prompt += `
Market Context: ${JSON.stringify(selectedSolution.marketData)}`;
    }

    if (selectedSolution.technicalSpecs) {
      prompt += `
Technical Capabilities: ${JSON.stringify(selectedSolution.technicalSpecs)}`;
    }

    if (selectedSolution.caseStudies && selectedSolution.caseStudies.length > 0) {
      prompt += `
Success Stories: ${selectedSolution.caseStudies.slice(0,2).map(cs => `${cs.company} achieved: ${cs.results.join(', ')}`).join('; ')}`;
    }

    if (selectedSolution.pricing) {
      prompt += `
Pricing Model: ${selectedSolution.pricing.model}`;
    }

    prompt += `

SOLUTION INTEGRATION REQUIREMENTS:
- Naturally integrate the solution throughout the content
- Address specific pain points the solution solves
- Highlight relevant features and benefits
- Include appropriate use cases as examples
- Mention key differentiators when relevant
- Reference market context or technical capabilities if applicable
- End with a compelling call-to-action related to the solution
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
