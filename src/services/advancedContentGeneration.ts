import { SerpSelection } from '@/contexts/content-builder/types';
import { AISolutionIntegrationService } from '@/services/aiSolutionIntegrationService';
import { getPromptTemplatesByType } from '@/services/userPreferencesService';
import { supabase } from '@/integrations/supabase/client';

export interface ContentGenerationConfig {
  mainKeyword: string;
  title: string;
  outline: string;
  secondaryKeywords: string;
  writingStyle: string;
  expertiseLevel: string;
  targetLength: number;
  contentType: 'how-to' | 'listicle' | 'comprehensive' | 'general';
  contentIntent?: 'inform' | 'convert' | 'entertain' | 'educate';
  serpSelections: SerpSelection[];
  selectedSolution: any;
  additionalInstructions: string;
  includeStats: boolean;
  includeCaseStudies: boolean;
  includeFAQs: boolean;
  formatType?: string;
}

// --- Format-aware helpers ---
const BLOG_FORMATS = ['blog', 'landing-page'];
const isQuickFormat = (fmt?: string) => !!fmt && !BLOG_FORMATS.includes(fmt);

function getSystemPromptForFormat(formatType: string): string {
  switch (formatType) {
    case 'social-twitter':
      return `You are a social media expert specializing in Twitter/X. Create engaging tweets under 280 characters with relevant hashtags. Be punchy, concise, and attention-grabbing. Include a clear call-to-action when appropriate.`;
    case 'social-linkedin':
      return `You are a LinkedIn content strategist. Write professional, thought-leadership posts of 300-600 words. Use a professional yet approachable tone. Include a hook in the first line, provide value, and end with a question or CTA to drive engagement.`;
    case 'social-facebook':
      return `You are a Facebook content creator. Write engaging posts of 200-400 words that encourage interaction. Use a warm, conversational tone. Include a compelling hook, storytelling elements, and a clear call-to-action.`;
    case 'social-instagram':
      return `You are an Instagram caption writer. Create captivating captions with engaging hooks, relevant emojis, and strategic hashtags. Use line breaks for readability. Include a call-to-action and up to 30 relevant hashtags at the end.`;
    case 'email':
      return `You are an email marketing specialist. Write compelling email content with: a subject line (under 50 chars), preview text (under 90 chars), body content with clear sections, and a prominent CTA. Use a professional but personable tone.`;
    case 'script':
      return `You are a video/podcast scriptwriter. Create scripts with clear scene directions, natural dialogue, timing cues, and visual/audio notes. Format with [SCENE], [NARRATOR], [CUT TO], etc. Include intro hook, main content, and outro.`;
    case 'carousel':
      return `You are a carousel content designer. Create multi-slide content (5-8 slides). Each slide must have: a bold headline (under 10 words) and supporting body text (under 30 words). Slide 1 is the hook, last slide is the CTA. Format as "SLIDE 1:", "SLIDE 2:", etc.`;
    case 'meme':
      return `You are a meme creator. Generate meme text with TOP TEXT and BOTTOM TEXT format. Keep it punchy, humorous, and relatable to the topic. Include 2-3 variations. Format: "TOP: [text]\nBOTTOM: [text]"`;
    case 'google-ads':
      return `You are a Google Ads copywriter. Generate ad copy with: 3 headlines (max 30 chars each), 2 descriptions (max 90 chars each), and display URL paths. Include multiple ad variations. Focus on strong CTAs, unique value propositions, and keyword relevance.`;
    case 'glossary':
      return `You are a technical writer creating glossary entries. Define terms clearly and concisely with examples. Include related terms, usage context, and SEO-friendly definitions.`;
    default:
      return ''; // Will use the existing blog system prompt
  }
}

function getMaxTokensForFormat(formatType: string, targetLength: number): number {
  switch (formatType) {
    case 'social-twitter': return 200;
    case 'meme': return 300;
    case 'google-ads': return 500;
    case 'social-facebook': return 800;
    case 'social-instagram': return 800;
    case 'social-linkedin': return 1200;
    case 'carousel': return 1500;
    case 'email': return 2000;
    case 'script': return 3000;
    default: return Math.max(4000, targetLength * 2);
  }
}

