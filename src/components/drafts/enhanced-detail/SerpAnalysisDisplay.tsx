
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, ChevronDown, ChevronUp, Target, TrendingUp, Eye, Users, FileText, Lightbulb, ExternalLink, Award, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface SerpAnalysisDisplayProps {
  serpData: any;
  draft: any;
  isAnalyzing: boolean;
}

export const SerpAnalysisDisplay: React.FC<SerpAnalysisDisplayProps> = ({
  serpData,
  draft,
  isAnalyzing
}) => {
  const [expandedSections, setExpandedSections] = useState({
    keywords: false,
    questions: false,
    competitors: false,
    snippets: false,
    entities: false,
    contentGaps: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (isAnalyzing) {
    return (
      <Card className="h-full bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <motion.div
              className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-sm text-muted-foreground">Analyzing SERP data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const savedSerpSelections = draft.metadata?.serpSelections;
  const serpMetrics = draft.metadata?.serpMetrics;
  
  if (!serpData && !savedSerpSelections && !serpMetrics) {
    return (
      <Card className="h-full bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            SERP Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <Eye className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No SERP data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="h-5 w-5" />
          SERP Analysis
          {draft.keywords?.[0] && (
            <Badge variant="outline" className="ml-2">
              {draft.keywords[0]}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full p-0">
        <ScrollArea className="h-[calc(100%-4rem)] p-6">
          <div className="space-y-4">
            {/* SERP Metrics Summary */}
            {serpMetrics && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
              >
                <div className="p-3 bg-background/50 rounded-lg border border-white/10 text-center">
                  <div className="text-lg font-bold text-blue-500">
                    {serpMetrics.totalResults?.toLocaleString() || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Results</div>
                </div>
                <div className="p-3 bg-background/50 rounded-lg border border-white/10 text-center">
                  <div className="text-lg font-bold text-blue-500">
                    {serpMetrics.competitorAnalyzed || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Competitors</div>
                </div>
                <div className="p-3 bg-background/50 rounded-lg border border-white/10 text-center">
                  <div className="text-lg font-bold text-blue-500">
                    {serpMetrics.contentGapsFound || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Content Gaps</div>
                </div>
                <div className="p-3 bg-background/50 rounded-lg border border-white/10 text-center">
                  <div className="text-lg font-bold text-blue-500">
                    {serpMetrics.avgCompetitorLength || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Avg Length</div>
                </div>
              </motion.div>
            )}

            {/* Top Ranking Competitors */}
            {serpData?.topResults && serpData.topResults.length > 0 && (
              <Collapsible open={expandedSections.competitors} onOpenChange={() => toggleSection('competitors')}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-background/30 hover:bg-background/50">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">Top Competitors ({serpData.topResults.slice(0, 5).length})</span>
                    </div>
                    {expandedSections.competitors ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                    <div className="space-y-3">
                      {serpData.topResults.slice(0, 5).map((result: any, idx: number) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-3 p-3 bg-background/30 rounded border border-purple-500/30"
                        >
                          <Badge variant="secondary" className="bg-purple-500/30 text-purple-100 text-xs">
                            #{result.position || idx + 1}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm line-clamp-2">{result.title || 'Untitled'}</div>
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              <span className="truncate">{result.url || result.link}</span>
                            </div>
                            {result.snippet && (
                              <div className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                {result.snippet}
                              </div>
                            )}
                          </div>
                          {result.url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={result.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Featured Snippets */}
            {serpData?.featuredSnippet && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/10 rounded-lg p-4 border border-green-500/20"
              >
                <h4 className="font-medium mb-3 text-green-700 dark:text-green-300 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Featured Snippet Opportunity
                </h4>
                <div className="p-3 bg-background/30 rounded border border-green-500/30">
                  <div className="text-sm font-medium mb-2">{serpData.featuredSnippet.title}</div>
                  <div className="text-xs text-muted-foreground">{serpData.featuredSnippet.snippet}</div>
                  {serpData.featuredSnippet.url && (
                    <div className="text-xs text-green-400 mt-1">{serpData.featuredSnippet.url}</div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Selected Keywords */}
            {savedSerpSelections?.keywords && savedSerpSelections.keywords.length > 0 && (
              <Collapsible open={expandedSections.keywords} onOpenChange={() => toggleSection('keywords')}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-background/30 hover:bg-background/50">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Selected Keywords ({savedSerpSelections.keywords.length})</span>
                    </div>
                    {expandedSections.keywords ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                    <div className="grid grid-cols-1 gap-2">
                      {savedSerpSelections.keywords.map((keyword: string, idx: number) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center justify-between p-2 bg-background/30 rounded border border-green-500/30"
                        >
                          <span className="text-sm font-medium">{keyword}</span>
                          <Badge variant="secondary" className="bg-green-500/30 text-green-100 text-xs">
                            Keyword
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* People Also Ask Questions */}
            {(savedSerpSelections?.questions && savedSerpSelections.questions.length > 0) || 
             (serpData?.peopleAlsoAsk && serpData.peopleAlsoAsk.length > 0) && (
              <Collapsible open={expandedSections.questions} onOpenChange={() => toggleSection('questions')}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-background/30 hover:bg-background/50">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">
                        People Also Ask ({savedSerpSelections?.questions?.length || serpData?.peopleAlsoAsk?.length || 0})
                      </span>
                    </div>
                    {expandedSections.questions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/20">
                    <div className="space-y-3">
                      {(savedSerpSelections?.questions || serpData?.peopleAlsoAsk || []).map((question: any, idx: number) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-3 bg-background/30 rounded border border-orange-500/30"
                        >
                          <p className="text-sm font-medium">
                            {typeof question === 'string' ? question : question.question}
                          </p>
                          {typeof question === 'object' && question.snippet && (
                            <p className="text-xs text-muted-foreground mt-2">{question.snippet}</p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Entities */}
            {savedSerpSelections?.entities && savedSerpSelections.entities.length > 0 && (
              <div className="bg-cyan-500/10 rounded-lg p-4 border border-cyan-500/20">
                <h4 className="font-medium mb-3 text-cyan-700 dark:text-cyan-300 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Related Entities ({savedSerpSelections.entities.length})
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {savedSerpSelections.entities.map((entity: string, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-2 bg-background/30 rounded border border-cyan-500/30 text-center"
                    >
                      <span className="text-sm font-medium">{entity}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Gaps */}
            {savedSerpSelections?.contentGaps && savedSerpSelections.contentGaps.length > 0 && (
              <Collapsible open={expandedSections.contentGaps} onOpenChange={() => toggleSection('contentGaps')}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-background/30 hover:bg-background/50">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-pink-500" />
                      <span className="font-medium">Content Opportunities ({savedSerpSelections.contentGaps.length})</span>
                    </div>
                    {expandedSections.contentGaps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="bg-pink-500/10 rounded-lg p-4 border border-pink-500/20">
                    <div className="space-y-2">
                      {savedSerpSelections.contentGaps.map((gap: string, idx: number) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-3 bg-background/30 rounded border border-pink-500/30"
                        >
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-pink-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{gap}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Related Searches */}
            {serpData?.relatedSearches && serpData.relatedSearches.length > 0 && (
              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                <h4 className="font-medium mb-3 text-blue-700 dark:text-blue-300">
                  Related Searches ({serpData.relatedSearches.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {serpData.relatedSearches.map((search: any, idx: number) => (
                    <Badge 
                      key={idx}
                      variant="outline" 
                      className="bg-blue-500/20 border-blue-500/30 text-blue-200"
                    >
                      {typeof search === 'string' ? search : search.query}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis Summary */}
            {(serpMetrics || savedSerpSelections) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20"
              >
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Analysis Summary
                </h4>
                <div className="text-sm text-muted-foreground">
                  {savedSerpSelections && (
                    <p className="mb-2">
                      Total selected items: <span className="font-medium text-foreground">
                        {(savedSerpSelections.keywords?.length || 0) + 
                         (savedSerpSelections.questions?.length || 0) + 
                         (savedSerpSelections.entities?.length || 0) + 
                         (savedSerpSelections.contentGaps?.length || 0)}
                      </span>
                    </p>
                  )}
                  {serpMetrics && (
                    <p>
                      Analysis completed with <span className="font-medium text-foreground">
                        {serpMetrics.competitorAnalyzed || 0}
                      </span> competitors analyzed.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
