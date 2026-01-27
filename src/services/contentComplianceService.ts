/**
 * Content compliance analysis service
 * Performs rule-based analysis of content against keywords, SERP selections, solutions, and structure
 */

import { 
  ComplianceAnalysisResult, 
  ComplianceAnalysisOptions,
  KeywordComplianceResult,
  SerpComplianceResult,
  SolutionComplianceResult,
  StructureComplianceResult,
  ComplianceViolation 
} from '@/types/contentCompliance';
import { ContentBuilderState } from '@/contexts/content-builder/types/state-types';

/**
 * Main compliance analysis function
 */
export const analyzeContentCompliance = (
  content: string,
  state: ContentBuilderState,
  options: ComplianceAnalysisOptions = {}
): ComplianceAnalysisResult => {
  const { flexibilityPercentage = 15, skipCategories = [], strictMode = false } = options;
  
  // Get word count for analysis
  const wordCount = content.trim().split(/\s+/).length;
  
  // Analyze each category
  const keywordResult = skipCategories.includes('keyword') 
    ? createEmptyKeywordResult() 
    : analyzeKeywordCompliance(content, state, flexibilityPercentage);
    
  const serpResult = skipCategories.includes('serp')
    ? createEmptySerpResult()
    : analyzeSerpCompliance(content, state, flexibilityPercentage);
    
  const solutionResult = skipCategories.includes('solution')
    ? createEmptySolutionResult()
    : analyzeSolutionCompliance(content, state, flexibilityPercentage, wordCount);
    
  const structureResult = skipCategories.includes('structure')
    ? createEmptyStructureResult()
    : analyzeStructureCompliance(content, state, flexibilityPercentage);

  // Calculate overall score (weighted average)
  const weights = { keyword: 0.3, serp: 0.25, solution: 0.25, structure: 0.2 };
  const overallScore = Math.round(
    keywordResult.score * weights.keyword +
    serpResult.score * weights.serp +
    solutionResult.score * weights.solution +
    structureResult.score * weights.structure
  );

  // Collect all violations
  const allViolations = [
    ...keywordResult.violations,
    ...serpResult.violations,
    ...solutionResult.violations,
    ...structureResult.violations
  ];

  const criticalViolations = allViolations.filter(v => v.severity === 'critical').length;

  return {
    overall: {
      score: overallScore,
      compliant: overallScore >= 70,
      totalViolations: allViolations.length,
      criticalViolations
    },
    keyword: keywordResult,
    serp: serpResult,
    solution: solutionResult,
    structure: structureResult,
    violations: allViolations,
    suggestions: generateComplianceSuggestions(allViolations)
  };
};

/**
 * Analyze keyword compliance
 */
