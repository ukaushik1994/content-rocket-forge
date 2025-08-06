/**
 * Smart title generator that creates content-specific titles
 */

import { analyzeContentForTitles, ContentAnalysisResult } from './enhancedContentAnalysis';

export interface TitleGenerationOptions {
  preferredStyles: string[];
  avoidGeneric: boolean;
  includeYear: boolean;
  maxLength: number;
  minLength: number;
  focusAreas: string[];
}

/**
 * Generate smart, content-based titles
 */
export function generateSmartTitles(
  content: string,
  mainKeyword: string,
  selectedKeywords: string[] = [],
  options: Partial<TitleGenerationOptions> = {}
): string[] {
  const defaultOptions: TitleGenerationOptions = {
    preferredStyles: ['how-to', 'listicle', 'guide', 'tips'],
    avoidGeneric: true,
    includeYear: true,
    maxLength: 65,
    minLength: 30,
    focusAreas: []
  };
  
  const opts = { ...defaultOptions, ...options };
  const analysis = analyzeContentForTitles(content, mainKeyword);
  const currentYear = new Date().getFullYear();
  
  const titles: string[] = [];
  
  // Generate structure-based titles
  titles.push(...generateStructureTitles(analysis, mainKeyword, opts));
  
  // Generate content-type specific titles
  titles.push(...generateContentTypeTitles(analysis, mainKeyword, opts));
  
  // Generate benefit-driven titles
  titles.push(...generateBenefitTitles(analysis, mainKeyword, opts));
  
  // Generate topic-specific titles
  titles.push(...generateTopicTitles(analysis, mainKeyword, selectedKeywords, opts));
  
  // Generate tone-matched titles
  titles.push(...generateToneMatchedTitles(analysis, mainKeyword, opts));
  
  // Filter and optimize
  return titles
    .filter(title => title.length >= opts.minLength && title.length <= opts.maxLength)
    .filter(title => opts.avoidGeneric ? !isGenericTitle(title) : true)
    .slice(0, 15);
}

/**
 * Generate titles based on content structure
 */
function generateStructureTitles(
  analysis: ContentAnalysisResult, 
  mainKeyword: string, 
  options: TitleGenerationOptions
): string[] {
  const titles: string[] = [];
  const year = options.includeYear ? new Date().getFullYear() : '';
  
  switch (analysis.structure) {
    case 'step-by-step':
      titles.push(
        `How to ${mainKeyword}: A Step-by-Step Process${year ? ` for ${year}` : ''}`,
        `${mainKeyword} Implementation: Complete Step-by-Step Guide`,
        `Master ${mainKeyword} in ${Math.floor(Math.random() * 5) + 3} Simple Steps`
      );
      break;
      
    case 'listicle':
      const listNumbers = [5, 7, 10, 12, 15];
      const randomNum = listNumbers[Math.floor(Math.random() * listNumbers.length)];
      titles.push(
        `${randomNum} ${mainKeyword} Strategies That Actually Work`,
        `Top ${randomNum} ${mainKeyword} Tips for Better Results`,
        `${randomNum} Essential ${mainKeyword} Techniques You Need to Know`
      );
      break;
      
    case 'comparison':
      titles.push(
        `${mainKeyword}: Comparing the Best Approaches${year ? ` in ${year}` : ''}`,
        `Which ${mainKeyword} Method Works Best? Complete Comparison`,
        `${mainKeyword} Options Analyzed: What's Right for You?`
      );
      break;
      
    case 'faq':
      titles.push(
        `${mainKeyword} Questions Answered: Complete FAQ Guide`,
        `Common ${mainKeyword} Questions and Expert Answers`,
        `Everything You Need to Know About ${mainKeyword}`
      );
      break;
      
    case 'case-study':
      titles.push(
        `${mainKeyword} Success Stories: Real-World Examples`,
        `How Companies Master ${mainKeyword}: Case Study Analysis`,
        `${mainKeyword} in Action: Proven Case Studies`
      );
      break;
  }
  
  return titles;
}

/**
 * Generate titles based on content type
 */
function generateContentTypeTitles(
  analysis: ContentAnalysisResult,
  mainKeyword: string,
  options: TitleGenerationOptions
): string[] {
  const titles: string[] = [];
  const year = options.includeYear ? new Date().getFullYear() : '';
  
  switch (analysis.contentType) {
    case 'how-to':
      titles.push(
        `How to Excel at ${mainKeyword}: Practical Guide`,
        `${mainKeyword} Made Simple: Step-by-Step Tutorial`,
        `Learn ${mainKeyword}: From Basics to Advanced${year ? ` (${year})` : ''}`
      );
      break;
      
    case 'educational':
      titles.push(
        `Understanding ${mainKeyword}: Complete Learning Guide`,
        `${mainKeyword} Fundamentals: What Every Beginner Should Know`,
        `Master the Basics of ${mainKeyword}${year ? ` - ${year} Edition` : ''}`
      );
      break;
      
    case 'problem-solving':
      titles.push(
        `Solving ${mainKeyword} Problems: Expert Solutions`,
        `${mainKeyword} Troubleshooting: Fix Common Issues`,
        `Overcome ${mainKeyword} Challenges with These Proven Methods`
      );
      break;
      
    case 'review':
      titles.push(
        `${mainKeyword} Review: Comprehensive Analysis${year ? ` for ${year}` : ''}`,
        `Is ${mainKeyword} Worth It? Detailed Review and Analysis`,
        `${mainKeyword} Pros and Cons: Honest Assessment`
      );
      break;
  }
  
  return titles;
}

