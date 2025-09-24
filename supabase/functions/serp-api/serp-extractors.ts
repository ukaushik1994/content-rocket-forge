/**
 * Advanced SERP data extractors for comprehensive content opportunities
 */

/**
 * Generate smart headings from multiple SERP sources
 */
export function generateSmartHeadings(organicResults: any[], peopleAlsoAsk: any[], data: any): any[] {
  const headings = [];
  
  // Extract from featured snippet structure
  if (data.featured_snippet?.snippet) {
    const snippet = data.featured_snippet.snippet;
    // Look for structured content patterns
    const listItems = snippet.match(/(?:^|\n)\d+\.\s+([^\n]+)/g);
    if (listItems) {
      listItems.slice(0, 3).forEach((item: string) => {
        const heading = item.replace(/^\d+\.\s+/, '').trim();
        headings.push({
          text: heading,
          level: 'h2' as const,
          source: 'featured_snippet',
          type: 'structured_content'
        });
      });
    }
  }
  
  // Extract from organic result titles (strategic selection)
  organicResults.slice(0, 6).forEach((result: any, index: number) => {
    headings.push({
      text: result.title,
      level: index === 0 ? 'h1' as const : 'h2' as const,
      subtext: result.snippet,
      type: 'organic_heading',
      source: 'organic_results'
    });
  });
  
  // Extract from People Also Ask (convert questions to headings)
  peopleAlsoAsk.slice(0, 4).forEach((item: any) => {
    const heading = convertQuestionToHeading(item.question);
    headings.push({
      text: heading,
      level: 'h3' as const,
      source: 'people_also_ask',
      type: 'question_based',
      original_question: item.question
    });
  });
  
  // Extract from knowledge graph if available
  if (data.knowledge_graph?.title) {
    headings.push({
      text: `Understanding ${data.knowledge_graph.title}`,
      level: 'h2' as const,
      source: 'knowledge_graph',
      type: 'knowledge_entity'
    });
  }
  
  return headings.slice(0, 12);
}

/**
 * Convert question to heading format
 */
function convertQuestionToHeading(question: string): string {
  return question
    .replace(/^(what|how|why|when|where|which|who)\s+/i, '')
    .replace(/\?$/, '')
    .replace(/^(is|are|do|does|can|will|would|should)\s+/i, '')
    .trim()
    .replace(/^./, str => str.toUpperCase());
}

/**
 * Generate advanced content gaps with strategic insights
 */
export function generateAdvancedContentGaps(organicResults: any[], peopleAlsoAsk: any[], data: any, keyword: string): any[] {
  const gaps = [];
  const topTitles = organicResults.map(r => r.title.toLowerCase());
  const topSnippets = organicResults.map(r => r.snippet?.toLowerCase() || '').join(' ');
  
  // Analyze content type gaps
  const contentTypeAnalysis = analyzeContentTypes(topTitles, topSnippets);
  
  if (!contentTypeAnalysis.hasHowTo) {
    gaps.push({
      topic: `How to ${keyword}`,
      description: `Step-by-step guides are missing from top results`,
      recommendation: `Create a comprehensive how-to guide for ${keyword}`,
      opportunity: `High - Users searching for practical implementation`,
      content: `Step-by-step ${keyword} guide`,
      source: 'content_type_analysis'
    });
  }
  
  if (!contentTypeAnalysis.hasComparison) {
    gaps.push({
      topic: `${keyword} comparison`,
      description: `Comparative analysis content is lacking`,
      recommendation: `Develop comparison guides for different ${keyword} approaches`,
      opportunity: `Medium-High - Comparison content performs well`,
      content: `${keyword} comparison and alternatives`,
      source: 'content_type_analysis'
    });
  }
  
  if (!contentTypeAnalysis.hasCaseStudy) {
    gaps.push({
      topic: `${keyword} case studies`,
      description: `Real-world examples and case studies are missing`,
      recommendation: `Include detailed case studies and success stories`,
      opportunity: `High - Case studies build trust and authority`,
      content: `${keyword} case studies and examples`,
      source: 'content_type_analysis'
    });
  }
  
  if (!contentTypeAnalysis.hasBeginner) {
    gaps.push({
      topic: `${keyword} for beginners`,
      description: `Beginner-friendly content is underrepresented`,
      recommendation: `Create comprehensive beginner guides`,
      opportunity: `High - Large audience segment`,
      content: `Beginner's guide to ${keyword}`,
      source: 'content_type_analysis'
    });
  }
  
  // Analyze question gaps from PAA
  const questionGaps = analyzeQuestionGaps(peopleAlsoAsk, topSnippets, keyword);
  gaps.push(...questionGaps);
  
  // Analyze SERP feature gaps
  const featureGaps = analyzeSerpFeatureGaps(data, keyword);
  gaps.push(...featureGaps);
  
  return gaps.slice(0, 8);
}

