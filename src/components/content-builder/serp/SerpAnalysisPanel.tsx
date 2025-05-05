import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SerpAnalysisResult } from '@/types/serp';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, HelpCircle, FileText, Sparkles, TrendingUp, Tag, Heading, FileSearch, Layers, PlusCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export interface SerpAnalysisPanelProps {
  serpData: SerpAnalysisResult | null;
  isLoading: boolean;
  mainKeyword: string;
  onAddToContent?: (content: string, type: string) => void;
  error?: string | null;
}

export function SerpAnalysisPanel({ 
  serpData, 
  isLoading, 
  mainKeyword,
  onAddToContent = () => {},
  error = null
}: SerpAnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState('keywords');

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

  // Error state - API key missing
  if (error && error.includes('API key not configured')) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-black/30 to-amber-900/10 backdrop-blur-sm rounded-xl border border-amber-500/20">
        <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
        <p className="text-xl font-medium text-center text-amber-400">SERP API Key Missing</p>
        <p className="text-sm text-muted-foreground mt-2 text-center max-w-md mb-6">
          To analyze keywords and get search insights, you need to add your SERP API key in the settings.
        </p>
        <Button asChild variant="outline" className="border-amber-500/50 text-amber-400 hover:text-amber-300 hover:bg-amber-950/20">
          <Link to="/settings">
            Go to Settings
          </Link>
        </Button>
      </div>
    );
  }

  // General error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-black/30 to-red-900/10 backdrop-blur-sm rounded-xl border border-red-500/20">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <p className="text-xl font-medium text-center text-red-400">SERP Analysis Error</p>
        <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
          {error}
        </p>
      </div>
    );
  }

  // No data state
  if (!serpData || (
    !serpData.topResults?.length && 
    !serpData.relatedSearches?.length && 
    !serpData.peopleAlsoAsk?.length &&
    !serpData.recommendations?.length
  )) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-black/30 to-blue-900/10 backdrop-blur-sm rounded-xl border border-white/10">
        <Search className="h-16 w-16 text-muted-foreground mb-4 opacity-30" />
        <p className="text-xl font-medium text-center">No Results Found</p>
        <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
          {mainKeyword 
            ? `No data available for "${mainKeyword}". Try another keyword.` 
            : "Enter a keyword in the search box to analyze top-ranking content and get insights."}
        </p>
      </div>
    );
  }
  
  // Function to handle adding content
  const handleAddContent = (content: string, type: string) => {
    onAddToContent(content, type);
    toast.success(`Added ${type} to your content plan`);
  };
  
  // Empty data check for each tab
  const hasKeywords = serpData.relatedSearches && serpData.relatedSearches.length > 0;
  const hasQuestions = serpData.peopleAlsoAsk && serpData.peopleAlsoAsk.length > 0;
  const hasEntities = serpData.entities && serpData.entities.length > 0;
  const hasHeadings = serpData.headings && serpData.headings.length > 0;
  const hasGaps = serpData.contentGaps && serpData.contentGaps.length > 0;
  const hasCompetitors = serpData.topResults && serpData.topResults.length > 0;
  
  // If the current tab has no data, switch to a tab that has data
  if (
    (activeTab === 'keywords' && !hasKeywords) ||
    (activeTab === 'questions' && !hasQuestions) ||
    (activeTab === 'entities' && !hasEntities) ||
    (activeTab === 'headings' && !hasHeadings) ||
    (activeTab === 'gaps' && !hasGaps) ||
    (activeTab === 'competitors' && !hasCompetitors)
  ) {
    if (hasKeywords) setActiveTab('keywords');
    else if (hasQuestions) setActiveTab('questions');
    else if (hasEntities) setActiveTab('entities');
    else if (hasHeadings) setActiveTab('headings');
    else if (hasGaps) setActiveTab('gaps');
    else if (hasCompetitors) setActiveTab('competitors');
  }
  
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
                Interactive insights from top-ranking content
              </p>
            </div>
          </div>
          
          {/* Search Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3">
              <div className="text-sm text-muted-foreground mb-1">Search Volume</div>
              <div className="text-2xl font-bold text-neon-purple">
                {serpData.searchVolume ? serpData.searchVolume.toLocaleString() : 'N/A'}
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3">
              <div className="text-sm text-muted-foreground mb-1">Keyword Difficulty</div>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold text-neon-blue">
                  {serpData.keywordDifficulty || 'N/A'}
                </div>
                {serpData.keywordDifficulty ? (
                  <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-neon-blue rounded-full"
                      style={{ width: `${serpData.keywordDifficulty}%` }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3">
              <div className="text-sm text-muted-foreground mb-1">Competition</div>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold text-green-400">
                  {serpData.competitionScore ? `${(serpData.competitionScore * 100).toFixed(0)}%` : 'N/A'}
                </div>
                {serpData.competitionScore ? (
                  <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-neon-purple rounded-full"
                      style={{ width: `${serpData.competitionScore * 100}%` }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Tabs */}
      <Card className="border-white/10 bg-black/20 backdrop-blur-lg overflow-hidden">
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-white/5 border-b border-white/10 rounded-none p-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
            <TabsTrigger
              value="keywords"
              className="rounded-none border-r border-white/10 data-[state=active]:bg-white/5"
              onClick={() => setActiveTab('keywords')}
              disabled={!hasKeywords}
            >
              <Tag className="h-4 w-4 mr-2" /> Keywords
            </TabsTrigger>
            <TabsTrigger
              value="questions"
              className="rounded-none border-r border-white/10 data-[state=active]:bg-white/5"
              onClick={() => setActiveTab('questions')}
              disabled={!hasQuestions}
            >
              <HelpCircle className="h-4 w-4 mr-2" /> Questions
            </TabsTrigger>
            <TabsTrigger
              value="entities"
              className="rounded-none border-r border-white/10 data-[state=active]:bg-white/5"
              onClick={() => setActiveTab('entities')}
              disabled={!hasEntities}
            >
              <Layers className="h-4 w-4 mr-2" /> Entities
            </TabsTrigger>
            <TabsTrigger
              value="headings"
              className="rounded-none border-r border-white/10 data-[state=active]:bg-white/5"
              onClick={() => setActiveTab('headings')}
              disabled={!hasHeadings}
            >
              <Heading className="h-4 w-4 mr-2" /> Headings
            </TabsTrigger>
            <TabsTrigger
              value="gaps"
              className="rounded-none border-r border-white/10 data-[state=active]:bg-white/5"
              onClick={() => setActiveTab('gaps')}
              disabled={!hasGaps}
            >
              <FileSearch className="h-4 w-4 mr-2" /> Gaps
            </TabsTrigger>
            <TabsTrigger
              value="competitors"
              className="rounded-none data-[state=active]:bg-white/5"
              onClick={() => setActiveTab('competitors')}
              disabled={!hasCompetitors}
            >
              <FileText className="h-4 w-4 mr-2" /> Competitors
            </TabsTrigger>
          </TabsList>
          
          <CardContent className="pt-6">
            <TabsContent value="keywords" className="mt-0">
              <div className="space-y-6">
                {/* Content Strategy Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-purple-600/20">
                        <Tag className="h-4 w-4 text-purple-400" />
                      </div>
                      <h3 className="text-base font-medium">Content Strategy</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">Recommendations for structuring your content</p>
                  </div>
                  
                  <Card className="border-purple-500/20 bg-gradient-to-br from-purple-900/10 to-black/20 backdrop-blur-sm">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {serpData.recommendations && serpData.recommendations.length > 0 ? (
                          serpData.recommendations.map((recommendation, index) => (
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
                              <Button
                                size="sm"
                                variant="ghost"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleAddContent(recommendation, 'recommendation')}
                              >
                                <PlusCircle className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-muted-foreground">No content strategy recommendations available</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Keywords Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-blue-600/20">
                        <Tag className="h-4 w-4 text-blue-400" />
                      </div>
                      <h3 className="text-base font-medium">Related Keywords</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">Keywords to include in your content</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {serpData.relatedSearches && serpData.relatedSearches.length > 0 ? (
                      serpData.relatedSearches.slice(0, 20).map((keyword, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group flex items-center justify-between bg-blue-900/10 hover:bg-blue-900/20 border border-blue-500/20 rounded-lg p-3 transition-all"
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <Tag className="h-4 w-4 text-blue-400 flex-shrink-0" />
                            <span className="text-sm truncate">{keyword.query}</span>
                            {keyword.volume && (
                              <span className="text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                {keyword.volume.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <Button 
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            onClick={() => handleAddContent(keyword.query, 'keyword')}
                          >
                            <PlusCircle className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-10 bg-white/5 rounded-lg border border-white/10">
                        <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No keywords available for this search term.</p>
                      </div>
                    )}
                  </div>
                  
                  {serpData.relatedSearches && serpData.relatedSearches.length > 20 && (
                    <div className="text-center mt-3">
                      <Button variant="outline" size="sm" className="text-xs border-blue-500/20 text-blue-400 hover:bg-blue-900/20">
                        Show More Keywords
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="questions" className="mt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-amber-600/20">
                      <HelpCircle className="h-4 w-4 text-amber-400" />
                    </div>
                    <h3 className="text-base font-medium">People Also Ask</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">Common questions people search about this topic</p>
                </div>
                
                <div className="space-y-3">
                  {serpData.peopleAlsoAsk && serpData.peopleAlsoAsk.length > 0 ? (
                    serpData.peopleAlsoAsk.slice(0, 15).map((question, index) => (
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
                            <div className="flex-1">
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
                          <Button 
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            onClick={() => handleAddContent(question.question, 'question')}
                          >
                            <PlusCircle className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-white/5 rounded-lg border border-white/10">
                      <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No questions available for this search term.</p>
                    </div>
                  )}
                  
                  {serpData.peopleAlsoAsk && serpData.peopleAlsoAsk.length > 15 && (
                    <div className="text-center mt-3">
                      <Button variant="outline" size="sm" className="text-xs border-amber-500/20 text-amber-400 hover:bg-amber-900/20">
                        Show More Questions
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Entities Tab */}
            <TabsContent value="entities" className="mt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-indigo-600/20">
                      <Layers className="h-4 w-4 text-indigo-400" />
                    </div>
                    <h3 className="text-base font-medium">Key Entities</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">Important entities and concepts related to this topic</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {serpData.entities && serpData.entities.length > 0 ? (
                    serpData.entities.slice(0, 18).map((entity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group flex flex-col bg-indigo-900/10 hover:bg-indigo-900/20 border border-indigo-500/20 rounded-lg p-3 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-indigo-400" />
                            <span className="text-sm font-medium">{entity.name}</span>
                          </div>
                          <Button 
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleAddContent(entity.name, 'entity')}
                          >
                            <PlusCircle className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                        {entity.description && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{entity.description}</p>
                        )}
                        {entity.type && (
                          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full mt-2 self-start">
                            {entity.type}
                          </span>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-10 bg-white/5 rounded-lg border border-white/10">
                      <Layers className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No entities available for this search term.</p>
                    </div>
                  )}
                </div>
                
                {serpData.entities && serpData.entities.length > 18 && (
                  <div className="text-center mt-3">
                    <Button variant="outline" size="sm" className="text-xs border-indigo-500/20 text-indigo-400 hover:bg-indigo-900/20">
                      Show More Entities
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Headings Tab */}
            <TabsContent value="headings" className="mt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-teal-600/20">
                      <Heading className="h-4 w-4 text-teal-400" />
                    </div>
                    <h3 className="text-base font-medium">Top Headings</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">Common headings used by top-ranking content</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {serpData.headings && serpData.headings.length > 0 ? (
                    serpData.headings.slice(0, 16).map((heading, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group flex items-center justify-between bg-teal-900/10 hover:bg-teal-900/20 border border-teal-500/20 rounded-lg p-3 transition-all"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <Heading className="h-4 w-4 text-teal-400 flex-shrink-0" />
                          <span className="text-sm truncate">{heading.text}</span>
                          {heading.type && (
                            <span className="text-xs bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded-full flex-shrink-0">
                              {heading.type}
                            </span>
                          )}
                        </div>
                        <Button 
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          onClick={() => handleAddContent(heading.text, 'heading')}
                        >
                          <PlusCircle className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-10 bg-white/5 rounded-lg border border-white/10">
                      <Heading className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No headings available for this search term.</p>
                    </div>
                  )}
                </div>
                
                {serpData.headings && serpData.headings.length > 16 && (
                  <div className="text-center mt-3">
                    <Button variant="outline" size="sm" className="text-xs border-teal-500/20 text-teal-400 hover:bg-teal-900/20">
                      Show More Headings
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Content Gaps Tab */}
            <TabsContent value="gaps" className="mt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-rose-600/20">
                      <FileSearch className="h-4 w-4 text-rose-400" />
                    </div>
                    <h3 className="text-base font-medium">Content Gaps</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">Topics competitors are missing that you can cover</p>
                </div>
                
                <div className="space-y-3">
                  {serpData.contentGaps && serpData.contentGaps.length > 0 ? (
                    serpData.contentGaps.map((gap, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border border-rose-500/20 rounded-lg overflow-hidden bg-gradient-to-br from-rose-900/10 to-black/20"
                      >
                        <div className="p-4 group hover:bg-white/5 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <FileSearch className="h-5 w-5 text-rose-400 mt-0.5" />
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{gap.content}</h4>
                                {gap.opportunity && (
                                  <div className="mt-1 flex items-center gap-2">
                                    <span className="text-xs bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded-full">
                                      Opportunity: {gap.opportunity}
                                    </span>
                                  </div>
                                )}
                                {gap.source && (
                                  <p className="text-xs text-muted-foreground mt-1">Source: {gap.source}</p>
                                )}
                              </div>
                            </div>
                            <Button 
                              size="sm"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              onClick={() => handleAddContent(gap.content, 'contentGap')}
                            >
                              <PlusCircle className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-white/5 rounded-lg border border-white/10">
                      <FileSearch className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No content gaps identified for this search term.</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="competitors" className="mt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-green-600/20">
                      <FileText className="h-4 w-4 text-green-400" />
                    </div>
                    <h3 className="text-base font-medium">Top Ranks</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">Top-ranking content for this keyword</p>
                </div>
                
                <div className="space-y-4">
                  {serpData.topResults && serpData.topResults.length > 0 ? (
                    serpData.topResults.slice(0, 10).map((competitor, index) => (
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
                            <Button 
                              size="sm"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleAddContent(competitor.snippet, 'competitor')}
                            >
                              <PlusCircle className="h-4 w-4 mr-1" />
                              Add
                            </Button>
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
                
                {serpData.topResults && serpData.topResults.length > 10 && (
                  <div className="text-center mt-3">
                    <Button variant="outline" size="sm" className="text-xs border-green-500/20 text-green-400 hover:bg-green-900/20">
                      Show More Results
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