/**
 * Generate benefit-driven titles
 */
function generateBenefitTitles(
  analysis: ContentAnalysisResult,
  mainKeyword: string,
  options: TitleGenerationOptions
): string[] {
  const titles: string[] = [];
  const benefits = ['improve', 'boost', 'enhance', 'optimize', 'maximize', 'accelerate'];
  const outcomes = ['results', 'performance', 'success', 'efficiency', 'productivity'];
  
  if (analysis.valuePropositions.length > 0) {
    analysis.valuePropositions.slice(0, 3).forEach(value => {
      const cleanValue = value.replace(/\b(improve|increase|boost|enhance|optimize|maximize|reduce|save|achieve|master|learn|discover|unlock|transform)\s+/i, '');
      if (cleanValue.length > 5) {
        titles.push(`${mainKeyword}: How to ${cleanValue.charAt(0).toUpperCase() + cleanValue.slice(1)}`);
      }
    });
  }
  
  // Generic benefit titles
  const randomBenefit = benefits[Math.floor(Math.random() * benefits.length)];
  const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
  
  titles.push(
    `${randomBenefit.charAt(0).toUpperCase() + randomBenefit.slice(1)} Your ${randomOutcome} with ${mainKeyword}`,
    `Transform Your Approach to ${mainKeyword}`,
    `Unlock the Full Potential of ${mainKeyword}`
  );
  
  return titles;
}

/**
 * Generate topic-specific titles
 */
function generateTopicTitles(
  analysis: ContentAnalysisResult,
  mainKeyword: string,
  selectedKeywords: string[],
  options: TitleGenerationOptions
): string[] {
  const titles: string[] = [];
  
  // Use main topics from content
  if (analysis.mainTopics.length > 0) {
    analysis.mainTopics.slice(0, 2).forEach(topic => {
      titles.push(
        `${mainKeyword} and ${topic}: The Complete Connection`,
        `How ${topic} Impacts Your ${mainKeyword} Strategy`
      );
    });
  }
  
  // Use selected keywords
  if (selectedKeywords.length > 0) {
    selectedKeywords.slice(0, 2).forEach(keyword => {
      if (keyword !== mainKeyword) {
        titles.push(
          `${mainKeyword} + ${keyword}: Powerful Combination Guide`,
          `Integrating ${keyword} with Your ${mainKeyword} Approach`
        );
      }
    });
  }
  
  return titles;
}

/**
 * Generate tone-matched titles
 */
function generateToneMatchedTitles(
  analysis: ContentAnalysisResult,
  mainKeyword: string,
  options: TitleGenerationOptions
): string[] {
  const titles: string[] = [];
  
  switch (analysis.sentimentTone) {
    case 'friendly':
      titles.push(
        `${mainKeyword} Made Easy: Your Friendly Guide`,
        `Simple ${mainKeyword}: No Stress, Just Results`,
        `${mainKeyword} for Everyone: Easy and Effective`
      );
      break;
      
    case 'technical':
      titles.push(
        `Advanced ${mainKeyword}: Technical Implementation Guide`,
        `${mainKeyword} Architecture: Deep Technical Analysis`,
        `Professional ${mainKeyword}: Technical Best Practices`
      );
      break;
      
    case 'conversational':
      titles.push(
        `Let's Talk ${mainKeyword}: Real-World Insights`,
        `${mainKeyword} Explained: Straight Talk from Experts`,
        `Your ${mainKeyword} Questions Answered`
      );
      break;
      
    case 'formal':
      titles.push(
        `${mainKeyword}: Professional Methodology and Framework`,
        `Comprehensive ${mainKeyword} Analysis and Implementation`,
        `Strategic Approach to ${mainKeyword} Excellence`
      );
      break;
  }
  
  return titles;
}

/**
 * Check if a title is too generic
 */
function isGenericTitle(title: string): boolean {
  const genericPhrases = [
    'complete guide',
    'ultimate guide',
    'comprehensive guide',
    'everything you need to know',
    'all you need to know',
    'definitive guide',
    'beginners guide',
    'step by step guide'
  ];
  
  const lowerTitle = title.toLowerCase();
  return genericPhrases.some(phrase => lowerTitle.includes(phrase));
}