function buildQuickFormatPrompt(config: ContentGenerationConfig): string {
  const sol = config.selectedSolution;
  let prompt = `Create ${config.formatType} content about "${config.mainKeyword}".\n\n`;
  
  if (config.title) prompt += `Title/Topic: ${config.title}\n\n`;
  
  if (sol) {
    prompt += `**Solution/Product Context:**\nName: ${sol.name}\n`;
    if (sol.description) prompt += `Description: ${sol.description}\n`;
    if (Array.isArray(sol.features) && sol.features.length) prompt += `Features: ${sol.features.join(', ')}\n`;
    if (Array.isArray(sol.painPoints) && sol.painPoints.length) prompt += `Pain Points: ${sol.painPoints.join(', ')}\n`;
    if (Array.isArray(sol.useCases) && sol.useCases.length) prompt += `Use Cases: ${sol.useCases.join(', ')}\n`;
    if (Array.isArray(sol.targetAudience) && sol.targetAudience.length) prompt += `Target Audience: ${sol.targetAudience.join(', ')}\n`;
    prompt += '\n';
  }
  
  if (config.additionalInstructions) {
    prompt += `**Additional Instructions:**\n${config.additionalInstructions}\n\n`;
  }
  
  if (config.secondaryKeywords) {
    prompt += `**Related Keywords to incorporate:** ${config.secondaryKeywords}\n\n`;
  }
  
  prompt += `Generate the content now:`;
  return prompt;
}

/**
 * Chunked generation: splits outline into groups of 2-3 sections,
 * generates each chunk separately, then concatenates for reliable long-form output.
 */
async function generateInChunks(
  config: ContentGenerationConfig,
  provider: { provider: string; api_key: string; preferred_model: string | null },
  systemPrompt: string,
  fullPrompt: string,
  totalMaxTokens: number
): Promise<string | null> {
  try {
    // Parse outline into sections by splitting on heading markers
    const outlineLines = (config.outline || '').split('\n').filter(l => l.trim());
    const sections: { heading: string; lines: string[] }[] = [];
    let current: { heading: string; lines: string[] } | null = null;

    for (const line of outlineLines) {
      if (/^#{1,3}\s/.test(line.trim()) || /^\d+\.\s/.test(line.trim()) || /^-\s+\*\*/.test(line.trim())) {
        if (current) sections.push(current);
        current = { heading: line.trim(), lines: [] };
      } else if (current) {
        current.lines.push(line);
      } else {
        current = { heading: line.trim(), lines: [] };
      }
    }
    if (current) sections.push(current);

    if (sections.length < 2) {
      console.warn('⚠️ Not enough sections for chunked generation');
      return null;
    }

    // Group sections into chunks of 2-3
    const CHUNK_SIZE = 3;
    const chunks: typeof sections[] = [];
    for (let i = 0; i < sections.length; i += CHUNK_SIZE) {
      chunks.push(sections.slice(i, i + CHUNK_SIZE));
    }

    const wordsPerChunk = Math.ceil(config.targetLength / chunks.length);
    const tokensPerChunk = Math.max(4000, Math.ceil(wordsPerChunk * 2.2)); // ~2.2 tokens per word for reliable output
    const allParts: string[] = [];
    let previousSummary = '';

    console.log(`📦 Chunked gen: ${chunks.length} chunks, ~${wordsPerChunk} words each`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkOutline = chunk.map(s => [s.heading, ...s.lines].join('\n')).join('\n');
      const isFirst = i === 0;
      const isLast = i === chunks.length - 1;

      let chunkPrompt = '';
      if (isFirst) {
        // First chunk includes the full context but only writes the first sections
        chunkPrompt = `${fullPrompt}

IMPORTANT: You are writing PART 1 of ${chunks.length} of this article. Write ONLY these sections now:

${chunkOutline}

ABSOLUTE MINIMUM: ${wordsPerChunk} words for these sections. Write detailed, thorough content with examples, explanations, and analysis for each section. Do NOT summarize or be brief. Do NOT write a conclusion or wrap up — more sections follow.
Start with the H1 title and these opening sections.`;
      } else {
        chunkPrompt = `You are continuing an article about "${config.mainKeyword}" titled "${config.title}".

Here is what has been written so far (summary):
${previousSummary}

Now write the NEXT sections (Part ${i + 1} of ${chunks.length}):

${chunkOutline}

REQUIREMENTS:
- ABSOLUTE MINIMUM: ${wordsPerChunk} words for these sections. Write detailed, thorough content with examples, explanations, and analysis. Do NOT summarize or be brief
- Continue naturally from the previous content — do NOT repeat the title or introduction
- Do NOT start with a heading that summarizes the whole article
${isLast ? '- This is the FINAL part — include a strong conclusion and any FAQ section if appropriate' : '- Do NOT write a conclusion — more sections follow'}
- Maintain the same writing style: ${config.writingStyle}, ${config.expertiseLevel} level
- Naturally incorporate the keyword "${config.mainKeyword}" where appropriate`;
      }

      const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-proxy', {
        body: {
          service: provider.provider,
          endpoint: 'chat',
          params: {
            model: provider.preferred_model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: chunkPrompt }
            ],
            max_tokens: tokensPerChunk,
            temperature: 0.7,
          },
        }
      });

      if (aiError) {
        console.error(`❌ Chunk ${i + 1} failed:`, aiError);
        return null;
      }

      const chunkContent = aiData?.data?.choices?.[0]?.message?.content
        || aiData?.choices?.[0]?.message?.content
        || aiData?.content || '';

      if (!chunkContent) {
        console.error(`❌ Chunk ${i + 1} returned empty content`);
        return null;
      }

      const chunkWordCount = chunkContent.split(/\s+/).length;
      console.log(`  ✅ Chunk ${i + 1}/${chunks.length}: ${chunkWordCount} words`);

      allParts.push(chunkContent);

      // Create a brief summary for context continuity (last 2 headings + key points)
      const headingsInChunk = chunkContent.match(/^#{1,3}\s.+$/gm) || [];
      previousSummary = `Sections covered so far: ${headingsInChunk.slice(-3).join(', ')}. The article has covered ${allParts.reduce((sum, p) => sum + p.split(/\s+/).length, 0)} words so far.`;
    }

    // Concatenate all chunks — remove duplicate title from subsequent chunks
    let finalContent = allParts[0];
    for (let i = 1; i < allParts.length; i++) {
      let part = allParts[i];
      // Remove any accidental title repetition at the start of subsequent chunks
      const titleMatch = part.match(/^#\s.+\n/);
      if (titleMatch && finalContent.includes(titleMatch[0].trim())) {
        part = part.replace(titleMatch[0], '');
      }
      finalContent += '\n\n' + part.trim();
    }

    const totalWords = finalContent.split(/\s+/).length;
    const targetRatio = totalWords / config.targetLength;
    if (targetRatio < 0.8) {
      console.warn(`⚠️ Word count undershoot: ${totalWords} words vs ${config.targetLength} target (${Math.round(targetRatio * 100)}%)`);
    } else {
      console.log(`✅ Final word count: ${totalWords} words (${Math.round(targetRatio * 100)}% of ${config.targetLength} target)`);
    }

    return finalContent;
  } catch (error) {
    console.error('💥 Chunked generation failed:', error);
    return null;
  }
}

