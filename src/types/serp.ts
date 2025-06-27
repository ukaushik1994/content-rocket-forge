export interface SerpSearchParams {
  query: string;
  country?: string;
  num?: number;
}

export interface KnowledgeGraph {
  title: string;
  type: string;
  description: string;
  attributes: Record<string, any>;
  relatedEntities: Array<{
    name: string;
    link?: string;
  }>;
}

export interface FeaturedSnippet {
  type: 'paragraph' | 'list' | 'table' | 'dictionary_results';
  content: string;
  source: string;
  title: string;
  metadata?: {
    word_type?: string;
    syllables?: string;
    definitions?: string[];
    examples?: string[];
    pronunciation_audio?: string;
  };
}

export interface PeopleAlsoAskQuestion {
  question: string;
  source: string;
  answer?: string;
  metadata?: {
    source_link?: string;
    snippet?: string;
    position?: number;
  };
}

export interface LocalResult {
  name: string;
  address: string;
  rating: number;
  reviews: number;
  type: string;
}

export interface MultimediaOpportunity {
  type: 'images' | 'videos';
  count: number;
  suggestions: Array<{
    title: string;
    source: string;
  }>;
}

export interface CommercialSignals {
  hasShoppingResults: boolean;
  hasAds: boolean;
  commercialIntent: 'high' | 'medium' | 'low' | 'unknown';
}

export interface VolumeMetadata {
  source: 'google_keyword_planner' | 'google_search_results_estimate' | 'mock_google_estimate' | 'serpstack_estimate';
  confidence: 'high' | 'medium' | 'low';
  engine: 'google' | 'bing' | 'yahoo' | 'mixed';
  location?: string;
  language?: string;
  lastUpdated: string;
}

export interface CompetitionMetadata {
  source: 'google_ads_competition' | 'google_results_estimate' | 'serpstack_estimate' | 'mock_google_estimate';
  engine: 'google' | 'bing' | 'yahoo' | 'mixed';
  adsCompetition?: 'LOW' | 'MEDIUM' | 'HIGH' | 'ESTIMATED';
}

export interface SerpAnalysisResult {
  keyword: string;
  searchVolume?: number;
  competitionScore?: number;
  keywordDifficulty?: number;
  entities?: Array<{
    name: string;
    type: string;
    description?: string;
    source?: string;
  }>;
  peopleAlsoAsk?: Array<{
    question: string;
    answer?: string;
    source?: string;
    position?: number;
  }>;
  headings?: Array<{
    text: string;
    level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  }>;
  contentGaps?: Array<{
    topic: string;
    description: string;
    recommendation: string;
    content: string;
    source: string;
  }>;
  topResults?: Array<{
    title: string;
    link: string;
    snippet: string;
    position: number;
    source?: string;
  }>;
  relatedSearches?: Array<{
    query: string;
    source?: string;
  }>;
  keywords?: string[];
  recommendations?: string[];
  featuredSnippets?: Array<{
    title: string;
    content: string;
    source: string;
    type?: string;
  }>;
  isMockData?: boolean;
  isGoogleData?: boolean;
  dataQuality?: 'high' | 'medium' | 'low';
  volumeMetadata?: VolumeMetadata;
  competitionMetadata?: CompetitionMetadata;
}