const analyzeKeywordCompliance = (
  content: string,
  state: ContentBuilderState,
  flexibility: number
): KeywordComplianceResult => {
  const violations: ComplianceViolation[] = [];
  const contentLower = content.toLowerCase();
  const words = contentLower.split(/\s+/);
  const wordCount = words.length;

  // Main keyword analysis with word boundaries
  const mainKeyword = state.mainKeyword.toLowerCase();
  const escapedKeyword = mainKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const keywordRegex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi');
  const mainKeywordCount = (contentLower.match(keywordRegex) || []).length;
  const mainKeywordDensity = wordCount > 0 ? (mainKeywordCount / wordCount) * 100 : 0;
  
  // Target density with flexibility
  const targetMin = 0.8 * (1 - flexibility / 100);
  const targetMax = 1.2 * (1 + flexibility / 100);
  const densityCompliant = mainKeywordDensity >= targetMin && mainKeywordDensity <= targetMax;

  if (!densityCompliant) {
    violations.push({
      id: 'keyword-density',
      category: 'keyword',
      severity: mainKeywordDensity < targetMin ? 'critical' : 'warning',
      message: `Main keyword density is ${mainKeywordDensity.toFixed(2)}% (target: ${targetMin.toFixed(1)}-${targetMax.toFixed(1)}%)`,
      suggestion: mainKeywordDensity < targetMin 
        ? 'Add more mentions of your main keyword naturally throughout the content'
        : 'Reduce keyword mentions to avoid over-optimization'
    });
  }

  // Keyword placement analysis
  const firstParagraph = content.substring(0, Math.min(content.length, 600));
  const lastParagraph = content.substring(Math.max(0, content.length - 600));
  const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
  const h1Content = headings.find(h => h.startsWith('# '))?.toLowerCase() || '';

  const inH1 = h1Content.includes(mainKeyword);
  const inIntro = firstParagraph.toLowerCase().includes(mainKeyword);
  const inConclusion = lastParagraph.toLowerCase().includes(mainKeyword);

  if (!inH1) {
    violations.push({
      id: 'keyword-h1',
      category: 'keyword',
      severity: 'critical',
      message: 'Main keyword not found in H1 heading',
      suggestion: 'Include your main keyword in the main heading (H1)'
    });
  }

  if (!inIntro) {
    violations.push({
      id: 'keyword-intro',
      category: 'keyword',
      severity: 'warning',
      message: 'Main keyword not found in introduction',
      suggestion: 'Include your main keyword in the first paragraph'
    });
  }

  if (!inConclusion) {
    violations.push({
      id: 'keyword-conclusion',
      category: 'keyword',
      severity: 'minor',
      message: 'Main keyword not found in conclusion',
      suggestion: 'Include your main keyword in the concluding section'
    });
  }

  // Secondary keywords coverage with word boundaries
  const secondaryKeywords = state.selectedKeywords;
  const coveredSecondary = secondaryKeywords.filter(keyword => {
    const escaped = keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    return regex.test(contentLower);
  }).length;
  
  const secondaryCoveragePercentage = secondaryKeywords.length > 0 
    ? (coveredSecondary / secondaryKeywords.length) * 100 
    : 100;
  
  const secondaryTarget = 80 * (1 - flexibility / 100);
  const secondaryCompliant = secondaryCoveragePercentage >= secondaryTarget;

  if (!secondaryCompliant) {
    violations.push({
      id: 'secondary-keywords',
      category: 'keyword',
      severity: 'warning',
      message: `Only ${coveredSecondary}/${secondaryKeywords.length} secondary keywords used (${secondaryCoveragePercentage.toFixed(0)}%)`,
      suggestion: 'Include more of your selected secondary keywords naturally in the content'
    });
  }

  // Calculate keyword score
  const keywordScore = Math.round(
    (densityCompliant ? 25 : 0) +
    (inH1 ? 25 : 0) +
    (inIntro ? 15 : 0) +
    (inConclusion ? 10 : 0) +
    (secondaryCompliant ? 25 : secondaryCoveragePercentage / 4)
  );

  return {
    mainKeywordDensity: {
      current: mainKeywordDensity,
      target: { min: targetMin, max: targetMax },
      compliant: densityCompliant
    },
    mainKeywordPlacement: {
      inH1,
      inIntro,
      inConclusion,
      compliant: inH1 && inIntro
    },
    keywordVariations: calculateKeywordVariations(contentLower, mainKeyword, mainKeywordCount),
    secondaryKeywordsCoverage: {
      covered: coveredSecondary,
      total: secondaryKeywords.length,
      percentage: secondaryCoveragePercentage,
      target: secondaryTarget,
      compliant: secondaryCompliant
    },
    score: keywordScore,
    violations
  };
};

/**
 * Analyze SERP compliance
 */
