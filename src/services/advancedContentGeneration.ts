
import { sendChatRequest } from '@/services/aiService';
import { AiProvider } from '@/services/aiService/types';
import { SerpSelection, Solution } from '@/contexts/content-builder/types';
import { WritingStyle, ExpertiseLevel, WRITING_STYLES, EXPERTISE_LEVELS } from './contentQualityService';

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
  selectedSolution?: Solution;
  additionalInstructions?: string;
  includeStats: boolean;
  includeCaseStudies: boolean;
  includeFAQs: boolean;
}

export interface ContentTemplate {
  type: string;
  structure: string;
  elements: string[];
  hooks: string[];
}

export const CONTENT_TEMPLATES: Record<string, ContentTemplate> = {
  'how-to': {
    type: 'How-To Guide',
    structure: 'Introduction → Prerequisites → Step-by-step process → Tips & best practices → Conclusion with next steps',
    elements: ['Clear numbered steps', 'Visual cues', 'Troubleshooting tips', 'Time estimates', 'Tools needed'],
    hooks: ['Start with the end result', 'Address common pain points', 'Promise specific outcomes']
  },
  'listicle': {
    type: 'Listicle',
    structure: 'Compelling intro → Numbered/bulleted items → Brief explanations → Summary with key takeaways',
    elements: ['Scannable format', 'Consistent item structure', 'Supporting data', 'Visual breaks'],
    hooks: ['Use specific numbers', 'Promise valuable insights', 'Address reader curiosity']
  },
  'comprehensive': {
    type: 'Comprehensive Guide',
    structure: 'Executive summary → Detailed sections → Examples → FAQs → Resources → Conclusion',
    elements: ['Table of contents', 'In-depth analysis', 'Multiple examples', 'External resources', 'Glossary'],
    hooks: ['Position as ultimate resource', 'Highlight comprehensive coverage', 'Appeal to thorough understanding']
  },
  'general': {
    type: 'General Article',
    structure: 'Hook introduction → Main points with supporting evidence → Practical applications → Conclusion',
    elements: ['Clear headings', 'Supporting evidence', 'Practical examples', 'Smooth transitions'],
    hooks: ['Ask compelling questions', 'Share surprising statistics', 'Tell relevant stories']
  }
};

/**
 * Generate high-quality content using advanced prompting and templates
 */
export async function generateAdvancedContent(
  config: ContentGenerationConfig,
  provider: AiProvider = 'openai'
): Promise<string | null> {
  try {
    const template = CONTENT_TEMPLATES[config.contentType] || CONTENT_TEMPLATES.general;
    const style = WRITING_STYLES.find(s => s.name === config.writingStyle) || WRITING_STYLES[0];
    const expertise = EXPERTISE_LEVELS.find(e => e.level === config.expertiseLevel) || EXPERTISE_LEVELS[1];
    
    const systemPrompt = createAdvancedSystemPrompt(style, expertise, template);
    const userPrompt = createAdvancedUserPrompt(config, template, style, expertise);
    
    console.log('Generating advanced content with enhanced prompts');
    
    const response = await sendChatRequest(provider, {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      maxTokens: Math.min(4000, Math.max(2000, config.targetLength * 2))
    });

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('No response from AI service');
    }

    return response.choices[0].message.content;
    
  } catch (error) {
    console.error('Error in advanced content generation:', error);
    return null;
  }
}

function createAdvancedSystemPrompt(
  style: WritingStyle, 
  expertise: ExpertiseLevel, 
  template: ContentTemplate
): string {
  return `You are an expert content writer specializing in creating ${template.type.toLowerCase()} content. Your writing follows these specific guidelines:

WRITING STYLE: ${style.name}
- Tone: ${style.tone}
- Vocabulary: ${style.vocabulary}  
- Sentence Structure: ${style.sentenceLength}
- Perspective: ${style.perspective}

TARGET AUDIENCE: ${expertise.level} Level
- Vocabulary Complexity: ${expertise.vocabularyComplexity}
- Explanation Depth: ${expertise.explanationDepth}
- Technical Details: ${expertise.technicalDetails}

CONTENT TYPE: ${template.type}
- Structure: ${template.structure}
- Required Elements: ${template.elements.join(', ')}
- Engagement Hooks: ${template.hooks.join(', ')}

QUALITY STANDARDS:
1. CLARITY: Use clear, precise language appropriate for the target audience
2. ENGAGEMENT: Include hooks, stories, and interactive elements
3. STRUCTURE: Follow logical flow with proper headings and transitions
4. VALUE: Provide actionable insights and practical takeaways
5. CREDIBILITY: Support claims with data and examples when requested
6. SEO: Optimize for search while maintaining readability
7. BRAND VOICE: Maintain consistency with specified writing style

Always prioritize reader value and engagement over keyword density. Write content that genuinely helps readers achieve their goals.`;
}

