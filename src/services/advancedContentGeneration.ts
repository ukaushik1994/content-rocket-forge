import AIServiceController from './aiService/AIServiceController';
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
  aiProvider: string = 'openrouter'
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

    // Validate that we have selected SERP items
    const selectedSerpItems = config.serpSelections.filter(item => item.selected);
    if (selectedSerpItems.length === 0) {
      console.warn('⚠️ No SERP items selected for content generation');
    } else {
      console.log('✅ Using selected SERP items:', {
        totalSelected: selectedSerpItems.length,
        byType: selectedSerpItems.reduce((acc, item) => {
          acc[item.type] = (acc[item.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });
    }

    // Build the comprehensive prompt using selected SERP items
    const prompt = buildAdvancedContentPrompt(config);
    
    console.log('📝 Generated content prompt length:', prompt.length);
    console.log('🎯 Key prompt elements included:', {
      hasSerpSelections: selectedSerpItems.length > 0,
      hasOutline: prompt.includes('Content Outline'),
      hasSecondaryKeywords: prompt.includes('Secondary Keywords'),
      hasInstructions: prompt.includes('Additional Instructions')
    });

    // Enhanced system prompt that emphasizes SERP integration
    const systemPrompt = `You are an expert content writer specializing in creating comprehensive, SEO-optimized articles that genuinely help readers. Your content is:

1. HELPFUL FIRST: Always prioritize providing real value to readers over SEO optimization
2. ACCURATE: Base content on factual information and best practices
3. COMPREHENSIVE: Cover topics thoroughly while remaining focused
4. ACTIONABLE: Provide concrete steps and practical advice readers can implement
5. ENGAGING: Use clear, conversational language that keeps readers interested
6. WELL-STRUCTURED: Follow logical flow with proper headings and formatting

CRITICAL: You MUST strategically incorporate ALL selected SERP elements provided in the prompt. These elements represent competitive research and content opportunities that should be woven throughout your content:
- Answer ALL selected questions as dedicated sections or FAQ entries
- Use selected headings as inspiration for your content structure
- Address ALL content gaps as unique value propositions
- Naturally integrate selected keywords throughout the content
- Reference selected entities and topics to provide comprehensive coverage

When incorporating SERP research data:
- Answer user questions directly and thoroughly
- Explain concepts and entities clearly for all knowledge levels
- Address content gaps that competitors miss
- Use keywords naturally without keyword stuffing
- Structure content based on proven heading patterns from SERP analysis

Always start with the title as an H1 heading and follow the provided outline structure. Focus on creating content that readers will find genuinely useful and that search engines will recognize as high-quality.`;

    // Generate content using AI service controller
    console.log(`🚀 Advanced content generation with AI controller`);
    const chatResponse = await AIServiceController.generate(
      'advanced_content_generation',
      systemPrompt,
      prompt
    );
    
    if (!chatResponse?.choices?.[0]?.message?.content) {
      console.error('❌ AI service returned empty content');
      return null;
    }

    const generatedContent = chatResponse.choices[0].message.content;

    console.log('✅ Content generated successfully:', {
      contentLength: generatedContent.length,
      wordCount: generatedContent.split(/\s+/).length,
      hasHeadings: generatedContent.includes('#'),
      containsKeyword: generatedContent.toLowerCase().includes(config.mainKeyword.toLowerCase()),
      serpItemsUsed: selectedSerpItems.length
    });

    // Validate that SERP items were actually used in the content
    const serpValidation = validateSerpIntegration(generatedContent, selectedSerpItems);
    console.log('🔍 SERP integration validation:', serpValidation);

    return generatedContent;

  } catch (error) {
    console.error('💥 Advanced content generation failed:', error);
    throw error;
  }
}

/**
 * Validate that selected SERP items were integrated into the generated content
 */
function validateSerpIntegration(content: string, selectedItems: any[]): any {
  const contentLower = content.toLowerCase();
  const validation = {
    totalSelected: selectedItems.length,
    likelyIntegrated: 0,
    questions: { selected: 0, integrated: 0 },
    keywords: { selected: 0, integrated: 0 },
    contentGaps: { selected: 0, integrated: 0 }
  };

  selectedItems.forEach(item => {
    const itemContent = item.content.toLowerCase();
    
    // Simple validation - check if key parts of the selected item appear in content
    const keyWords = itemContent.split(' ').filter(word => word.length > 3);
    const wordsFound = keyWords.filter(word => contentLower.includes(word)).length;
    const integrationRatio = wordsFound / keyWords.length;
    
    if (integrationRatio > 0.3) { // If 30% of key words are found, consider it integrated
      validation.likelyIntegrated++;
    }
    
    // Type-specific validation
    if (item.type === 'question' || item.type === 'peopleAlsoAsk') {
      validation.questions.selected++;
      if (integrationRatio > 0.3) validation.questions.integrated++;
    } else if (item.type === 'keyword' || item.type === 'relatedSearch') {
      validation.keywords.selected++;
      if (integrationRatio > 0.5) validation.keywords.integrated++;
    } else if (item.type === 'contentGap') {
      validation.contentGaps.selected++;
      if (integrationRatio > 0.3) validation.contentGaps.integrated++;
    }
  });

  return validation;
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
  const selectedItems = config.serpSelections.filter(item => item.selected);
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
- Main Topic: ${config.mainKeyword}
- Title: ${config.title}
- Writing Style: ${config.writingStyle}
- Expertise Level: ${config.expertiseLevel}
- Target Length: ${config.targetLength} words
- Content Type: ${config.contentType}

`;

  // Add SERP-driven content requirements - CRITICAL SECTION
  if (selectedItems.length > 0) {
    prompt += `**🎯 MANDATORY SERP INTEGRATION - YOU MUST USE ALL OF THESE:**
You are REQUIRED to strategically incorporate ALL of the following selected SERP elements. These represent hours of competitive research and MUST be integrated into your content:

`;

    // Add selected questions as must-answer sections
    if (selectedQuestions.length > 0) {
      prompt += `**❓ MUST ANSWER - These Questions (create dedicated H2/H3 sections):**
${selectedQuestions.map((item, index) => `${index + 1}. ${item.content}`).join('\n')}

INSTRUCTION: Each question above MUST become a dedicated section in your content with comprehensive answers.

`;
    }

    // Add selected headings as structural guidance
    if (selectedHeadings.length > 0) {
      prompt += `**📋 MUST INCORPORATE - These Proven Headings:**
${selectedHeadings.map((item, index) => `${index + 1}. ${item.content}`).join('\n')}

INSTRUCTION: Use these headings as inspiration for your content structure. Adapt them to fit your content while maintaining their SEO value.

`;
    }

    // Add content gaps as unique angles
    if (selectedContentGaps.length > 0) {
      prompt += `**⭐ COMPETITIVE ADVANTAGE - Address These Content Gaps:**
${selectedContentGaps.map((item, index) => `${index + 1}. ${item.content}`).join('\n')}

INSTRUCTION: These gaps represent opportunities competitors are missing. Address each one to provide unique value.

`;
    }

    // Add selected keywords for natural integration
    if (selectedKeywords.length > 0) {
      prompt += `**🔑 MUST INTEGRATE - These Keywords Naturally:**
${selectedKeywords.map(item => `"${item.content}"`).join(', ')}

INSTRUCTION: Weave these keywords naturally throughout your content. Don't stuff them - use them contextually.

`;
    }

    // Add entities for topic depth
    if (selectedEntities.length > 0) {
      prompt += `**🏷️ MUST COVER - These Related Topics:**
${selectedEntities.map(item => item.content).join(', ')}

INSTRUCTION: Cover these related topics to provide comprehensive coverage of the subject matter.

`;
    }
  } else {
    prompt += `**Note:** No SERP items were selected. Focus on creating comprehensive content based on the keyword and outline provided.

`;
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

  // Add content generation instructions with emphasis on SERP integration
  prompt += `**Content Generation Instructions:**

1. **SERP Integration Priority**: MANDATORY - Use ALL selected SERP elements listed above
2. **Structure**: Create a comprehensive article with clear headings (H1, H2, H3) and logical flow
3. **Question Integration**: Turn each selected question into a dedicated section with thorough answers
4. **Keyword Integration**: Naturally incorporate ALL selected keywords throughout the content
5. **Content Gap Coverage**: Address ALL content gaps to provide unique value
6. **Quality**: Write engaging, informative content that provides real value to readers
7. **Length**: Aim for approximately ${config.targetLength} words with substantial, meaningful content
8. **Expertise**: Write at the ${config.expertiseLevel} level with appropriate depth and complexity
9. **Style**: Use a ${config.writingStyle} tone throughout the content

**CRITICAL SUCCESS CRITERIA:**
✅ Every selected question becomes a section with comprehensive answers
✅ All selected keywords are naturally integrated
✅ All content gaps are addressed with unique insights
✅ Selected headings inspire your content structure
✅ The content flows naturally while incorporating all SERP elements

Generate the complete article now, ensuring ALL selected SERP elements are strategically integrated:`;

  return prompt;
}