const analyzeSerpCompliance = (
  content: string,
  state: ContentBuilderState,
  flexibility: number
): SerpComplianceResult => {
  const violations: ComplianceViolation[] = [];
  const contentLower = content.toLowerCase();
  
  // Get selected SERP items
  const selectedSerpItems = state.serpSelections.filter(item => item.selected);
  
  if (selectedSerpItems.length === 0) {
    return {
      headingsCoverage: { covered: 0, total: 0, percentage: 100, target: 70, compliant: true },
      contentGaps: { addressed: 0, total: 0, percentage: 100, compliant: true },
      paaQuestions: { answered: 0, total: 0, percentage: 100, target: 80, compliant: true },
      relatedTerms: { used: 0, total: 0, percentage: 100, target: 70, compliant: true },
      score: 100,
      violations: []
    };
  }

  // Analyze headings coverage with semantic matching
  const headingItems = selectedSerpItems.filter(item => item.type === 'heading');
  const coveredHeadings = headingItems.filter(item => {
    const serpHeading = item.content.toLowerCase();
    const serpWords = serpHeading.split(/\s+/).filter(w => w.length > 3);
    // Check if majority of key words from SERP heading appear in content
    const matchCount = serpWords.filter(word => contentLower.includes(word)).length;
    return matchCount >= Math.ceil(serpWords.length * 0.6);
  }).length;
  
  const headingsCoveragePercentage = headingItems.length > 0 
    ? (coveredHeadings / headingItems.length) * 100 
    : 100;
  
  const headingsTarget = 70 * (1 - flexibility / 100);
  const headingsCompliant = headingsCoveragePercentage >= headingsTarget;

  if (!headingsCompliant) {
    violations.push({
      id: 'serp-headings',
      category: 'serp',
      severity: 'warning',
      message: `Only ${coveredHeadings}/${headingItems.length} selected headings covered (${headingsCoveragePercentage.toFixed(0)}%)`,
      suggestion: 'Include more of the headings you selected from SERP analysis'
    });
  }

  // Analyze PAA questions
  const paaItems = selectedSerpItems.filter(item => item.type === 'paa');
  const answeredPaa = paaItems.filter(item => {
    const question = item.content.toLowerCase();
    // Simple check if question keywords appear in content
    const questionWords = question.split(/\s+/).filter(word => word.length > 3);
    return questionWords.some(word => contentLower.includes(word));
  }).length;
  
  const paaPercentage = paaItems.length > 0 ? (answeredPaa / paaItems.length) * 100 : 100;
  const paaTarget = 80 * (1 - flexibility / 100);
  const paaCompliant = paaPercentage >= paaTarget;

  if (!paaCompliant) {
    violations.push({
      id: 'serp-paa',
      category: 'serp',
      severity: 'warning',
      message: `Only ${answeredPaa}/${paaItems.length} PAA questions addressed (${paaPercentage.toFixed(0)}%)`,
      suggestion: 'Answer more of the People Also Ask questions you selected'
    });
  }

  // Calculate SERP score
  const serpScore = Math.round(
    (headingsCompliant ? 50 : headingsCoveragePercentage / 2) +
    (paaCompliant ? 50 : paaPercentage / 2)
  );

  return {
    headingsCoverage: {
      covered: coveredHeadings,
      total: headingItems.length,
      percentage: headingsCoveragePercentage,
      target: headingsTarget,
      compliant: headingsCompliant
    },
    contentGaps: { addressed: 0, total: 0, percentage: 100, compliant: true },
    paaQuestions: {
      answered: answeredPaa,
      total: paaItems.length,
      percentage: paaPercentage,
      target: paaTarget,
      compliant: paaCompliant
    },
    relatedTerms: { used: 0, total: 0, percentage: 100, target: 70, compliant: true },
    score: serpScore,
    violations
  };
};

/**
 * Analyze solution compliance
 */
