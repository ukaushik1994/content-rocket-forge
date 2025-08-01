
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  Plus,
  Target,
  TrendingUp,
  Users,
  Globe,
  Sparkles,
  Brain,
  BarChart3,
  Lightbulb,
  HelpCircle,
  Tag,
  ExternalLink,
  Copy,
  CheckCircle,
  Loader2,
  RefreshCw,
  Zap,
  FileText,
  ArrowRight,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { ContentBuilderProvider } from '@/contexts/ContentBuilderContext';
import { ClusterAnalysisCard } from '@/components/research/topic-clusters/ClusterAnalysisCard';
import { SerpIntegrationPanel } from '@/components/research/topic-clusters/SerpIntegrationPanel';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { SerpAnalysisResult } from '@/types/serp';

interface TopicCluster {
  id: string;
  name: string;
  mainKeyword: string;
  keywords: string[];
  serpData?: SerpAnalysisResult;
  contentIdeas: string[];
  difficulty: number;
  opportunity: number;
  createdAt: Date;
}

export default function TopicClusters() {
  const [clusters, setClusters] = useState<TopicCluster[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCluster, setSelectedCluster] = useState<TopicCluster | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCreatingCluster, setIsCreatingCluster] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Sample clusters for demo
  useEffect(() => {
    const sampleClusters: TopicCluster[] = [
      {
        id: '1',
        name: 'Digital Marketing Fundamentals',
        mainKeyword: 'digital marketing',
        keywords: ['SEO', 'social media marketing', 'content marketing', 'email marketing', 'PPC'],
        contentIdeas: ['Beginner\'s guide to digital marketing', 'Digital marketing trends 2024', 'ROI measurement in digital marketing'],
        difficulty: 75,
        opportunity: 85,
        createdAt: new Date()
      },
      {
        id: '2',
        name: 'AI Content Creation',
        mainKeyword: 'AI content writing',
        keywords: ['AI writing tools', 'automated content', 'GPT content', 'AI copywriting', 'content automation'],
        contentIdeas: ['Best AI writing tools comparison', 'How to use AI for content creation', 'AI vs human content writers'],
        difficulty: 68,
        opportunity: 92,
        createdAt: new Date()
      }
    ];
    setClusters(sampleClusters);
  }, []);

  const analyzeKeyword = async (keyword: string) => {
    if (!keyword.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const data = await analyzeKeywordSerp(keyword);
      if (data && selectedCluster) {
        setSelectedCluster({
          ...selectedCluster,
          serpData: data
        });
        toast.success(`SERP analysis completed for "${keyword}"`);
      }
    } catch (error) {
      toast.error('Failed to analyze SERP data');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createNewCluster = async () => {
    if (!searchKeyword.trim()) {
      toast.error('Please enter a keyword to create a cluster');
      return;
    }

    setIsCreatingCluster(true);
    try {
      // Analyze the keyword first
      const serpData = await analyzeKeywordSerp(searchKeyword);
      
      const newCluster: TopicCluster = {
        id: Date.now().toString(),
        name: `${searchKeyword} Cluster`,
        mainKeyword: searchKeyword,
        keywords: serpData?.keywords?.slice(0, 8) || [searchKeyword],
        serpData: serpData,
        contentIdeas: serpData?.contentGaps?.map(gap => gap.topic)?.slice(0, 5) || [],
        difficulty: serpData?.keywordDifficulty || 50,
        opportunity: Math.round(Math.random() * 40 + 60), // Random for demo
        createdAt: new Date()
      };

      setClusters(prev => [newCluster, ...prev]);
      setSelectedCluster(newCluster);
      setSearchKeyword('');
      toast.success(`Created cluster for "${searchKeyword}"`);
    } catch (error) {
      toast.error('Failed to create cluster');
    } finally {
      setIsCreatingCluster(false);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty >= 80) return 'text-red-500';
    if (difficulty >= 60) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getOpportunityColor = (opportunity: number) => {
    if (opportunity >= 80) return 'text-green-500';
    if (opportunity >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <ContentBuilderProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
              Topic Clusters
            </h1>
            <p className="text-white/70 text-lg">
              Discover content opportunities and build comprehensive topic clusters with real-time SERP analysis
            </p>
          </motion.div>

          {/* Search & Create Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="p-6">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Search Keyword</label>
                    <Input
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      placeholder="Enter a keyword to analyze and create cluster..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      onKeyPress={(e) => e.key === 'Enter' && createNewCluster()}
                    />
                  </div>
                  <Button
                    onClick={createNewCluster}
                    disabled={isCreatingCluster || !searchKeyword.trim()}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isCreatingCluster ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Cluster
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Clusters List */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                  <Target className="h-5 w-5 text-purple-400" />
                  Your Clusters ({clusters.length})
                </h2>
                
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3 pr-4">
                    {clusters.map((cluster, index) => (
                      <motion.div
                        key={cluster.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card 
                          className={`cursor-pointer transition-all hover:bg-white/20 ${
                            selectedCluster?.id === cluster.id 
                              ? 'bg-white/15 border-purple-400/50' 
                              : 'bg-white/5 border-white/10'
                          }`}
                          onClick={() => setSelectedCluster(cluster)}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <h3 className="font-medium text-white text-sm leading-tight">
                                  {cluster.name}
                                </h3>
                                {selectedCluster?.id === cluster.id && (
                                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                                )}
                              </div>
                              
                              <div className="text-xs text-white/60">
                                <span className="font-medium">Main:</span> {cluster.mainKeyword}
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs">
                                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1">
                                  {cluster.keywords.length} keywords
                                </Badge>
                                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1">
                                  {cluster.contentIdeas.length} ideas
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                  <span className="text-white/60">Difficulty:</span>
                                  <span className={getDifficultyColor(cluster.difficulty)}>
                                    {cluster.difficulty}%
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                  <span className="text-white/60">Opportunity:</span>
                                  <span className={getOpportunityColor(cluster.opportunity)}>
                                    {cluster.opportunity}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                    
                    {clusters.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                      >
                        <Target className="h-12 w-12 text-white/40 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white/60 mb-2">No clusters yet</h3>
                        <p className="text-white/40 text-sm">
                          Create your first topic cluster by searching for a keyword above
                        </p>
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>
              </motion.div>
            </div>

            {/* Cluster Details */}
            <div className="lg:col-span-2">
              {selectedCluster ? (
                <motion.div
                  key={selectedCluster.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Cluster Overview */}
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl text-white flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-purple-400" />
                          {selectedCluster.name}
                        </CardTitle>
                        <Button
                          onClick={() => analyzeKeyword(selectedCluster.mainKeyword)}
                          disabled={isAnalyzing}
                          variant="outline"
                          size="sm"
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Refresh SERP
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 bg-white/5 rounded-lg">
                          <BarChart3 className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-yellow-400">{selectedCluster.difficulty}%</div>
                          <div className="text-sm text-white/60">Difficulty</div>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-lg">
                          <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-green-400">{selectedCluster.opportunity}%</div>
                          <div className="text-sm text-white/60">Opportunity</div>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-lg">
                          <Tag className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-blue-400">{selectedCluster.keywords.length}</div>
                          <div className="text-sm text-white/60">Keywords</div>
                        </div>
                      </div>

                      <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="bg-white/10 border-white/20 grid grid-cols-4">
                          <TabsTrigger value="overview" className="text-white data-[state=active]:bg-purple-600">
                            Overview
                          </TabsTrigger>
                          <TabsTrigger value="serp" className="text-white data-[state=active]:bg-purple-600">
                            SERP Analysis
                          </TabsTrigger>
                          <TabsTrigger value="content" className="text-white data-[state=active]:bg-purple-600">
                            Content Ideas
                          </TabsTrigger>
                          <TabsTrigger value="analysis" className="text-white data-[state=active]:bg-purple-600">
                            Deep Analysis
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-6 space-y-4">
                          <div>
                            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                              <Tag className="h-4 w-4 text-blue-400" />
                              Primary Keywords
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedCluster.keywords.map((keyword, index) => (
                                <Badge 
                                  key={index} 
                                  className="bg-blue-500/20 text-blue-300 border-blue-500/30"
                                >
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4 text-yellow-400" />
                              Content Ideas ({selectedCluster.contentIdeas.length})
                            </h4>
                            <div className="space-y-2">
                              {selectedCluster.contentIdeas.map((idea, index) => (
                                <div 
                                  key={index}
                                  className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-colors"
                                >
                                  <span className="text-white/90 text-sm">{idea}</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-white"
                                  >
                                    <ArrowRight className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="serp" className="mt-6">
                          {selectedCluster.serpData ? (
                            <SerpIntegrationPanel
                              keyword={selectedCluster.mainKeyword}
                              initialData={selectedCluster.serpData}
                            />
                          ) : (
                            <div className="text-center py-12">
                              <Globe className="h-12 w-12 text-white/40 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-white/60 mb-2">No SERP Data</h3>
                              <p className="text-white/40 text-sm mb-4">
                                Click "Refresh SERP" to analyze this keyword
                              </p>
                              <Button
                                onClick={() => analyzeKeyword(selectedCluster.mainKeyword)}
                                disabled={isAnalyzing}
                                className="bg-gradient-to-r from-purple-600 to-blue-600"
                              >
                                {isAnalyzing ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Analyzing...
                                  </>
                                ) : (
                                  <>
                                    <Brain className="h-4 w-4 mr-2" />
                                    Analyze SERP
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="content" className="mt-6">
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-white flex items-center gap-2">
                                <FileText className="h-4 w-4 text-green-400" />
                                Content Creation
                              </h4>
                              <Button 
                                className="bg-gradient-to-r from-green-600 to-emerald-600"
                                onClick={() => {
                                  // This would navigate to content builder with this cluster data
                                  toast.success('Opening Content Builder with cluster data...');
                                }}
                              >
                                <Zap className="h-4 w-4 mr-2" />
                                Create Content
                              </Button>
                            </div>
                            
                            <div className="grid gap-4">
                              {selectedCluster.contentIdeas.map((idea, index) => (
                                <Card key={index} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <h5 className="font-medium text-white mb-1">{idea}</h5>
                                        <p className="text-sm text-white/60">
                                          Content pillar based on SERP analysis
                                        </p>
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                      >
                                        <ArrowRight className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="analysis" className="mt-6">
                          <ClusterAnalysisCard 
                            cluster={selectedCluster}
                            serpData={selectedCluster.serpData}
                          />
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-24"
                >
                  <Target className="h-16 w-16 text-white/40 mx-auto mb-6" />
                  <h3 className="text-2xl font-medium text-white/60 mb-4">Select a Topic Cluster</h3>
                  <p className="text-white/40 text-lg">
                    Choose a cluster from the left to view detailed analysis and SERP data
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ContentBuilderProvider>
  );
}