/**
 * Analyze content types present in top results
 */
function analyzeContentTypes(titles: string[], snippetText: string): {
  hasHowTo: boolean;
  hasComparison: boolean;
  hasCaseStudy: boolean;
  hasBeginner: boolean;
  hasAdvanced: boolean;
  hasList: boolean;
  hasGuide: boolean;
} {
  const allText = titles.join(' ') + ' ' + snippetText;
  
  return {
    hasHowTo: /how\s+to|step\s+by\s+step|tutorial|instructions/i.test(allText),
    hasComparison: /vs|versus|compare|comparison|alternative/i.test(allText),
    hasCaseStudy: /case\s+study|example|success\s+story|real\s+world/i.test(allText),
    hasBeginner: /beginner|start|introduction|basic|learn/i.test(allText),
    hasAdvanced: /advanced|expert|professional|complex|in-depth/i.test(allText),
    hasList: /list|top\s+\d+|best|worst|\d+\s+ways/i.test(allText),
    hasGuide: /guide|handbook|manual|complete/i.test(allText)
  };
}

/**
 * Analyze gaps in question coverage
 */
function analyzeQuestionGaps(peopleAlsoAsk: any[], snippetText: string, keyword: string): any[] {
  const gaps: Array<{type: string; opportunity: string; priority: number; topic?: string; description?: string; recommendation?: string; content?: string; source?: string}> = [];
  const coveredTopics = new Set();
  
  // Extract topics from existing PAA questions
  peopleAlsoAsk.forEach(item => {
    const topics = extractTopicsFromQuestion(item.question);
    topics.forEach(topic => coveredTopics.add(topic));
  });
  
  // Common question patterns not covered
  const commonQuestions = [
    { pattern: 'cost', question: `How much does ${keyword} cost?` },
    { pattern: 'time', question: `How long does ${keyword} take?` },
    { pattern: 'benefits', question: `What are the benefits of ${keyword}?` },
    { pattern: 'risks', question: `What are the risks of ${keyword}?` },
    { pattern: 'alternatives', question: `What are alternatives to ${keyword}?` },
    { pattern: 'tools', question: `What tools are needed for ${keyword}?` }
  ];
  
  commonQuestions.forEach(({ pattern, question }) => {
    if (!coveredTopics.has(pattern) && !snippetText.includes(pattern)) {
      gaps.push({
        type: 'question_gap',
        priority: 2,
        topic: question,
        description: `Common question about ${pattern} not addressed`,
        recommendation: `Address the ${pattern} aspect of ${keyword}`,
        opportunity: `Medium - Fills common information gap`,
        content: question,
        source: 'question_gap_analysis'
      });
    }
  });
  
  return gaps.slice(0, 3);
}

/**
 * Extract topics from questions
 */
function extractTopicsFromQuestion(question: string): string[] {
  const topicWords = ['cost', 'price', 'time', 'benefit', 'risk', 'tool', 'method', 'way', 'alternative'];
  return topicWords.filter(word => question.toLowerCase().includes(word));
}

/**
 * Analyze SERP feature gaps for opportunities
 */
function analyzeSerpFeatureGaps(data: any, keyword: string): any[] {
  const gaps = [];
  
  if (!data.featured_snippet) {
    gaps.push({
      topic: `Featured snippet opportunity`,
      description: `No featured snippet present - opportunity to capture position zero`,
      recommendation: `Structure content to target featured snippet with clear, concise answers`,
      opportunity: `Very High - Featured snippets get high CTR`,
      content: `Featured snippet targeting for ${keyword}`,
      source: 'serp_feature_analysis'
    });
  }
  
  if (!data.images_results || data.images_results.length < 3) {
    gaps.push({
      topic: `Visual content opportunity`,
      description: `Limited visual content in search results`,
      recommendation: `Create infographics, diagrams, and visual guides`,
      opportunity: `Medium - Visual content improves engagement`,
      content: `Visual content for ${keyword}`,
      source: 'serp_feature_analysis'
    });
  }
  
  if (!data.video_results || data.video_results.length < 2) {
    gaps.push({
      topic: `Video content opportunity`,
      description: `Minimal video content in search results`,
      recommendation: `Create tutorial videos and explanatory content`,
      opportunity: `High - Video content is highly engaging`,
      content: `Video content for ${keyword}`,
      source: 'serp_feature_analysis'
    });
  }
  
  return gaps;
}