const analyzeSolutionCompliance = (
  content: string,
  state: ContentBuilderState,
  flexibility: number,
  wordCount: number
): SolutionComplianceResult => {
  const violations: ComplianceViolation[] = [];
  
  if (!state.selectedSolution) {
    return {
      mentionFrequency: { mentions: 0, wordsPerThousand: 0, target: { min: 0, max: 0 }, compliant: true },
      featurePainMapping: { triads: 0, target: 0, compliant: true },
      naturalness: { forcedMentions: 0, totalMentions: 0, percentage: 0, target: 40, compliant: true },
      ctaPresence: { present: false, inFinalSection: false, compliant: true },
      score: 100,
      violations: []
    };
  }

  const solution = state.selectedSolution;
  const contentLower = content.toLowerCase();
  
  // Count solution mentions
  const solutionName = solution.name.toLowerCase();
  const mentions = (contentLower.match(new RegExp(solutionName, 'g')) || []).length;
  const mentionsPerThousand = wordCount > 0 ? (mentions / wordCount) * 1000 : 0;
  
  const targetMin = 2 * (1 - flexibility / 100);
  const targetMax = 4 * (1 + flexibility / 100);
  const mentionCompliant = mentionsPerThousand >= targetMin && mentionsPerThousand <= targetMax;

  if (!mentionCompliant) {
    violations.push({
      id: 'solution-mentions',
      category: 'solution',
      severity: mentionsPerThousand < targetMin ? 'warning' : 'minor',
      message: `Solution mentioned ${mentions} times (${mentionsPerThousand.toFixed(1)} per 1000 words, target: ${targetMin.toFixed(1)}-${targetMax.toFixed(1)})`,
      suggestion: mentionsPerThousand < targetMin 
        ? 'Mention your solution more frequently throughout the content'
        : 'Reduce solution mentions to maintain natural flow'
    });
  }

  // Check for CTA presence with enhanced pattern matching
  const lastSection = content.substring(Math.max(0, content.length - Math.floor(content.length * 0.15)));
  const ctaPatterns = [
    /\b(try|start|get started|sign up|join|register)\b/i,
    /\b(download|learn more|contact|book|schedule|request)\b/i,
    /\b(buy now|order|purchase|shop)\b/i,
    /\b(unlock|discover|explore|see how)\b/i,
    /\b(get access|claim|upgrade|view plans)\b/i,
    /\[.*?\]\(.*?\)/ // Markdown links
  ];
  const ctaPresent = ctaPatterns.some(pattern => pattern.test(lastSection));

  if (!ctaPresent) {
    violations.push({
      id: 'solution-cta',
      category: 'solution',
      severity: 'warning',
      message: 'No clear call-to-action found in the final section',
      suggestion: 'Add a call-to-action in the conclusion to guide readers to your solution'
    });
  }

  // Calculate solution score
  const solutionScore = Math.round(
    (mentionCompliant ? 50 : 25) +
    (ctaPresent ? 50 : 25)
  );

  return {
    mentionFrequency: {
      mentions,
      wordsPerThousand: mentionsPerThousand,
      target: { min: targetMin, max: targetMax },
      compliant: mentionCompliant
    },
    featurePainMapping: calculateFeaturePainMapping(content, solution),
    naturalness: { forcedMentions: 0, totalMentions: mentions, percentage: 0, target: 40, compliant: true },
    ctaPresence: { present: ctaPresent, inFinalSection: ctaPresent, compliant: ctaPresent },
    score: solutionScore,
    violations
  };
};

/**
 * Analyze structure compliance
 */