/**
 * Generate advanced content using selected SERP items and AI
 */
export async function generateAdvancedContent(
  config: ContentGenerationConfig, 
  aiProvider: string = 'openrouter'
): Promise<string | null> {
  try {
    // Import AIServiceController dynamically to avoid circular dependencies
    const { default: AIServiceController } = await import('@/services/aiService/AIServiceController');
    
    console.log('🚀 Starting advanced content generation with config:', {
      keyword: config.mainKeyword,
      title: config.title,
      serpSelectionsCount: config.serpSelections.length,
      selectedItemsCount: config.serpSelections.filter(item => item.selected).length,
      hasOutline: !!config.outline,
      hasSecondaryKeywords: !!config.secondaryKeywords,
      additionalInstructionsLength: config.additionalInstructions?.length || 0,
      hasSolution: !!config.selectedSolution,
      solutionFieldSummary: config.selectedSolution ? {
        features: Array.isArray(config.selectedSolution.features) ? config.selectedSolution.features.length : 0,
        painPoints: Array.isArray(config.selectedSolution.painPoints) ? config.selectedSolution.painPoints.length : 0,
        useCases: Array.isArray(config.selectedSolution.useCases) ? config.selectedSolution.useCases.length : 0,
        hasMarketData: !!(config.selectedSolution as any).marketData,
        hasTechnicalSpecs: !!(config.selectedSolution as any).technicalSpecs,
        hasCaseStudies: Array.isArray((config.selectedSolution as any).caseStudies) && (config.selectedSolution as any).caseStudies.length > 0,
        hasPricing: !!(config.selectedSolution as any).pricing,
      } : null
    });

    // Determine if this is a quick (non-blog) format
    const quickFormat = isQuickFormat(config.formatType);

    // Validate that we have selected SERP items (only relevant for blog formats)
    const selectedSerpItems = config.serpSelections.filter(item => item.selected);
    if (!quickFormat && selectedSerpItems.length === 0) {
      console.warn('⚠️ No SERP items selected for content generation');
    } else if (!quickFormat) {
      console.log('✅ Using selected SERP items:', {
        totalSelected: selectedSerpItems.length,
        byType: selectedSerpItems.reduce((acc, item) => {
          acc[item.type] = (acc[item.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });
    }

    // Build prompt based on format type
    let prompt: string;
    if (quickFormat) {
      prompt = buildQuickFormatPrompt(config);
    } else {
      prompt = buildAdvancedContentPrompt(config);

      // Optionally append solution-aware guidelines for blog formats
      const effectiveContentType = config.contentType || 'general';
      if (config.selectedSolution && effectiveContentType && config.contentIntent) {
        const targetKeywords = [
          config.mainKeyword,
          ...((config.secondaryKeywords || '').split(',').map(k => k.trim()).filter(Boolean))
        ];

        prompt = AISolutionIntegrationService.createSolutionAwarePrompt({
          solution: config.selectedSolution,
          contentType: config.contentType as any,
          contentIntent: config.contentIntent as any,
          targetKeywords,
          audience: Array.isArray(config.selectedSolution?.targetAudience)
            ? config.selectedSolution.targetAudience.join(', ')
            : undefined
        }, prompt);

        console.log('🧩 Solution-aware guidelines appended to prompt');
      }
    }
    
    console.log('📝 Generated content prompt length:', prompt.length);
    console.log('🎯 Format type:', config.formatType || 'blog (default)');

    // Choose system prompt based on format
    const formatSystemPrompt = config.formatType ? getSystemPromptForFormat(config.formatType) : '';
    let systemPrompt = formatSystemPrompt || `You are an expert content writer specializing in creating comprehensive, SEO-optimized articles that genuinely help readers. Your content is:

1. HELPFUL FIRST: Always prioritize providing real value to readers over SEO optimization
2. ACCURATE: Base content on factual information and best practices
3. COMPREHENSIVE: Cover topics thoroughly while remaining focused
4. ACTIONABLE: Provide concrete steps and practical advice readers can implement
5. ENGAGING: Use clear, conversational language that keeps readers interested
6. WELL-STRUCTURED: Follow logical flow with proper headings and formatting

WRITING STYLE RULES (MANDATORY — VIOLATION = FAILURE):
- NEVER start with "In today's [adjective] world/environment/landscape" or any variation
- NEVER use these words/phrases: "game-changer", "revolutionize", "landscape", "paramount", "leverage", "navigate the complexities", "realm", "tapestry", "comprehensive guide", "delve into", "it's important to note", "In conclusion", "without further ado", "let's dive in", "at the end of the day", "unlock the power", "harness the potential", "cutting-edge", "seamless", "robust"
- Start articles with a specific fact, statistic, question, or real scenario — never a generic opener
- Write like a subject-matter expert talking to a peer, not an AI summarizing a topic
- Use concrete numbers, specific examples, and named references wherever possible
- Vary sentence length deliberately. Mix short punchy sentences with longer explanatory ones
- Use active voice. Avoid passive constructions
- No filler paragraphs — every paragraph MUST advance the reader's understanding
- When mentioning a solution/product, integrate it as a natural recommendation within the educational flow — NEVER shift to sales copy tone

DEPTH RULES (MANDATORY):
- When listing items, include specific details (version numbers, module names, config steps, exact metrics)
- Replace generic bullet points with actionable steps a practitioner can follow immediately
- Include at least one specific example, metric, or benchmark per major section
- Prefer "Company X achieved Y% improvement in Z months" over "organizations have reported improvements"

CASE STUDY RULES (when case studies are provided):
- You MUST cite each case study with the EXACT company name, industry, and numerical results provided
- NEVER paraphrase case studies into vague statements like "organizations have reported improvements"
- Each case study = a concrete proof point with specific metrics placed in the most relevant section

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

    // Integrate user's custom prompt template as additive layer (Settings → on top of Wizard)
    const formatForTemplate = config.formatType || 'blog';
    try {
      const userTemplates = getPromptTemplatesByType(formatForTemplate);
      if (userTemplates.length > 0) {
        const userTemplate = userTemplates[0];
        if (userTemplate.promptTemplate) {
          systemPrompt += `\n\nADDITIONAL USER PREFERENCES (follow these on top of all rules above):\n${userTemplate.promptTemplate}`;
          console.log('📋 Appended user prompt template for format:', formatForTemplate);
        }
        if (userTemplate.structureTemplate) {
          systemPrompt += `\n\nUSER STRUCTURE PREFERENCES:\n${userTemplate.structureTemplate}`;
        }
      }
    } catch (e) {
      console.warn('⚠️ Could not load user prompt templates:', e);
    }

    // Get user's active AI provider directly
    console.log(`🚀 Advanced content generation via direct ai-proxy`);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: provider, error: providerError } = await supabase
      .from('ai_service_providers')
      .select('provider, api_key, preferred_model')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('priority', { ascending: true })
      .limit(1)
      .single();

    if (providerError || !provider) {
      console.error('❌ No AI provider configured:', providerError);
      throw new Error('No AI provider configured. Please set up an AI provider in Settings.');
    }

    console.log(`🔌 Using provider: ${provider.provider} (${provider.preferred_model})`);

    // Calculate max tokens based on format
    const maxTokens = getMaxTokensForFormat(config.formatType || 'blog', config.targetLength);

    // For long blog articles (>2500 words), use chunked generation
    if (!quickFormat && config.targetLength > 2500 && config.outline && config.outline.trim()) {
      console.log(`📦 Using chunked generation for ${config.targetLength} word target`);
      const chunkedResult = await generateInChunks(config, provider, systemPrompt, prompt, maxTokens);
      if (chunkedResult) {
        const wordCount = chunkedResult.split(/\s+/).length;
        console.log(`✅ Chunked generation complete: ${wordCount} words`);
        return chunkedResult;
      }
      console.warn('⚠️ Chunked generation failed, falling back to single-pass');
    }

    // Single-pass generation (for short content or fallback)
    const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-proxy', {
      body: {
        service: provider.provider,
        endpoint: 'chat',
        params: {
          model: provider.preferred_model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          max_tokens: maxTokens,
          temperature: 0.7,
        },
      }
    });

    if (aiError) {
      console.error('❌ ai-proxy returned error:', aiError);
      throw new Error(`AI proxy error: ${aiError.message || 'Unknown error'}`);
    }

    console.log('🔍 ai-proxy raw response keys:', aiData ? Object.keys(aiData) : 'null');

    // Extract content from ai-proxy response
    const generatedContent = aiData?.data?.choices?.[0]?.message?.content
      || aiData?.choices?.[0]?.message?.content 
      || aiData?.data?.content
      || aiData?.content 
      || aiData?.text
      || (typeof aiData === 'string' ? aiData : null);

    if (!generatedContent) {
      console.error('❌ AI service returned empty content. Full response:', JSON.stringify(aiData).slice(0, 500));
      return null;
    }

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

  // Add solution integration - EXHAUSTIVE context
  if (selectedSolution) {
    const sol = selectedSolution as any;
    prompt += `**SOLUTION / OFFERING CONTEXT (use this throughout the content):**
Name: ${sol.name}
Category: ${sol.category || 'N/A'}
Description: ${sol.description || ''}
${sol.shortDescription ? `Short Description: ${sol.shortDescription}` : ''}
${sol.positioningStatement ? `Positioning: ${sol.positioningStatement}` : ''}

**All Features:** ${Array.isArray(sol.features) ? sol.features.join(', ') : 'N/A'}
**All Pain Points Addressed:** ${Array.isArray(sol.painPoints) ? sol.painPoints.join(', ') : 'N/A'}
**Target Audience:** ${Array.isArray(sol.targetAudience) ? sol.targetAudience.join(', ') : 'N/A'}
**All Use Cases:** ${Array.isArray(sol.useCases) ? sol.useCases.join(', ') : 'N/A'}
${Array.isArray(sol.benefits) && sol.benefits.length > 0 ? `**Benefits:** ${sol.benefits.join(', ')}` : ''}
${Array.isArray(sol.integrations) && sol.integrations.length > 0 ? `**Integrations:** ${sol.integrations.join(', ')}` : ''}
${Array.isArray(sol.uniqueValuePropositions) && sol.uniqueValuePropositions.length > 0 ? `**Value Propositions:** ${sol.uniqueValuePropositions.join(', ')}` : ''}
${Array.isArray(sol.keyDifferentiators) && sol.keyDifferentiators.length > 0 ? `**Key Differentiators:** ${sol.keyDifferentiators.join(', ')}` : ''}
`;

    // Competitors
    if (Array.isArray(sol.competitors) && sol.competitors.length > 0) {
      prompt += `\n**Competitive Landscape:**\n`;
      sol.competitors.forEach((c: any) => {
        const strengths = Array.isArray(c.strengths) ? c.strengths.join(', ') : String(c.strengths || 'N/A');
        const weaknesses = Array.isArray(c.weaknesses) ? c.weaknesses.join(', ') : String(c.weaknesses || 'N/A');
        prompt += `- ${c.name || 'Unknown'}: Strengths: ${strengths}; Weaknesses: ${weaknesses}\n`;
      });
    }

    // Case Studies
    if (Array.isArray(sol.caseStudies) && sol.caseStudies.length > 0) {
      prompt += `\n**Case Studies:**\n`;
      sol.caseStudies.forEach((cs: any) => {
        const resultsStr = Array.isArray(cs.results) 
          ? cs.results.join(', ') 
          : typeof cs.results === 'object' && cs.results 
            ? Object.entries(cs.results).map(([k, v]) => `${k}: ${v}`).join(', ')
            : String(cs.results || 'N/A');
        prompt += `- ${cs.company || 'Client'} (${cs.industry || 'Industry'}): Challenge: ${cs.challenge || 'N/A'}. Solution: ${cs.solution || 'N/A'}. Results: ${resultsStr}`;
        if (cs.testimonial && typeof cs.testimonial === 'object') prompt += ` | Testimonial: "${cs.testimonial.quote || ''}" — ${cs.testimonial.author || ''}, ${cs.testimonial.position || ''}`;
        prompt += `\n`;
      });
    }

    // Pricing
    if (sol.pricing && typeof sol.pricing === 'object') {
      prompt += `\n**Pricing:** Model: ${sol.pricing.model || 'N/A'}`;
      if (sol.pricing.startingPrice) prompt += `, Starting at: ${sol.pricing.startingPrice}`;
      if (Array.isArray(sol.pricing.tiers) && sol.pricing.tiers.length > 0) {
        prompt += `\nTiers: ${sol.pricing.tiers.map((t: any) => {
          const tierFeatures = Array.isArray(t.features) ? t.features.join(', ') : String(t.features || 'N/A');
          return `${t.name || 'Tier'} (${t.price || 'N/A'}): ${tierFeatures}`;
        }).join(' | ')}`;
      }
      prompt += `\n`;
    }

    // Technical Specs
    if (sol.technicalSpecs) {
      const ts = sol.technicalSpecs;
      const parts: string[] = [];
      if (Array.isArray(ts.supportedPlatforms) && ts.supportedPlatforms.length) parts.push(`Platforms: ${ts.supportedPlatforms.join(', ')}`);
      if (Array.isArray(ts.apiCapabilities) && ts.apiCapabilities.length) parts.push(`API: ${ts.apiCapabilities.join(', ')}`);
      if (Array.isArray(ts.securityFeatures) && ts.securityFeatures.length) parts.push(`Security: ${ts.securityFeatures.join(', ')}`);
      if (ts.uptimeGuarantee) parts.push(`Uptime: ${ts.uptimeGuarantee}`);
      if (parts.length > 0) prompt += `\n**Technical Specs:** ${parts.join(' | ')}\n`;
    }

    // Metrics
    if (sol.metrics) {
      const m = sol.metrics;
      const parts: string[] = [];
      if (m.adoptionRate) parts.push(`Adoption: ${m.adoptionRate}`);
      if (m.customerSatisfaction) parts.push(`Satisfaction: ${m.customerSatisfaction}`);
      if (m.roi) parts.push(`ROI: ${m.roi}`);
      if (m.implementationTime) parts.push(`Implementation: ${m.implementationTime}`);
      if (parts.length > 0) prompt += `**Metrics:** ${parts.join(' | ')}\n`;
    }

    // Market Data
    if (sol.marketData) {
      prompt += `**Market Data:** ${JSON.stringify(sol.marketData)}\n`;
    }

    prompt += `
SOLUTION INTEGRATION REQUIREMENTS:
- Naturally weave the offering's name, features, and benefits throughout the content
- Address specific pain points the offering solves with concrete examples
- Reference case studies and metrics as proof points
- Use competitive positioning to highlight differentiators
- Include pricing context where relevant
- End with a compelling call-to-action related to the offering
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
7. **Length**: You MUST write between ${Math.floor(config.targetLength * 0.9)} and ${Math.ceil(config.targetLength * 1.1)} words. This is a hard requirement — count your output carefully
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