/**
 * Extract comprehensive entities with relevance scoring
 */
export function extractComprehensiveEntities(data: any, keyword: string): any[] {
  const entities = [];
  
  // Primary keyword entity
  entities.push({
    name: keyword,
    type: 'primary_topic',
    importance: 10,
    description: `Main topic: ${keyword}`,
    source: 'primary_keyword'
  });
  
  // Knowledge graph entities
  if (data.knowledge_graph) {
    entities.push({
      name: data.knowledge_graph.title || '',
      type: 'knowledge_entity',
      importance: 9,
      description: data.knowledge_graph.description || '',
      source: 'knowledge_graph',
      attributes: data.knowledge_graph.attributes || {}
    });
    
    // Related entities from knowledge graph
    if (data.knowledge_graph.related_topics) {
      data.knowledge_graph.related_topics.slice(0, 3).forEach((topic: any) => {
        entities.push({
          name: topic.topic || topic.name || '',
          type: 'related_entity',
          importance: 6,
          description: `Related to ${data.knowledge_graph.title}`,
          source: 'knowledge_graph_related'
        });
      });
    }
  }
  
  // Entities from organic results
  const organicEntities = extractEntitiesFromOrganic(data.organic_results || [], keyword);
  entities.push(...organicEntities);
  
  // Entities from featured snippet
  if (data.featured_snippet?.snippet) {
    const snippetEntities = extractEntitiesFromText(data.featured_snippet.snippet, keyword, 'featured_snippet');
    entities.push(...snippetEntities);
  }
  
  return entities.slice(0, 15);
}

/**
 * Extract entities from organic results
 */
function extractEntitiesFromOrganic(organicResults: any[], keyword: string): any[] {
  const entities: Array<{type: string; name: string; relevance: number}> = [];
  
  organicResults.slice(0, 5).forEach((result: any) => {
    if (result.title) {
      const titleEntities = extractEntitiesFromText(result.title, keyword, 'organic_title');
      entities.push(...titleEntities);
    }
  });
  
  return entities;
}

/**
 * Extract entities from text with context
 */
function extractEntitiesFromText(text: string, keyword: string, source: string): any[] {
  const entities: Array<{type: string; name: string; relevance: number; importance?: number; description?: string; source?: string}> = [];
  const words = text.split(/\s+/)
    .filter(word => word.length > 4)
    .filter(word => !['the', 'and', 'but', 'for', 'are', 'this', 'that', 'with', 'from', 'have', 'been'].includes(word.toLowerCase()));
  
  const keywordLower = keyword.toLowerCase();
  const relevantWords = words.filter(word => 
    !word.toLowerCase().includes(keywordLower) && 
    !keywordLower.includes(word.toLowerCase())
  );
  
  relevantWords.slice(0, 3).forEach(word => {
    entities.push({
      name: word,
      type: 'text_entity',
      relevance: 0.8,
      importance: 4,
      description: `Entity from ${source}: ${word}`,
      source: source
    });
  });
  
  return entities;
}

/**
 * Extract featured snippets data
 */
export function extractFeaturedSnippets(data: any): any[] {
  const snippets = [];
  
  if (data.featured_snippet) {
    snippets.push({
      type: data.featured_snippet.type || 'paragraph',
      content: data.featured_snippet.snippet || '',
      source: data.featured_snippet.link || '',
      title: data.featured_snippet.title || '',
      displayed_link: data.featured_snippet.displayed_link || ''
    });
  }
  
  return snippets;
}

/**
 * Extract knowledge graph data
 */
export function extractKnowledgeGraph(data: any): any {
  if (!data.knowledge_graph) {
    return {};
  }
  
  return {
    title: data.knowledge_graph.title || '',
    type: data.knowledge_graph.type || '',
    description: data.knowledge_graph.description || '',
    attributes: data.knowledge_graph.attributes || {},
    relatedEntities: (data.knowledge_graph.related_topics || []).map((topic: any) => ({
      name: topic.topic || topic.name || '',
      link: topic.link || null
    }))
  };
}

/**
 * Extract top stories
 */
export function extractTopStories(data: any): any[] {
  if (!data.top_stories) return [];
  
  return data.top_stories.map((story: any) => ({
    title: story.title || '',
    source: story.source || '',
    date: story.date || '',
    url: story.link || '',
    thumbnail: story.thumbnail || null
  }));
}

/**
 * Extract multimedia content
 */