const analyzeStructureCompliance = (
  content: string,
  state: ContentBuilderState,
  flexibility: number
): StructureComplianceResult => {
  const violations: ComplianceViolation[] = [];
  
  // Analyze outline match
  const outlineSections = state.outlineSections || [];
  const matchedSections = outlineSections.filter(section => {
    const sectionTitle = section.title.toLowerCase();
    return content.toLowerCase().includes(sectionTitle.substring(0, 30));
  }).length;
  
  const outlineMatchPercentage = outlineSections.length > 0 
    ? (matchedSections / outlineSections.length) * 100 
    : 100;
  
  const outlineTarget = 85 * (1 - flexibility / 100);
  const outlineCompliant = outlineMatchPercentage >= outlineTarget;

  if (!outlineCompliant) {
    violations.push({
      id: 'structure-outline',
      category: 'structure',
      severity: 'warning',
      message: `Content matches ${matchedSections}/${outlineSections.length} outline sections (${outlineMatchPercentage.toFixed(0)}%)`,
      suggestion: 'Ensure your content follows the approved outline structure'
    });
  }

  // Analyze heading hierarchy
  const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
  const headingLevels = headings.map(h => h.match(/^#+/)?.[0].length || 0);
  
  let hierarchyProper = true;
  const hierarchyIssues: string[] = [];
  
  // Check for proper H1 usage
  const h1Count = headingLevels.filter(level => level === 1).length;
  if (h1Count !== 1) {
    hierarchyProper = false;
    hierarchyIssues.push(`Found ${h1Count} H1 headings (should be exactly 1)`);
  }

  // Check for level skipping
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] > headingLevels[i-1] + 1) {
      hierarchyProper = false;
      hierarchyIssues.push('Heading levels skip (e.g., H1 directly to H3)');
      break;
    }
  }

  if (!hierarchyProper) {
    violations.push({
      id: 'structure-hierarchy',
      category: 'structure',
      severity: 'minor',
      message: 'Heading hierarchy issues detected',
      suggestion: 'Fix heading structure: use one H1, then H2s, then H3s in proper order'
    });
  }

  // Basic readability analysis
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.length > 0);
  const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
  
  const fleschScore = estimateFleschScore(content);
  const fleschTarget = 50 * (1 - flexibility / 100);
  const readabilityCompliant = fleschScore >= fleschTarget;

  if (!readabilityCompliant) {
    violations.push({
      id: 'structure-readability',
      category: 'structure',
      severity: 'minor',
      message: `Readability score: ${fleschScore.toFixed(0)} (target: ≥${fleschTarget.toFixed(0)})`,
      suggestion: 'Simplify sentences and use more common words to improve readability'
    });
  }

  const sentenceLengthTarget = 22 * (1 + flexibility / 100);
  const sentenceLengthCompliant = avgWordsPerSentence <= sentenceLengthTarget;

  if (!sentenceLengthCompliant) {
    violations.push({
      id: 'structure-sentence-length',
      category: 'structure',
      severity: 'minor',
      message: `Average sentence length: ${avgWordsPerSentence.toFixed(1)} words (target: ≤${sentenceLengthTarget.toFixed(0)})`,
      suggestion: 'Break up long sentences for better readability'
    });
  }

  // Calculate structure score
  const structureScore = Math.round(
    (outlineCompliant ? 30 : outlineMatchPercentage * 0.3) +
    (hierarchyProper ? 25 : 15) +
    (readabilityCompliant ? 25 : Math.max(0, fleschScore / 2)) +
    (sentenceLengthCompliant ? 20 : 10)
  );

  return {
    outlineMatch: {
      matched: matchedSections,
      total: outlineSections.length,
      percentage: outlineMatchPercentage,
      target: outlineTarget,
      compliant: outlineCompliant
    },
    headingHierarchy: {
      proper: hierarchyProper,
      issues: hierarchyIssues,
      compliant: hierarchyProper
    },
    readability: {
      fleschScore,
      target: fleschTarget,
      compliant: readabilityCompliant
    },
    sentenceLength: {
      average: avgWordsPerSentence,
      target: sentenceLengthTarget,
      compliant: sentenceLengthCompliant
    },
    score: structureScore,
    violations
  };
};

/**
 * Generate compliance suggestions from violations
 */
const generateComplianceSuggestions = (violations: ComplianceViolation[]): string[] => {
  const suggestions = violations.map(v => v.suggestion);
  return Array.from(new Set(suggestions)); // Remove duplicates
};

/**
 * Estimate Flesch Reading Ease score
 */
const estimateFleschScore = (content: string): number => {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((total, word) => total + countSyllables(word), 0);
  
  if (sentences.length === 0 || words.length === 0) return 0;
  
  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  
  return Math.max(0, 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord));
};

/**
 * Count syllables in a word (simplified)
 */
const countSyllables = (word: string): number => {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  
  const vowels = word.match(/[aeiouy]/g);
  const vowelCount = vowels ? vowels.length : 0;
  
  // Adjust for silent e
  if (word.endsWith('e') && vowelCount > 1) {
    return Math.max(1, vowelCount - 1);
  }
  
  return Math.max(1, vowelCount);
};

/**
 * Calculate keyword variation percentage
 * Detects plurals, stems, and common variations of the main keyword
 */
