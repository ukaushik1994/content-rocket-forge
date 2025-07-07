import { getAiService } from './aiService';
import { SerpSelection } from '@/contexts/content-builder/types';

export interface ContentGenerationConfig {
  mainKeyword: string;
  title: string;
  outline: string;
  secondaryKeywords: string;
  writingStyle: string;
  expertiseLevel: string;
  targetLength: number;
  contentType: 'how-to' | 'listicle' | 'comprehensive' | 'general';
  serpSelections: SerpSelection[];
  selectedSolution: any;
  additionalInstructions: string;
  includeStats: boolean;
  includeCaseStudies: boolean;
  includeFAQs: boolean;
}

/**
 * Generate advanced content using selected SERP items and AI
 */
export async function generateAdvancedContent(
  config: ContentGenerationConfig,
  aiProvider: string = 'openai'
): Promise<string | null> {
  try {
    console.log('🚀 Starting advanced content generation with config:', {
      keyword: config.mainKeyword,
      title: config.title,
      serpSelectionsCount: config.serpSelections.length,
      selectedItemsCount: config.serpSelections.filter(item => item.selected).length,
      hasOutline: !!config.outline,
      hasSecondaryKeywords: !!config.secondaryKeywords
    });

    // Get the AI service
    const aiService = getAiService(aiProvider);
    if (!aiService) {
      throw new Error(`AI provider "${aiProvider}" not configured`);
    }

    // Build the comprehensive prompt using selected SERP items
    const prompt = buildAdvancedContentPrompt(config);
    
    console.log('📝 Generated content prompt length:', prompt.length);
    console.log('🎯 Key prompt elements included:', {
      hasSerpSelections: prompt.includes('Selected SERP Items'),
      hasOutline: prompt.includes('Content Outline'),
      hasSecondaryKeywords: prompt.includes('Secondary Keywords'),
      hasInstructions: prompt.includes('Additional Instructions')
    });

    // Generate content using AI
    const generatedContent = await aiService.generateContent(prompt);
    
    if (!generatedContent) {
      console.error('❌ AI service returned empty content');
      return null;
    }

    console.log('✅ Content generated successfully:', {
      contentLength: generatedContent.length,
      wordCount: generatedContent.split(/\s+/).length,
      hasHeadings: generatedContent.includes('#'),
      containsKeyword: generatedContent.toLowerCase().includes(config.mainKeyword.toLowerCase())
    });

    return generatedContent;

  } catch (error) {
    console.error('💥 Advanced content generation failed:', error);
    throw error;
  }
}

/**
 * Build comprehensive content generation prompt using selected SERP items
 */
