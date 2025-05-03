
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SerpAnalysisResult } from '@/types/serp';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Search, HelpCircle, FileText, Sparkles, TrendingUp, Tag } from 'lucide-react';

// Import refactored components
import { SerpSectionHeader } from '@/components/content/serp-analysis/SerpSectionHeader';
import { SerpEmptyState } from '@/components/content/serp-analysis/SerpEmptyState';
import { SerpMetricsSection } from '@/components/content/serp-analysis/SerpMetricsSection';
import { SerpOverviewSection } from '@/components/content/serp-analysis/SerpOverviewSection';
import { SerpKeywordsSection } from '@/components/content/serp-analysis/SerpKeywordsSection';
import { SerpQuestionsSection } from '@/components/content/serp-analysis/SerpQuestionsSection';
import { SerpCompetitorsSection } from '@/components/content/serp-analysis/SerpCompetitorsSection';
import { SerpInteractiveCard } from '@/components/content/serp-analysis/SerpInteractiveCard';

export interface SerpAnalysisPanelProps {
  serpData: SerpAnalysisResult | null;
  isLoading: boolean;
  mainKeyword: string;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpAnalysisPanel({ 
  serpData, 
  isLoading, 
  mainKeyword,
  onAddToContent = () => {}
}: SerpAnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState('metrics');

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-black/30 to-blue-900/10 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-neon-purple"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-neon-purple h-8 w-8 animate-pulse" />
          </div>
          <p className="mt-6 text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">Analyzing search results...</p>
          <p className="text-sm text-muted-foreground mt-2">Extracting insights from top-ranking content</p>
        </div>
      </div>
    );
  }

  // No data state
  if (!serpData) {
    return <SerpEmptyState />;
  }
  
  // Check if data is mock
  const isMockData = serpData.isMockData;
  
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-neon-purple/20 to-neon-blue/5 backdrop-blur-lg p-4">
        {/* Interactive background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              left: ['-100%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute w-20 h-20 rounded-full bg-neon-purple/20 filter blur-xl"
            animate={{
              x: ['-10%', '110%'],
              y: ['30%', '50%'],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute w-32 h-32 rounded-full bg-neon-blue/20 filter blur-xl"
            animate={{
              x: ['110%', '-10%'],
              y: ['60%', '40%'],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        </div>
        
        {/* Content */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full">
              <TrendingUp className="text-white h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-xl">
                Analysis for: <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">{mainKeyword}</span>
              </h3>
              <p className="text-sm text-muted-foreground">
                {isMockData ? 
                  "Using demonstration data - add API key for real-time results" : 
                  "Interactive insights from top-ranking content"}
              </p>
            </div>
          </div>
          
          {/* Search Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3">
              <div className="text-sm text-muted-foreground mb-1">Search Volume</div>
              <div className="text-2xl font-bold text-neon-purple">
                {serpData.searchVolume?.toLocaleString() || 'N/A'}
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3">
              <div className="text-sm text-muted-foreground mb-1">Keyword Difficulty</div>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold text-neon-blue">
                  {serpData.keywordDifficulty || 'N/A'}
                </div>
                {serpData.keywordDifficulty && (
                  <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-neon-blue rounded-full"
                      style={{ width: `${serpData.keywordDifficulty}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3">
              <div className="text-sm text-muted-foreground mb-1">Competition</div>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold text-green-400">
                  {serpData.competitionScore ? `${(serpData.competitionScore * 100).toFixed(0)}%` : 'N/A'}
                </div>
                {serpData.competitionScore && (
                  <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-neon-purple rounded-full"
                      style={{ width: `${serpData.competitionScore * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Tabs */}
      <Card className="border-white/10 bg-black/20 backdrop-blur-lg overflow-hidden">
        <Tabs defaultValue="keywords" className="w-full">
          <TabsList className="w-full bg-white/5 border-b border-white/10 rounded-none p-0">
            <TabsTrigger
              value="keywords"
              className="flex-1 rounded-none border-r border-white/10 data-[state=active]:bg-white/5"
              onClick={() => setActiveTab('keywords')}
            >
              <Tag className="h-4 w-4 mr-2" /> Keywords
            </TabsTrigger>
            <TabsTrigger
              value="questions"
              className="flex-1 rounded-none border-r border-white/10 data-[state=active]:bg-white/5"
              onClick={() => setActiveTab('questions')}
            >
              <HelpCircle className="h-4 w-4 mr-2" /> Questions
            </TabsTrigger>
            <TabsTrigger
              value="competitors"
              className="flex-1 rounded-none data-[state=active]:bg-white/5"
              onClick={() => setActiveTab('competitors')}
            >
              <FileText className="h-4 w-4 mr-2" /> Competitors
            </TabsTrigger>
          </TabsList>
          
          <CardContent className="pt-6">
            <TabsContent value="keywords" className="mt-0">
              <div className="space-y-6">
                {/* Content Strategy Section */}
                {serpData.recommendations && serpData.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <SerpSectionHeader
                      title="Content Strategy"
                      expanded={true}
                      onToggle={() => {}}
                      variant="purple"
                      description="Recommendations for structuring your content"
                    />
                    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-900/10 to-black/20 backdrop-blur-sm">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {serpData.recommendations.map((recommendation, index) => (
                            <motion.div 
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start gap-3 group hover:bg-white/5 p-2 rounded-lg transition-colors"
                            >
                              <div className="min-w-7 h-7 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue flex items-center justify-center text-white text-xs">
                                {index + 1}
                              </div>
                              <p className="text-sm flex-1">{recommendation}</p>
                              <button 
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-neon-purple/20 text-neon-purple px-2 py-1 rounded-full"
                                onClick={() => onAddToContent(recommendation, 'recommendation')}
                              >
                                Add
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {/* Keywords Section */}
                <div className="space-y-2">
                  <SerpSectionHeader
                    title="Related Keywords"
                    expanded={true}
                    onToggle={() => {}}
                    variant="blue"
                    description="Keywords to include in your content"
                    count={serpData.relatedSearches?.length || 0}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {serpData.relatedSearches && serpData.relatedSearches.length > 0 ? (
                      serpData.relatedSearches.map((keyword, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group flex items-center justify-between bg-blue-900/10 hover:bg-blue-900/20 border border-blue-500/20 rounded-lg p-3 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-blue-400" />
                            <span className="text-sm">{keyword.query}</span>
                            {keyword.volume && (
                              <span className="text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-full">
                                {keyword.volume.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <button 
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full"
                            onClick={() => onAddToContent(keyword.query, 'keyword')}
                          >
                            Add
                          </button>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-10 bg-white/5 rounded-lg border border-white/10">
                        <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No keywords available for this search term.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="questions" className="mt-0">
              <div className="space-y-2">
                <SerpSectionHeader
                  title="People Also Ask"
                  expanded={true}
                  onToggle={() => {}}
                  variant="amber"
                  description="Common questions people search about this topic"
                  count={serpData.peopleAlsoAsk?.length || 0}
                />
                
                <div className="space-y-3">
                  {serpData.peopleAlsoAsk && serpData.peopleAlsoAsk.length > 0 ? (
                    serpData.peopleAlsoAsk.map((question, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border border-amber-500/20 rounded-lg overflow-hidden bg-gradient-to-br from-amber-900/10 to-black/20"
                      >
                        <div className="p-4 flex items-center justify-between group hover:bg-white/5 transition-colors">
                          <div className="flex items-start gap-3">
                            <HelpCircle className="h-5 w-5 text-amber-400 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-sm">{question.question}</h4>
                              {question.answer && (
                                <p className="text-sm text-muted-foreground mt-1">{question.answer}</p>
                              )}
                              {question.source && (
                                <p className="text-xs text-blue-400 mt-1 underline hover:text-blue-300">
                                  <a href={question.source} target="_blank" rel="noopener noreferrer">
                                    Source
                                  </a>
                                </p>
                              )}
                            </div>
                          </div>
                          <button 
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full self-start"
                            onClick={() => onAddToContent(question.question, 'question')}
                          >
                            Add
                          </button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-white/5 rounded-lg border border-white/10">
                      <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No questions available for this search term.</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="competitors" className="mt-0">
              <div className="space-y-2">
                <SerpSectionHeader
                  title="Competitor Analysis"
                  expanded={true}
                  onToggle={() => {}}
                  variant="green"
                  description="Learn from top-ranking content for this keyword"
                  count={serpData.topResults?.length || 0}
                />
                
                <div className="space-y-4">
                  {serpData.topResults && serpData.topResults.length > 0 ? (
                    serpData.topResults.map((competitor, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-green-500/20 rounded-lg overflow-hidden bg-gradient-to-br from-green-900/10 to-black/20 hover:bg-white/5 transition-colors group"
                      >
                        <div className="p-4">
                          <div className="flex justify-between">
                            <div className="bg-green-900/30 text-green-400 text-xs px-2 py-0.5 rounded-full">
                              Rank #{competitor.position}
                            </div>
                            <button 
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full"
                              onClick={() => onAddToContent(competitor.snippet, 'competitor')}
                            >
                              Add
                            </button>
                          </div>
                          <h4 className="font-medium my-2">{competitor.title}</h4>
                          <p className="text-sm text-muted-foreground">{competitor.snippet}</p>
                          <a 
                            href={competitor.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 mt-2 inline-block hover:underline"
                          >
                            {competitor.link}
                          </a>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-white/5 rounded-lg border border-white/10">
                      <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No competitor data available.</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};