const calculateKeywordVariations = (
  contentLower: string,
  mainKeyword: string,
  exactMatchCount: number
): { variationPercentage: number; target: number; compliant: boolean } => {
  // Generate variations of the keyword
  const variations = generateKeywordVariations(mainKeyword);
  
  let variationCount = 0;
  for (const variation of variations) {
    if (variation !== mainKeyword) {
      const variationRegex = new RegExp(`\\b${variation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = contentLower.match(variationRegex);
      if (matches) {
        variationCount += matches.length;
      }
    }
  }
  
  const totalMentions = exactMatchCount + variationCount;
  const variationPercentage = totalMentions > 0 ? (variationCount / totalMentions) * 100 : 0;
  const target = 30; // 30% of mentions should be variations
  
  return {
    variationPercentage: Math.round(variationPercentage * 10) / 10,
    target,
    compliant: variationPercentage >= target * 0.85 // 15% flexibility
  };
};

/**
 * Generate common variations of a keyword (plurals, stems, word order)
 */
const generateKeywordVariations = (keyword: string): string[] => {
  const words = keyword.toLowerCase().split(/\s+/);
  const variations = new Set<string>();
  
  // Add original
  variations.add(keyword.toLowerCase());
  
  // Generate singular/plural forms for each word
  words.forEach((word, index) => {
    const pluralized = pluralize(word);
    const singularized = singularize(word);
    
    // Create variations with pluralized/singularized words
    if (pluralized !== word) {
      const newWords = [...words];
      newWords[index] = pluralized;
      variations.add(newWords.join(' '));
    }
    if (singularized !== word) {
      const newWords = [...words];
      newWords[index] = singularized;
      variations.add(newWords.join(' '));
    }
  });
  
  // Add word order variants for multi-word keywords
  if (words.length === 2) {
    variations.add(`${words[1]} ${words[0]}`);
  }
  
  // Add common prefix/suffix variations
  const commonSuffixes = ['ing', 'ed', 's', 'es', 'er', 'est'];
  const mainWord = words[words.length - 1];
  commonSuffixes.forEach(suffix => {
    if (mainWord.endsWith(suffix)) {
      const stem = mainWord.slice(0, -suffix.length);
      if (stem.length > 2) {
        const newWords = [...words];
        newWords[newWords.length - 1] = stem;
        variations.add(newWords.join(' '));
      }
    } else {
      // Try adding suffix
      const newWords = [...words];
      newWords[newWords.length - 1] = mainWord + suffix;
      variations.add(newWords.join(' '));
    }
  });
  
  return Array.from(variations);
};

/**
 * Simple pluralization
 */
const pluralize = (word: string): string => {
  if (word.endsWith('s') || word.endsWith('x') || word.endsWith('z') || 
      word.endsWith('ch') || word.endsWith('sh')) {
    return word + 'es';
  }
  if (word.endsWith('y') && !/[aeiou]y$/.test(word)) {
    return word.slice(0, -1) + 'ies';
  }
  return word + 's';
};

/**
 * Simple singularization
 */
const singularize = (word: string): string => {
  if (word.endsWith('ies') && word.length > 4) {
    return word.slice(0, -3) + 'y';
  }
  if (word.endsWith('es') && (word.endsWith('sses') || word.endsWith('xes') || 
      word.endsWith('zes') || word.endsWith('ches') || word.endsWith('shes'))) {
    return word.slice(0, -2);
  }
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 2) {
    return word.slice(0, -1);
  }
  return word;
};

/**
 * Calculate feature-pain-benefit triads in content
 * Identifies patterns where content connects a pain point to a feature to a benefit
 */
const calculateFeaturePainMapping = (
  content: string,
  solution: { name: string; features?: string[]; benefits?: string[]; painPoints?: string[] }
): { triads: number; target: number; compliant: boolean } => {
  const contentLower = content.toLowerCase();
  
  // Define pain point indicators
  const painIndicators = [
    'struggle', 'problem', 'challenge', 'difficult', 'frustrat', 'pain', 'issue',
    'waste time', 'inefficient', 'costly', 'expensive', 'manual', 'tedious',
    'confus', 'overwhelm', 'stress', 'complic', 'slow', 'error', 'mistake'
  ];
  
  // Define solution/benefit indicators
  const solutionIndicators = [
    'solve', 'solution', 'help', 'enable', 'allow', 'make it easy', 'simplif',
    'automat', 'streamline', 'save time', 'save money', 'reduc', 'improv',
    'faster', 'better', 'efficient', 'effective', solution.name.toLowerCase()
  ];
  
  // Add solution features if available
  const features = (solution.features || []).map(f => f.toLowerCase().substring(0, 20));
  
  // Count triads by finding sentences that contain both pain and solution indicators
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  let triadCount = 0;
  
  sentences.forEach(sentence => {
    const sentenceLower = sentence.toLowerCase();
    
    const hasPain = painIndicators.some(pain => sentenceLower.includes(pain));
    const hasSolution = solutionIndicators.some(sol => sentenceLower.includes(sol)) ||
                        features.some(f => sentenceLower.includes(f));
    
    // A triad is when a sentence (or adjacent sentences) connect pain to solution
    if (hasPain && hasSolution) {
      triadCount++;
    }
  });
  
  // Also check for paragraph-level triads (pain in one sentence, solution in next)
  for (let i = 0; i < sentences.length - 1; i++) {
    const currentLower = sentences[i].toLowerCase();
    const nextLower = sentences[i + 1].toLowerCase();
    
    const currentHasPain = painIndicators.some(pain => currentLower.includes(pain));
    const nextHasSolution = solutionIndicators.some(sol => nextLower.includes(sol)) ||
                           features.some(f => nextLower.includes(f));
    
    if (currentHasPain && nextHasSolution) {
      triadCount++;
    }
  }
  
  // Deduplicate overlapping detections
  triadCount = Math.ceil(triadCount / 1.5);
  
  const target = 3; // Target 3 feature-pain mappings per article
  
  return {
    triads: triadCount,
    target,
    compliant: triadCount >= target
  };
};

// Empty result creators for skipped categories
const createEmptyKeywordResult = (): KeywordComplianceResult => ({
  mainKeywordDensity: { current: 0, target: { min: 0, max: 0 }, compliant: true },
  mainKeywordPlacement: { inH1: true, inIntro: true, inConclusion: true, compliant: true },
  keywordVariations: { variationPercentage: 100, target: 30, compliant: true },
  secondaryKeywordsCoverage: { covered: 0, total: 0, percentage: 100, target: 80, compliant: true },
  score: 100,
  violations: []
});

const createEmptySerpResult = (): SerpComplianceResult => ({
  headingsCoverage: { covered: 0, total: 0, percentage: 100, target: 70, compliant: true },
  contentGaps: { addressed: 0, total: 0, percentage: 100, compliant: true },
  paaQuestions: { answered: 0, total: 0, percentage: 100, target: 80, compliant: true },
  relatedTerms: { used: 0, total: 0, percentage: 100, target: 70, compliant: true },
  score: 100,
  violations: []
});

const createEmptySolutionResult = (): SolutionComplianceResult => ({
  mentionFrequency: { mentions: 0, wordsPerThousand: 0, target: { min: 0, max: 0 }, compliant: true },
  featurePainMapping: { triads: 0, target: 0, compliant: true },
  naturalness: { forcedMentions: 0, totalMentions: 0, percentage: 0, target: 40, compliant: true },
  ctaPresence: { present: true, inFinalSection: true, compliant: true },
  score: 100,
  violations: []
});

const createEmptyStructureResult = (): StructureComplianceResult => ({
  outlineMatch: { matched: 0, total: 0, percentage: 100, target: 85, compliant: true },
  headingHierarchy: { proper: true, issues: [], compliant: true },
  readability: { fleschScore: 60, target: 50, compliant: true },
  sentenceLength: { average: 15, target: 22, compliant: true },
  score: 100,
  violations: []
});