export function extractMultimedia(data: any): {
  images: any[];
  videos: any[];
} {
  const images = (data.images_results || []).slice(0, 8).map((img: any) => ({
    title: img.title || '',
    source: img.source || '',
    thumbnail: img.thumbnail || img.original || ''
  }));
  
  const videos = (data.video_results || []).slice(0, 6).map((video: any) => ({
    title: video.title || '',
    source: video.source || '',
    duration: video.duration || '',
    thumbnail: video.thumbnail || '',
    link: video.link || ''
  }));
  
  return { images, videos };
}

/**
 * Generate comprehensive SERP insights
 */
export function generateSerpInsights(data: any, organicResults: any[], peopleAlsoAsk: any[], keyword: string): string[] {
  const insights = [];
  
  // Competition analysis
  const highAuthDomains = organicResults.filter(result => {
    const domain = extractDomain(result.link);
    return isHighAuthorityDomain(domain);
  }).length;
  
  if (highAuthDomains > 5) {
    insights.push(`High competition detected - ${highAuthDomains} out of ${organicResults.length} results are from high-authority domains`);
  } else if (highAuthDomains < 3) {
    insights.push(`Opportunity detected - Only ${highAuthDomains} high-authority domains in top results`);
  }
  
  // SERP features analysis
  if (data.featured_snippet) {
    insights.push(`Featured snippet present - optimize for position zero with structured content`);
  } else {
    insights.push(`No featured snippet - opportunity to capture position zero with well-structured answers`);
  }
  
  if (data.people_also_ask && data.people_also_ask.length > 0) {
    insights.push(`${data.people_also_ask.length} People Also Ask questions found - rich FAQ content opportunity`);
  }
  
  // Content format insights
  const titleFormats = analyzeContentFormats(organicResults);
  if (titleFormats.listCount > 3) {
    insights.push(`List-format content dominates - consider numbered lists and structured guides`);
  }
  
  if (titleFormats.howToCount > 2) {
    insights.push(`How-to content performs well - tutorial and step-by-step formats recommended`);
  }
  
  // Commercial intent analysis
  if (data.ads && data.ads.length > 0) {
    insights.push(`${data.ads.length} ads present - indicates commercial intent and monetization potential`);
  }
  
  return insights.slice(0, 6);
}

/**
 * Analyze content formats in organic results
 */
function analyzeContentFormats(organicResults: any[]): {
  listCount: number;
  howToCount: number;
  guideCount: number;
} {
  const titles = organicResults.map(r => r.title.toLowerCase()).join(' ');
  
  return {
    listCount: (titles.match(/\d+|top|best|list/g) || []).length,
    howToCount: (titles.match(/how\s+to|tutorial|step/g) || []).length,
    guideCount: (titles.match(/guide|manual|complete/g) || []).length
  };
}

/**
 * Generate actionable recommendations
 */
export function generateRecommendations(data: any, organicResults: any[], contentGaps: any[]): string[] {
  const recommendations = [];
  
  // Content strategy recommendations
  if (contentGaps.length > 0) {
    recommendations.push(`Address ${contentGaps.length} identified content gaps to gain competitive advantage`);
  }
  
  // SERP feature targeting
  if (!data.featured_snippet) {
    recommendations.push(`Target featured snippet with concise, well-structured answers (40-60 words)`);
  }
  
  if (data.people_also_ask && data.people_also_ask.length > 0) {
    recommendations.push(`Create comprehensive FAQ section addressing ${data.people_also_ask.length} related questions`);
  }
  
  // Competition-based recommendations
  const avgSnippetLength = organicResults.reduce((sum, r) => sum + (r.snippet?.length || 0), 0) / organicResults.length;
  if (avgSnippetLength > 150) {
    recommendations.push(`Create in-depth content - competitors average ${Math.round(avgSnippetLength)} characters in descriptions`);
  }
  
  // Visual content recommendations
  if (!data.images_results || data.images_results.length < 3) {
    recommendations.push(`Add visual content - infographics and diagrams could help capture image search traffic`);
  }
  
  return recommendations.slice(0, 5);
}

/**
 * Extract domain from URL (utility function)
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

/**
 * Check if domain is high authority (utility function)
 */
function isHighAuthorityDomain(domain: string): boolean {
  const highAuthDomains = [
    'wikipedia.org', 'youtube.com', 'facebook.com', 'twitter.com', 'instagram.com',
    'linkedin.com', 'reddit.com', 'quora.com', 'amazon.com', 'apple.com',
    'microsoft.com', 'google.com', 'github.com', 'stackoverflow.com',
    'medium.com', 'forbes.com', 'cnn.com', 'bbc.com', 'nytimes.com'
  ];
  
  return highAuthDomains.includes(domain.toLowerCase());
}