function createAdvancedUserPrompt(
  config: ContentGenerationConfig,
  template: ContentTemplate,
  style: WritingStyle,
  expertise: ExpertiseLevel
): string {
  const serpData = organizeSerpSelections(config.serpSelections);
  
  let prompt = `Create a ${template.type.toLowerCase()} titled: "${config.title}"

CONTENT SPECIFICATIONS:
- Primary Keyword: ${config.mainKeyword}
- Secondary Keywords: ${config.secondaryKeywords || 'None specified'}
- Target Length: ${config.targetLength} words (±50 words)
- Writing Style: ${style.name} (${style.description})
- Audience Level: ${expertise.level} (${expertise.description})

STRUCTURE REQUIREMENTS:
Follow this ${template.type} structure: ${template.structure}

Required elements to include:
${template.elements.map(element => `- ${element}`).join('\n')}

CONTENT OUTLINE TO FOLLOW:
${config.outline}

ENGAGEMENT REQUIREMENTS:
- Start with one of these hooks: ${template.hooks.join(' OR ')}
- Use ${style.perspective} perspective throughout
- Maintain ${style.tone.toLowerCase()} tone
- Apply ${expertise.explanationDepth.toLowerCase()}
`;

  // Add SERP insights
  if (serpData.questions.length > 0) {
    prompt += `\n\nUSER QUESTIONS TO ADDRESS:
These questions are frequently asked about this topic. Integrate answers naturally:
${serpData.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;
  }

  if (serpData.entities.length > 0) {
    prompt += `\n\nKEY CONCEPTS TO EXPLAIN:
${serpData.entities.map(e => `- ${e} (explain appropriately for ${expertise.level} level)`).join('\n')}`;
  }

  if (serpData.contentGaps.length > 0) {
    prompt += `\n\nUNIQUE ANGLES TO COVER:
Address these gaps that competitors miss:
${serpData.contentGaps.map(gap => `- ${gap}`).join('\n')}`;
  }

  // Add optional elements
  if (config.includeStats) {
    prompt += `\n\nSTATISTICS: Include relevant statistics and data points to support key claims.`;
  }

  if (config.includeCaseStudies) {
    prompt += `\n\nCASE STUDIES: Include at least one relevant case study or real-world example.`;
  }

  if (config.includeFAQs && template.type === 'Comprehensive Guide') {
    prompt += `\n\nFAQ SECTION: Include a FAQ section addressing common questions about ${config.mainKeyword}.`;
  }

  if (config.selectedSolution) {
    prompt += `\n\nSOLUTION HIGHLIGHT: Naturally mention "${config.selectedSolution.name}" and its key benefits: ${config.selectedSolution.features.slice(0, 3).join(', ')}.`;
  }

  if (config.additionalInstructions) {
    prompt += `\n\nADDITIONAL INSTRUCTIONS:
${config.additionalInstructions}`;
  }

  prompt += `\n\nFORMATTING REQUIREMENTS:
- Use proper Markdown formatting with H1 for title, H2/H3 for sections
- Create scannable content with bullet points and numbered lists
- Keep paragraphs to 2-3 sentences for readability
- Include internal linking opportunities where natural
- End with a compelling call-to-action or next steps
- Ensure content flows logically from introduction to conclusion

CRITICAL: The content must be exactly ${config.targetLength} words (±50). Count carefully and adjust as needed.`;

  return prompt;
}

function organizeSerpSelections(serpSelections: SerpSelection[]) {
  const selectedItems = serpSelections.filter(item => item.selected);
  
  return {
    questions: selectedItems.filter(item => item.type === 'question').map(item => item.content),
    entities: selectedItems.filter(item => item.type === 'entity').map(item => item.content),
    contentGaps: selectedItems.filter(item => item.type === 'contentGap').map(item => item.content),
    keywords: selectedItems.filter(item => item.type === 'keyword').map(item => item.content),
    headings: selectedItems.filter(item => item.type === 'heading').map(item => item.content),
    competitors: selectedItems.filter(item => item.type === 'competitor').map(item => item.content)
  };
}
