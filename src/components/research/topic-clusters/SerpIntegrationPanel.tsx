
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Globe,
  HelpCircle,
  Target,
  BarChart3,
  Lightbulb,
  Zap,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Copy,
  CheckCircle
} from 'lucide-react';
import { SerpAnalysisResult } from '@/types/serp';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { toast } from 'sonner';

interface SerpIntegrationPanelProps {
  keyword: string;
  onDataUpdate?: (data: SerpAnalysisResult) => void;
  initialData?: SerpAnalysisResult;
}

export const SerpIntegrationPanel: React.FC<SerpIntegrationPanelProps> = ({
  keyword,
  onDataUpdate,
  initialData
}) => {
  const [serpData, setSerpData] = useState<SerpAnalysisResult | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    competitors: true,
    questions: false,
    keywords: false,
    gaps: false
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const analyzeSERP = async () => {
    if (!keyword.trim()) return;
    
    setIsLoading(true);
    try {
      const data = await analyzeKeywordSerp(keyword);
      if (data) {
        setSerpData(data);
        onDataUpdate?.(data);
        toast.success(`SERP analysis completed for "${keyword}"`);
      }
    } catch (error) {
      toast.error('Failed to analyze SERP data');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleItemSelection = (item: string) => {
    setSelectedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  useEffect(() => {
    if (keyword && !serpData) {
      analyzeSERP();
    }
  }, [keyword]);

  if (isLoading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/20">
        <CardContent className="p-8 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Brain className="h-12 w-12 text-purple-400 mb-4" />
          </motion.div>
          <h3 className="text-lg font-semibold text-white mb-2">Analyzing SERP Data</h3>
          <p className="text-white/60 mb-4">Getting real-time insights for "{keyword}"</p>
          <Progress value={65} className="w-64 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (!serpData) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/20">
        <CardContent className="p-8 text-center">
          <Globe className="h-12 w-12 text-white/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No SERP Data</h3>
          <p className="text-white/60 mb-4">Click below to analyze SERP data for this keyword</p>
          <Button onClick={analyzeSERP} className="bg-gradient-to-r from-purple-600 to-blue-600">
            <Brain className="h-4 w-4 mr-2" />
            Analyze SERP
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: 'Search Volume', value: serpData.searchVolume?.toLocaleString() || '0', color: 'text-blue-400' },
          { icon: Target, label: 'Difficulty', value: serpData.keywordDifficulty || '0', color: 'text-yellow-400' },
          { icon: BarChart3, label: 'Competition', value: Math.round((serpData.competitionScore || 0) * 100) + '%', color: 'text-green-400' },
          { icon: Users, label: 'Top Results', value: serpData.topResults?.length || '0', color: 'text-purple-400' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/60">{stat.label}</p>
                    <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* SERP Analysis Tabs */}
      <Tabs defaultValue="competitors" className="space-y-4">
        <TabsList className="bg-white/10 border-white/20 grid grid-cols-4">
          <TabsTrigger value="competitors" className="text-white data-[state=active]:bg-purple-600">
            Competitors
          </TabsTrigger>
          <TabsTrigger value="questions" className="text-white data-[state=active]:bg-purple-600">
            Questions
          </TabsTrigger>
          <TabsTrigger value="keywords" className="text-white data-[state=active]:bg-purple-600">
            Keywords
          </TabsTrigger>
          <TabsTrigger value="gaps" className="text-white data-[state=active]:bg-purple-600">
            Content Gaps
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-96">
          <TabsContent value="competitors" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Top Competitors</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={analyzeSERP}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            
            {serpData.topResults?.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-purple-500/20 text-purple-300">{result.position}</Badge>
                            <h4 className="font-medium text-white text-sm">{result.title}</h4>
                          </div>
                          <p className="text-xs text-white/60 mb-2">{result.snippet}</p>
                          <div className="flex items-center gap-2">
                            <ExternalLink className="h-3 w-3 text-white/40" />
                            <span className="text-xs text-white/40">{result.link}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(result.title)}
                          className="text-white/60 hover:text-white"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            <h3 className="text-lg font-semibold text-white">People Also Ask</h3>
            {serpData.peopleAlsoAsk?.map((question, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer ${
                    selectedItems.includes(question.question) ? 'border-purple-400/50 bg-purple-500/10' : ''
                  }`}
                  onClick={() => toggleItemSelection(question.question)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <HelpCircle className="h-4 w-4 text-blue-400 flex-shrink-0" />
                        <p className="text-white text-sm">{question.question}</p>
                      </div>
                      {selectedItems.includes(question.question) ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <div className="w-4 h-4 border border-white/20 rounded" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="keywords" className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Related Keywords</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serpData.keywords?.map((keyword, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className={`bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer ${
                      selectedItems.includes(keyword) ? 'border-purple-400/50 bg-purple-500/10' : ''
                    }`}
                    onClick={() => toggleItemSelection(keyword)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">{keyword}</span>
                        {selectedItems.includes(keyword) ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <div className="w-4 h-4 border border-white/20 rounded" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gaps" className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Content Opportunities</h3>
            {serpData.contentGaps?.map((gap, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-400" />
                        <h4 className="font-medium text-white">{gap.topic}</h4>
                      </div>
                      <p className="text-sm text-white/70">{gap.description}</p>
                      {gap.opportunity && (
                        <Badge className="bg-green-500/20 text-green-300">
                          {gap.opportunity}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Selected Items Summary */}
      <AnimatePresence>
        {selectedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-400/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-white font-medium">
                      {selectedItems.length} items selected for content creation
                    </span>
                  </div>
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Use in Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
