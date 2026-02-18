import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  TrendingUp, 
  BarChart3, 
  Target, 
  Users, 
  Zap,
  RefreshCw,
  ChevronDown,
  Eye,
  Plus,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { analyzeKeywordSerp, searchRelatedKeywords } from '@/services/serpApiService';
import { researchKeyword, KeywordResearchResult } from '@/services/keywordResearchService';
import { SerpAnalysisResult } from '@/types/serp';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface KeywordResearchTabProps {
  searchTerm: string;
  className?: string;
}

interface KeywordMetrics {
  searchVolume: number;
  difficulty: number;
  competition: number;
  cpc?: number;
  intent?: string;
  trend?: 'rising' | 'stable' | 'declining';
}

interface RelatedKeyword {
  keyword: string;
  volume?: number;
  difficulty?: number;
  relevance: 'high' | 'medium' | 'low';
}

export const KeywordResearchTab: React.FC<KeywordResearchTabProps> = ({ 
  searchTerm, 
  className 
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [serpData, setSerpData] = useState<SerpAnalysisResult | null>(null);
  const [researchData, setResearchData] = useState<KeywordResearchResult | null>(null);
  const [relatedKeywords, setRelatedKeywords] = useState<RelatedKeyword[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<'serp' | 'serpstack'>('serp');
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    metrics: true,
    related: false,
    competitors: false,
    opportunities: false
  });

  useEffect(() => {
    if (searchTerm) {
      performKeywordAnalysis();
    }
  }, [searchTerm, selectedProvider]);

  const performKeywordAnalysis = async () => {
    if (!searchTerm.trim()) return;

    setIsAnalyzing(true);
    try {
      // Run parallel analysis
      const [serpResult, researchResult, relatedResult] = await Promise.all([
        analyzeKeywordSerp(searchTerm, false, selectedProvider),
        researchKeyword(searchTerm),
        searchRelatedKeywords(searchTerm, selectedProvider)
      ]);

      setSerpData(serpResult);
      setResearchData(researchResult);
      
      // Transform related keywords
      const transformedRelated = relatedResult.map((kw: string) => ({
        keyword: kw,
        relevance: 'medium' as const
      }));
      setRelatedKeywords(transformedRelated);

      if (serpResult?.isGoogleData) {
        toast.success(`Retrieved comprehensive SERP data for "${searchTerm}"`);
      }
    } catch (error) {
      console.error('Keyword analysis error:', error);
      toast.error('Failed to analyze keyword. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getIntentColor = (intent?: string) => {
    switch (intent) {
      case 'informational': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'commercial': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'transactional': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'navigational': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getDifficultyLevel = (difficulty?: number) => {
    if (!difficulty) return { level: 'Unknown', color: 'text-gray-400' };
    if (difficulty <= 30) return { level: 'Easy', color: 'text-green-400' };
    if (difficulty <= 60) return { level: 'Medium', color: 'text-yellow-400' };
    return { level: 'Hard', color: 'text-red-400' };
  };

  if (isAnalyzing) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin h-12 w-12 border-2 border-neon-blue border-t-transparent rounded-full mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Analyzing Keyword</h3>
              <p className="text-white/60">Gathering SERP data and keyword intelligence...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!serpData && !researchData) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Data Available</h3>
          <p className="text-white/60 mb-4">
            Unable to retrieve keyword data. This may be due to API limitations or the keyword not being found.
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Select value={selectedProvider} onValueChange={(value) => setSelectedProvider(value as 'serp' | 'serpstack')}>
                <SelectTrigger className="w-48 bg-white/5 border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-xl border-white/20">
                  <SelectItem value="serp">SerpAPI</SelectItem>
                  <SelectItem value="serpstack">Serpstack</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={performKeywordAnalysis}
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isAnalyzing && "animate-spin")} />
                Retry Analysis
              </Button>
            </div>
            <p className="text-xs text-white/40">
              💡 Tip: Check your API keys in Settings if you're experiencing issues
            </p>
          </div>
        </div>
      </div>
    );
  }

  const keywordMetrics: KeywordMetrics = {
    searchVolume: serpData?.searchVolume || 0,
    difficulty: serpData?.keywordDifficulty || 0,
    competition: serpData?.competitionScore || 0,
    cpc: 0,
    intent: serpData?.commercialSignals?.commercialIntent || undefined,
    trend: 'stable'
  };

  const difficultyInfo = getDifficultyLevel(keywordMetrics.difficulty);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Provider Selection */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">SERP Analysis Results</h3>
          <p className="text-white/60">Comprehensive keyword intelligence for "{searchTerm}"</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedProvider} onValueChange={(value) => setSelectedProvider(value as 'serp' | 'serpstack')}>
            <SelectTrigger className="w-40 bg-white/5 border-white/20 hover:border-white/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/80 backdrop-blur-xl border-white/20">
              <SelectItem value="serp">SerpAPI</SelectItem>  
              <SelectItem value="serpstack">Serpstack</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline"
            size="sm"
            onClick={performKeywordAnalysis}
            disabled={isAnalyzing}
            className="bg-white/5 border-white/20 hover:bg-white/10"
          >
            <RefreshCw className={cn("h-4 w-4", isAnalyzing && "animate-spin")} />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="serp">SERP Data</TabsTrigger>
          <TabsTrigger value="related">Related</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel bg-white/3 border-white/10 p-4 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-white/70">Search Volume</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {keywordMetrics.searchVolume ? keywordMetrics.searchVolume.toLocaleString() : 'N/A'}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel bg-white/3 border-white/10 p-4 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-orange-400" />
                <span className="text-sm text-white/70">Difficulty</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn("text-2xl font-bold", difficultyInfo.color)}>
                  {keywordMetrics.difficulty || 'N/A'}
                </div>
                {keywordMetrics.difficulty > 0 && (
                  <Badge className={cn("text-xs", difficultyInfo.color)}>
                    {difficultyInfo.level}
                  </Badge>
                )}
              </div>
              {keywordMetrics.difficulty > 0 && (
                <Progress value={keywordMetrics.difficulty} className="mt-2 h-2" />
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel bg-white/3 border-white/10 p-4 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-white/70">Competition</span>
              </div>
              <div className="text-2xl font-bold text-purple-400">
                {keywordMetrics.competition ? keywordMetrics.competition.toFixed(1) : 'N/A'}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-panel bg-white/3 border-white/10 p-4 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-green-400" />
                <span className="text-sm text-white/70">Intent</span>
              </div>
              <Badge className={getIntentColor(keywordMetrics.intent)}>
                {keywordMetrics.intent || 'Unknown'}
              </Badge>
            </motion.div>
          </div>

          {/* SERP Features */}
          {serpData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-panel bg-white/3 border-white/10 p-6 rounded-xl"
            >
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-neon-blue" />
                SERP Features & Opportunities
              </h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-neon-blue">
                    {serpData.topResults?.length || 0}
                  </div>
                  <div className="text-sm text-white/70">Top Results</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-neon-purple">
                    {serpData.peopleAlsoAsk?.length || 0}  
                  </div>
                  <div className="text-sm text-white/70">PAA Questions</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-neon-pink">
                    {serpData.relatedSearches?.length || 0}
                  </div>
                  <div className="text-sm text-white/70">Related Searches</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-cyan-400">
                    {serpData.featuredSnippets?.length || 0}
                  </div>
                  <div className="text-sm text-white/70">Featured Snippets</div>
                </div>
              </div>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="serp" className="space-y-4">
          {serpData?.topResults && serpData.topResults.length > 0 ? (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Top SERP Results</h4>
              {serpData.topResults.slice(0, 10).map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-panel bg-white/3 border-white/10 p-4 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue font-bold text-sm">
                      {result.position}
                    </div>
                    <div className="flex-1 space-y-2">
                      <h5 className="font-medium text-white line-clamp-2">
                        {result.title}
                      </h5>
                      <p className="text-sm text-white/60 line-clamp-2">
                        {result.snippet}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge className="text-xs bg-white/10 text-white/70">
                          {new URL(result.link).hostname}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs text-neon-blue hover:text-white hover:bg-neon-blue/20"
                          onClick={() => window.open(result.link, '_blank')}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Visit
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/60">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No SERP results available for this keyword</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="related" className="space-y-4">
          {relatedKeywords.length > 0 ? (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Related Keywords</h4>
              <div className="grid gap-3">
                {relatedKeywords.map((keyword, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-panel bg-white/3 border-white/10 p-3 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{keyword.keyword}</span>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          keyword.relevance === 'high' 
                            ? 'bg-green-500/20 text-green-300 border-green-500/30'
                            : keyword.relevance === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                            : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                        }>
                          {keyword.relevance}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs text-neon-blue hover:text-white hover:bg-neon-blue/20"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Research
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-white/60">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No related keywords found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          {serpData?.contentGaps && serpData.contentGaps.length > 0 ? (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Content Opportunities</h4>
              {serpData.contentGaps.map((gap, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-panel bg-white/3 border-white/10 p-4 rounded-xl"
                >
                  <h5 className="font-medium text-white mb-2">{gap.topic}</h5>
                  <p className="text-sm text-white/70 mb-3">{gap.description}</p>
                  {gap.recommendation && (
                    <div className="bg-neon-blue/10 border border-neon-blue/20 rounded-lg p-3">
                      <p className="text-sm text-neon-blue">{gap.recommendation}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/60">
              <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No content opportunities identified</p>
              <p className="text-xs mt-2">Try researching a more specific keyword</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};