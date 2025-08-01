
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  TrendingUp, 
  Users, 
  Globe, 
  MessageSquare, 
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Eye,
  Clock,
  Star
} from 'lucide-react';

interface SerpAnalysisPanelProps {
  keyword: string;
  serpData: any;
  isLoading: boolean;
  onStoreSelections?: (selections: any[]) => void;
}

export function SerpAnalysisPanel({ keyword, serpData, isLoading, onStoreSelections }: SerpAnalysisPanelProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Analyzing SERP Data</h3>
          <p className="text-gray-400">Fetching real-time search results and insights...</p>
          <div className="mt-6 space-y-2">
            <div className="text-sm text-gray-500">• Analyzing top-ranking pages</div>
            <div className="text-sm text-gray-500">• Extracting key insights</div>
            <div className="text-sm text-gray-500">• Finding content opportunities</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!serpData) {
    return (
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardContent className="p-8 text-center">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Data Available</h3>
          <p className="text-gray-400">Failed to fetch SERP data. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  const handleItemToggle = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleStoreSelections = () => {
    if (onStoreSelections && selectedItems.size > 0) {
      const selections = Array.from(selectedItems).map(itemId => ({
        id: itemId,
        type: 'serp_item',
        content: itemId, // This would be the actual content in a real implementation
        selected: true
      }));
      onStoreSelections(selections);
    }
  };

  // Mock SERP analysis data - replace with actual serpData processing
  const analysisData = {
    overview: {
      totalResults: serpData?.searchInformation?.totalResults || '12,345,678',
      searchTime: serpData?.searchInformation?.searchTime || 0.45,
      topCompetitors: 10,
      avgWordsCount: 2247
    },
    topResults: [
      {
        id: 'result-1',
        title: 'Complete Guide to Content Marketing Strategy 2024',
        url: 'https://example.com/content-marketing-guide',
        snippet: 'Learn how to create effective content marketing strategies that drive results...',
        position: 1,
        domain: 'example.com',
        wordCount: 3200,
        backlinks: 1247
      },
      {
        id: 'result-2', 
        title: 'Content Marketing Best Practices and Tips',
        url: 'https://another-site.com/content-tips',
        snippet: 'Discover proven content marketing tactics used by successful brands...',
        position: 2,
        domain: 'another-site.com',
        wordCount: 2800,
        backlinks: 892
      }
    ],
    relatedKeywords: [
      { keyword: 'content strategy', volume: 18100, difficulty: 65 },
      { keyword: 'content creation', volume: 12200, difficulty: 58 },
      { keyword: 'content calendar', volume: 8900, difficulty: 52 },
      { keyword: 'content distribution', volume: 4400, difficulty: 47 }
    ],
    peopleAlsoAsk: [
      'What is content marketing strategy?',
      'How do you create a content marketing plan?',
      'What are the best content marketing tools?',
      'How to measure content marketing ROI?'
    ],
    contentGaps: [
      'Video content strategies missing from top results',
      'Limited discussion on AI-powered content creation',
      'Lack of detailed ROI measurement frameworks'
    ]
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-md border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                SERP Analysis: "{keyword}"
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  {analysisData.overview.totalResults} results
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {analysisData.overview.searchTime}s
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Avg. {analysisData.overview.avgWordsCount} words
                </span>
              </div>
            </div>
            
            {selectedItems.size > 0 && (
              <Button
                onClick={handleStoreSelections}
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
              >
                Store {selectedItems.size} Items
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Tabs */}
      <Tabs defaultValue="competitors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/5 backdrop-blur-md border-white/10">
          <TabsTrigger value="competitors">Top Results</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="gaps">Content Gaps</TabsTrigger>
        </TabsList>

        <TabsContent value="competitors" className="space-y-4">
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Ranking Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {analysisData.topResults.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-background/30 rounded-lg border border-border/30 hover:border-border/50 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedItems.has(result.id)}
                          onCheckedChange={(checked) => handleItemToggle(result.id, !!checked)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              #{result.position}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {result.domain}
                            </span>
                          </div>
                          <h4 className="font-medium text-foreground mb-1 line-clamp-2">
                            {result.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {result.snippet}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{result.wordCount} words</span>
                            <span>{result.backlinks} backlinks</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-4">
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Search className="h-5 w-5" />
                Related Keywords
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {analysisData.relatedKeywords.map((kw, index) => (
                  <motion.div
                    key={kw.keyword}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-3 bg-background/30 rounded-lg border border-border/30"
                  >
                    <Checkbox
                      checked={selectedItems.has(`keyword-${kw.keyword}`)}
                      onCheckedChange={(checked) => handleItemToggle(`keyword-${kw.keyword}`, !!checked)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{kw.keyword}</span>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{kw.volume.toLocaleString()} volume</span>
                          <Badge 
                            variant={kw.difficulty > 60 ? "destructive" : kw.difficulty > 40 ? "secondary" : "default"}
                            className="text-xs"
                          >
                            {kw.difficulty}% difficulty
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                People Also Ask
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisData.peopleAlsoAsk.map((question, index) => (
                  <motion.div
                    key={question}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 bg-background/30 rounded-lg border border-border/30"
                  >
                    <Checkbox
                      checked={selectedItems.has(`question-${index}`)}
                      onCheckedChange={(checked) => handleItemToggle(`question-${index}`, !!checked)}
                    />
                    <div className="flex-1">
                      <p className="text-foreground">{question}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gaps" className="space-y-4">
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Content Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisData.contentGaps.map((gap, index) => (
                  <motion.div
                    key={gap}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20"
                  >
                    <Checkbox
                      checked={selectedItems.has(`gap-${index}`)}
                      onCheckedChange={(checked) => handleItemToggle(`gap-${index}`, !!checked)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="h-4 w-4 text-amber-400" />
                        <span className="text-sm font-medium text-amber-400">Opportunity</span>
                      </div>
                      <p className="text-foreground">{gap}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selection Summary */}
      {selectedItems.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-4"
        >
          <Card className="bg-gradient-to-r from-green-600/10 to-teal-600/10 backdrop-blur-md border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span className="text-white font-medium">
                    {selectedItems.size} items selected for content creation
                  </span>
                </div>
                <Button
                  onClick={handleStoreSelections}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                >
                  Store for Content Builder
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
