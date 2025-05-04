
import { DocumentStructure, SolutionIntegrationMetrics, Solution } from '@/contexts/content-builder/types';

/**
 * Extract headings from content and analyze document structure
 */
export const extractDocumentStructure = (content: string): DocumentStructure => {
  if (!content) {
    return {
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      hasSingleH1: false,
      hasLogicalHierarchy: false,
    };
  }

  // Extract headings using regex
  const h1Matches = content.match(/^# (.+)$|^<h1>(.+)<\/h1>$/gm) || [];
  const h2Matches = content.match(/^## (.+)$|^<h2>(.+)<\/h2>$/gm) || [];
  const h3Matches = content.match(/^### (.+)$|^<h3>(.+)<\/h3>$/gm) || [];
  const h4Matches = content.match(/^#### (.+)$|^<h4>(.+)<\/h4>$/gm) || [];

  // Clean up heading text
  const h1 = h1Matches.map(h => h.replace(/^# |^<h1>|<\/h1>$/g, '').trim());
  const h2 = h2Matches.map(h => h.replace(/^## |^<h2>|<\/h2>$/g, '').trim());
  const h3 = h3Matches.map(h => h.replace(/^### |^<h3>|<\/h3>$/g, '').trim());
  const h4 = h4Matches.map(h => h.replace(/^#### |^<h4>|<\/h4>$/g, '').trim());

  // Check if document has a single H1
  const hasSingleH1 = h1.length === 1;

  // Check for logical hierarchy (no h3 without h2, etc.)
  const hasLogicalHierarchy = h1.length > 0 && 
    (h2.length === 0 || h1.length >= 1) && 
    (h3.length === 0 || h2.length >= 1) &&
    (h4.length === 0 || h3.length >= 1);

  return {
    h1,
    h2,
    h3,
    h4,
    hasSingleH1,
    hasLogicalHierarchy
  };
};

/**
 * Generate meta title and description suggestions
 */
export const generateMetaSuggestions = (
  content: string, 
  mainKeyword: string, 
  contentTitle: string | null
): { metaTitle: string; metaDescription: string } => {
  if (!content) {
    return {
      metaTitle: '',
      metaDescription: ''
    };
  }

  // Create title suggestion based on keyword and content
  let metaTitle = '';
  
  if (contentTitle) {
    // Use content title if available
    metaTitle = contentTitle.length > 60 
      ? `${contentTitle.substring(0, 57)}...` 
      : contentTitle;
  } else {
    // Generate title from main keyword - use first H1 if available or create a generic one
    const h1 = extractDocumentStructure(content).h1[0];
    
    if (h1) {
      metaTitle = h1.length > 60 ? `${h1.substring(0, 57)}...` : h1;
    } else {
      metaTitle = `Complete Guide to ${mainKeyword}`;
    }
  }
  
  // Create description from first paragraph or introduction
  let metaDescription = '';
  
  // Try to find the first significant paragraph
  const paragraphs = content.split(/\n\n+/);
  const textParagraphs = paragraphs.filter(p => 
    !p.startsWith('#') && // Not a heading
    !p.startsWith('!') && // Not an image
    !p.startsWith('```') && // Not a code block
    p.length > 20 // Has some substance
  );
  
  if (textParagraphs.length > 0) {
    const firstPara = textParagraphs[0].replace(/(\*\*|\*|__|_|~~)/g, ''); // Remove markdown formatting
    metaDescription = firstPara.length > 160 
      ? `${firstPara.substring(0, 157)}...` 
      : firstPara;
  } else {
    // Fallback description
    metaDescription = `Learn everything you need to know about ${mainKeyword} in this comprehensive guide covering key concepts and best practices.`;
  }
  
  return {
    metaTitle,
    metaDescription
  };
};

/**
 * Generate multiple unique title suggestions
 */
export const generateTitleSuggestions = async (
  content: string,
  mainKeyword: string,
  selectedKeywords: string[],
  currentTitle: string
): Promise<string[]> => {
  // Create title templates
  const templates = [
    `The Complete Guide to ${mainKeyword}`,
    `${mainKeyword}: Everything You Need to Know`,
    `How to Master ${mainKeyword} in ${new Date().getFullYear()}`,
    `${mainKeyword} 101: A Beginner's Guide`,
    `Top Strategies for ${mainKeyword} Success`,
    `Ultimate ${mainKeyword} Guide: Tips & Best Practices`
  ];
  
  // Add templates with secondary keywords if available
  if (selectedKeywords.length > 0) {
    const secondaryKeyword = selectedKeywords[Math.floor(Math.random() * selectedKeywords.length)];
    templates.push(`${mainKeyword} and ${secondaryKeyword}: The Ultimate Guide`);
    templates.push(`How ${mainKeyword} Relates to ${secondaryKeyword}: Complete Breakdown`);
  }
  
  // Extract the first h1 from content
  const h1 = extractDocumentStructure(content).h1[0];
  if (h1 && h1 !== currentTitle) {
    templates.push(h1);
  }
  
  // Filter out any that match the current title
  const filteredTemplates = templates.filter(
    template => template.toLowerCase() !== currentTitle.toLowerCase()
  );
  
  // Take up to 5 unique titles
  const uniqueTitles = Array.from(new Set(filteredTemplates)).slice(0, 5);
  
  // If we have fewer than 5 titles, generate some variations
  while (uniqueTitles.length < 5) {
    const adjectives = ['Ultimate', 'Complete', 'Essential', 'Comprehensive', 'Definitive'];
    const structures = ['Guide to', 'Handbook for', 'Manual for', 'Approach to', 'Strategies for'];
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const structure = structures[Math.floor(Math.random() * structures.length)];
    
    const newTitle = `The ${adjective} ${structure} ${mainKeyword}`;
    
    if (!uniqueTitles.includes(newTitle) && newTitle.toLowerCase() !== currentTitle.toLowerCase()) {
      uniqueTitles.push(newTitle);
    } else {
      // Add year to ensure uniqueness if we're struggling to generate
      uniqueTitles.push(`${adjective} ${mainKeyword} ${structure} ${new Date().getFullYear()}`);
      break;
    }
  }
  
  return uniqueTitles;
};

/**
 * Analyze solution integration in content
 */
export const analyzeSolutionIntegration = (
  content: string, 
  solution: Solution
): SolutionIntegrationMetrics => {
  if (!content || !solution) {
    return {
      nameMentions: 0,
      featureIncorporation: 0,
      painPointsAddressed: [],
      audienceAlignment: 0,
      positioningScore: 0,
      ctaMentions: 0,
      overallScore: 0
    };
  }
  
  // Count how many times the solution name is mentioned
  const nameMentions = (content.match(new RegExp(solution.name, 'gi')) || []).length;
  
  // Count features mentioned
  let featuresCount = 0;
  solution.features.forEach(feature => {
    const matches = content.match(new RegExp(feature, 'gi')) || [];
    if (matches.length > 0) {
      featuresCount++;
    }
  });
  
  // Calculate feature incorporation percentage
  const featureIncorporation = solution.features.length > 0
    ? Math.round((featuresCount / solution.features.length) * 100)
    : 0;
  
  // Find pain points addressed
  const painPointsAddressed = solution.painPoints.filter(point => {
    return content.match(new RegExp(point, 'gi'));
  });
  
  // Check target audience alignment
  let audienceMatches = 0;
  solution.targetAudience.forEach(audience => {
    const matches = content.match(new RegExp(audience, 'gi')) || [];
    if (matches.length > 0) {
      audienceMatches++;
    }
  });
  
  const audienceAlignment = solution.targetAudience.length > 0
    ? Math.round((audienceMatches / solution.targetAudience.length) * 100)
    : 0;
  
  // Count potential CTA mentions
  const ctaPhrases = [
    `try ${solution.name}`,
    `get ${solution.name}`,
    `use ${solution.name}`,
    `subscribe to`,
    `sign up`,
    `learn more`,
    `contact us`,
    `get started`
  ];
  
  let ctaCount = 0;
  ctaPhrases.forEach(phrase => {
    const matches = content.match(new RegExp(phrase, 'gi')) || [];
    ctaCount += matches.length;
  });
  
  // Calculate overall positioning score
  const positioningScore = Math.min(100, Math.round(
    (nameMentions * 10 + 
    featureIncorporation + 
    (painPointsAddressed.length / Math.max(1, solution.painPoints.length)) * 30 + 
    audienceAlignment + 
    (ctaCount * 15)) / 5
  ));
  
  // Calculate overall score
  const overallScore = Math.round(
    (featureIncorporation * 0.3) + 
    (painPointsAddressed.length / Math.max(1, solution.painPoints.length) * 100 * 0.3) +
    (audienceAlignment * 0.2) +
    (Math.min(5, ctaCount) / 5 * 100 * 0.2)
  );
  
  return {
    nameMentions,
    featureIncorporation,
    painPointsAddressed,
    audienceAlignment,
    positioningScore,
    ctaMentions: ctaCount,
    overallScore
  };
};

/**
 * Detect calls-to-action in content
 */
export const detectCTAs = (content: string): { hasCTA: boolean; ctaText: string[] } => {
  if (!content) {
    return { hasCTA: false, ctaText: [] };
  }
  
  // Common CTA phrases
  const ctaPhrases = [
    'sign up',
    'subscribe',
    'register',
    'get started',
    'try now',
    'download',
    'learn more',
    'contact us',
    'book a demo',
    'get in touch',
    'start today',
    'request a quote',
    'free trial',
    'buy now',
    'order now',
    'get access',
    'join us'
  ];
  
  // Find CTAs in content
  const ctaMatches: string[] = [];
  const paragraphs = content.split(/\n\n+/);
  
  paragraphs.forEach(paragraph => {
    if (ctaPhrases.some(phrase => paragraph.toLowerCase().includes(phrase))) {
      // This paragraph has a CTA phrase
      ctaMatches.push(paragraph.trim());
    }
  });
  
  return {
    hasCTA: ctaMatches.length > 0,
    ctaText: ctaMatches
  };
};
