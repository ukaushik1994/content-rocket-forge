import { sendChatRequest } from '@/services/aiService';
import { ContentGenerationConfig } from '@/services/advancedContentGeneration';

/**
 * Generate contextual titles based on actual generated content
 * This function analyzes the real content to create titles that reflect what was actually written
 */
export async function generateContextualTitles(
  generatedContent: string,
  config: ContentGenerationConfig
): Promise<string[]> {
  try {
    // Extract key themes and structure from the actual content
    const contentAnalysis = analyzeContentStructure(generatedContent);
    
    const prompt = `Analyze this actual generated content and create 10 unique, compelling titles that perfectly reflect what was written.

ACTUAL CONTENT TO ANALYZE:
${generatedContent.substring(0, 2000)}${generatedContent.length > 2000 ? '...' : ''}

CONTENT ANALYSIS:
- Main topic: ${config.mainKeyword}
- Secondary keywords: ${config.secondaryKeywords}
- Content type: ${config.contentType}
- Writing style: ${config.writingStyle}
- Target audience: ${config.expertiseLevel} level
- Key headings found: ${contentAnalysis.headings.join(', ')}
- Main themes: ${contentAnalysis.themes.join(', ')}
- Content structure: ${contentAnalysis.structure}
- Unique value propositions: ${contentAnalysis.valueProps.join(', ')}

TITLE REQUIREMENTS:
1. MUST reflect the actual content themes and value delivered
2. Naturally incorporate "${config.mainKeyword}" 
3. Match the content's depth and scope (not overpromising)
4. Use specific benefits/outcomes mentioned in the content
5. Reflect the actual writing style and expertise level
6. Be compelling and click-worthy while accurate
7. Target 50-65 characters for SEO
8. Avoid generic phrases - be specific to this content
9. Include year ${new Date().getFullYear()} where relevant
10. Each title must be unique and creative

TITLE FORMATS TO PRIORITIZE:
- Problem-solution based on actual solutions provided
- How-to guides reflecting actual steps/methods shown
- Benefit-driven using real benefits demonstrated
- Listicles matching actual numbered points/tips given
- Question-based addressing problems actually solved
- Comparison titles if content compares approaches
- Case study titles if examples/studies are included

Return ONLY the 10 titles, one per line, without numbering.`;

    const response = await sendChatRequest('openai', {
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert content analyst and SEO copywriter. You create titles that perfectly match the actual content value and themes, never overpromising or being generic.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      maxTokens: 600
    });

    if (response?.choices?.[0]?.message?.content) {
      const titles = response.choices[0].message.content
        .split('\n')
        .map(title => title.trim())
        .filter(title => title.length > 0 && !title.match(/^\d+\./))
        .slice(0, 10);
      
      console.log("[generateContextualTitles] Generated contextual titles:", titles);
      return titles;
    }
  } catch (error) {
    console.error("[generateContextualTitles] Error generating contextual titles:", error);
  }
  
  // Fallback to template-based generation
  return generateFallbackTitles(config.mainKeyword, generatedContent);
}

/**
 * Analyze content structure to extract key themes and elements
 */
function analyzeContentStructure(content: string) {
  // Extract headings (H1, H2, H3, etc.)
  const headingMatches = content.match(/#{1,6}\s+([^\n]+)/g) || [];
  const headings = headingMatches.map(h => h.replace(/#{1,6}\s+/, '').trim()).slice(0, 8);
  
  // Extract key themes from first 500 words
  const words = content.toLowerCase().split(/\s+/).slice(0, 500);
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall', 'a', 'an', 'this', 'that', 'these', 'those'];
  
  const significantWords = words
    .filter(word => word.length > 4 && !commonWords.includes(word))
    .reduce((acc: {[key: string]: number}, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});
  
  const themes = Object.entries(significantWords)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6)
    .map(([word]) => word);
  
  // Analyze content structure
  const hasNumberedList = /\d+\.\s/.test(content);
  const hasBulletPoints = /[-*]\s/.test(content);
  const hasSteps = /step\s+\d+/i.test(content);
  const hasComparisons = /(vs\.|versus|compared to|difference between)/i.test(content);
  const hasCaseStudies = /(case study|example|real-world)/i.test(content);
  
  let structure = 'comprehensive guide';
  if (hasSteps) structure = 'step-by-step guide';
  else if (hasNumberedList) structure = 'numbered list';
  else if (hasBulletPoints) structure = 'structured guide';
  else if (hasComparisons) structure = 'comparison analysis';
  else if (hasCaseStudies) structure = 'case study guide';
  
  // Extract value propositions (common benefit words)
  const benefitWords = ['improve', 'increase', 'boost', 'enhance', 'optimize', 'maximize', 'reduce', 'save', 'achieve', 'master', 'learn', 'discover', 'unlock', 'transform'];
  const valueProps = benefitWords.filter(word => content.toLowerCase().includes(word)).slice(0, 4);
  
  return {
    headings,
    themes,
    structure,
    valueProps
  };
}

/**
 * Fallback title generation for when AI is unavailable
 */
function generateFallbackTitles(mainKeyword: string, content: string): string[] {
  const currentYear = new Date().getFullYear();
  const contentWords = content.split(/\s+/).slice(0, 100);
  const hasSteps = /step\s+\d+/i.test(content);
  const hasNumbers = /\d+\.\s/.test(content);
  
  return [
    `${mainKeyword}: Complete Guide for ${currentYear}`,
    `How to Master ${mainKeyword} - Expert Tips`,
    `${mainKeyword} Explained: What You Need to Know`,
    hasSteps ? `Step-by-Step ${mainKeyword} Implementation` : `Essential ${mainKeyword} Strategies`,
    hasNumbers ? `Top ${mainKeyword} Methods That Work` : `Ultimate ${mainKeyword} Handbook`,
    `${mainKeyword} Best Practices for ${currentYear}`,
    `Mastering ${mainKeyword}: A Comprehensive Approach`,
    `${mainKeyword} Success: Proven Techniques and Tips`
  ];
}