function buildAdvancedContentPrompt(config: ContentGenerationConfig): string {
  const {
    mainKeyword,
    title,
    outline,
    secondaryKeywords,
    serpSelections,
    writingStyle,
    expertiseLevel,
    targetLength,
    contentType,
    selectedSolution,
    additionalInstructions,
    includeStats,
    includeCaseStudies,
    includeFAQs
  } = config;

  // Filter selected SERP items by type for strategic integration
  const selectedItems = serpSelections.filter(item => item.selected);
  const selectedQuestions = selectedItems.filter(item => item.type === 'question' || item.type === 'peopleAlsoAsk');
  const selectedHeadings = selectedItems.filter(item => item.type === 'heading');
  const selectedContentGaps = selectedItems.filter(item => item.type === 'contentGap');
  const selectedKeywords = selectedItems.filter(item => item.type === 'keyword' || item.type === 'relatedSearch');
  const selectedEntities = selectedItems.filter(item => item.type === 'entity');

  console.log('🎯 SERP selections breakdown:', {
    totalSelected: selectedItems.length,
    questions: selectedQuestions.length,
    headings: selectedHeadings.length,
    contentGaps: selectedContentGaps.length,
    keywords: selectedKeywords.length,
    entities: selectedEntities.length
  });

  let prompt = `You are an expert content writer creating comprehensive, engaging content. 

**Content Requirements:**
- Main Topic: ${mainKeyword}
- Title: ${title}
- Writing Style: ${writingStyle}
- Expertise Level: ${expertiseLevel}
- Target Length: ${targetLength} words
- Content Type: ${contentType}

`;

  // Add SERP-driven content requirements
  if (selectedItems.length > 0) {
    prompt += `**Strategic SERP Integration:**
You must strategically incorporate the following selected SERP elements to create comprehensive, competitive content:

`;

    // Add selected questions as must-answer sections
    if (selectedQuestions.length > 0) {
      prompt += `**Must Answer These Questions (as dedicated sections):**
${selectedQuestions.map((item, index) => `${index + 1}. ${item.content}`).join('\n')}

`;
    }

    // Add selected headings as structural guidance
    if (selectedHeadings.length > 0) {
      prompt += `**Incorporate These Proven Headings:**
${selectedHeadings.map((item, index) => `${index + 1}. ${item.content}`).join('\n')}

`;
    }

    // Add content gaps as unique angles
    if (selectedContentGaps.length > 0) {
      prompt += `**Address These Content Gaps (Competitive Advantage):**
${selectedContentGaps.map((item, index) => `${index + 1}. ${item.content}`).join('\n')}

`;
    }

    // Add selected keywords for natural integration
    if (selectedKeywords.length > 0) {
      prompt += `**Naturally Integrate These Keywords:**
${selectedKeywords.map(item => item.content).join(', ')}

`;
    }

    // Add entities for topic depth
    if (selectedEntities.length > 0) {
      prompt += `**Cover These Related Topics:**
${selectedEntities.map(item => item.content).join(', ')}

`;
    }
  }

  // Add outline structure
  if (outline && outline.trim()) {
    prompt += `**Content Outline Structure:**
${outline}

`;
  }

  // Add secondary keywords
  if (secondaryKeywords) {
    prompt += `**Secondary Keywords to Include:**
${secondaryKeywords}

`;
  }

  // Add solution integration
  if (selectedSolution) {
    prompt += `**Solution Integration:**
Incorporate information about: ${selectedSolution.name}
${selectedSolution.description}

`;
  }

  // Add content enhancement requirements
  const enhancements = [];
  if (includeStats) enhancements.push('relevant statistics and data points');
  if (includeCaseStudies) enhancements.push('case studies or real-world examples');
  if (includeFAQs) enhancements.push('a comprehensive FAQ section');

  if (enhancements.length > 0) {
    prompt += `**Content Enhancements:**
Include ${enhancements.join(', ')} throughout the content.

`;
  }

  // Add additional instructions
  if (additionalInstructions) {
    prompt += `**Additional Instructions:**
${additionalInstructions}

`;
  }

  // Add content generation instructions
  prompt += `**Content Generation Instructions:**

1. **Structure**: Create a comprehensive article with clear headings (H1, H2, H3) and logical flow
2. **SERP Integration**: Strategically use ALL selected SERP elements to create content that addresses gaps in current top-ranking pages
3. **Keyword Integration**: Naturally incorporate the main keyword and secondary keywords throughout the content
4. **Quality**: Write engaging, informative content that provides real value to readers
5. **Length**: Aim for approximately ${targetLength} words with substantial, meaningful content
6. **Expertise**: Write at the ${expertiseLevel} level with appropriate depth and complexity
7. **Style**: Use a ${writingStyle} tone throughout the content

**Important Notes:**
- Each selected question should become a dedicated section with comprehensive answers
- Use selected headings as inspiration for your section structure
- Address content gaps to provide unique value not found in competing content
- Include actionable advice and practical information
- Use markdown formatting for proper structure
- Ensure the content flows naturally and reads cohesively

Generate the complete article now:`;

  return prompt;
}

import { OpenAiService } from './ai/openaiService';
import { AiService } from './ai/aiService';

/**
 * Get the AI service based on the provider
 */
export function getAiService(provider: string): AiService | null {
  switch (provider) {
    case 'openai':
      return new OpenAiService();
    default:
      console.warn(`AI provider "${provider}" not supported`);
      return null;
  }
}
