
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Network, 
  Plus, 
  Target, 
  BarChart3, 
  Search, 
  Zap, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  Brain,
  Lightbulb,
  BookOpen,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { TopicClusterCard } from '@/components/research/topic-clusters/TopicClusterCard';
import { CreateClusterModal } from '@/components/research/topic-clusters/CreateClusterModal';
import { ClusterDetailsModal } from '@/components/research/topic-clusters/ClusterDetailsModal';
import { SerpAnalysisPanel } from '@/components/research/topic-clusters/SerpAnalysisPanel';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { useClusters, useTopicPerformance } from '@/hooks/useResearchIntelligence';
import { dbRowToTopicCluster, ClusterPerformanceMetrics } from '@/types/topicCluster';

const TopicClusters = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState('');
  const [serpData, setSerpData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: dbRows, isLoading, refetch, create, remove } = useClusters();
  const { data: perfData } = useTopicPerformance();
  // Group perf data by cluster_id for per-cluster metrics
  const clusterPerfMap = React.useMemo(() => {
    const map: Record<string, { totalTraffic: number; avgPosition: number }> = {};
    if (!perfData) return map;
    const grouped: Record<string, { clicks: number; positions: number[]; }> = {};
    for (const p of perfData) {
      const cid = p.cluster_id;
      if (!cid) continue;
      if (!grouped[cid]) grouped[cid] = { clicks: 0, positions: [] };
      grouped[cid].clicks += p.clicks ?? 0;
      if (p.average_position != null) grouped[cid].positions.push(p.average_position);
    }
    for (const [cid, g] of Object.entries(grouped)) {
      map[cid] = {
        totalTraffic: g.clicks,
        avgPosition: g.positions.length > 0 ? g.positions.reduce((a, b) => a + b, 0) / g.positions.length : 0,
      };
    }
    return map;
  }, [perfData]);

  const clusters = (dbRows ?? []).map(row => dbRowToTopicCluster(row, clusterPerfMap[row.id]));

  // Derive metrics from clusters + real performance data
  const metrics: ClusterPerformanceMetrics = (() => {
    const totalClicks = perfData?.reduce((s, p) => s + (p.clicks ?? 0), 0) ?? 0;
    const positions = perfData?.filter(p => p.average_position != null) ?? [];
    const avgPos = positions.length > 0
      ? positions.reduce((s, p) => s + (p.average_position ?? 0), 0) / positions.length
      : 0;
    return {
      totalClusters: clusters.length,
      totalTraffic: totalClicks >= 1000 ? `${(totalClicks / 1000).toFixed(1)}K` : totalClicks.toString(),
      avgPosition: avgPos > 0 ? avgPos.toFixed(1) : '—',
      activeArticles: clusters.reduce((s, c) => s + c.articles, 0).toString(),
      monthlyGrowth: 0,
      topPerformingCluster: clusters[0]?.name || 'None',
    };
  })();

  const handleKeywordAnalysis = async (keyword: string) => {
    if (!keyword.trim()) return;
    
    setSelectedKeyword(keyword);
    setIsAnalyzing(true);
    
    try {
      const data = await analyzeKeywordSerp(keyword);
      setSerpData(data);
      toast.success(`Analysis complete for "${keyword}"`);
      setActiveTab('analysis');
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Failed to analyze keyword. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateCluster = async (formData: { name: string; mainKeyword: string; description?: string; keywords: string[]; targetAudience?: string; contentPillars?: string[] }) => {
    await create({
      cluster_name: formData.name,
      description: formData.description || null,
      importance_score: 0,
      topic_count: formData.keywords.length,
    } as any);
    setIsCreating(false);
    toast.success('Topic cluster created successfully!');
  };

  const handleEditCluster = (clusterId: string) => {
    toast.info('Edit functionality coming soon');
  };

  const handleDeleteCluster = async (clusterId: string) => {
    if (confirm('Are you sure you want to delete this cluster?')) {
      try {
        await remove(clusterId);
        toast.success('Cluster deleted successfully');
      } catch (error) {
        toast.error('Failed to delete cluster');
      }
    }
  };

  const handleViewDetails = (clusterId: string) => {
    setSelectedClusterId(clusterId);
    setIsDetailsOpen(true);
  };

  const handleCreateContent = (clusterId: string) => {
    const cluster = clusters.find(c => c.id === clusterId);
    if (cluster) {
      const clusterData = {
        mainKeyword: cluster.mainKeyword,
        keywords: cluster.keywords,
        clusterName: cluster.name,
        clusterId: cluster.id
      };
      localStorage.setItem('cluster_content_data', JSON.stringify(clusterData));
      window.location.href = '/ai-chat';
    }
  };

  const handleStoreForContentBuilder = (selections: any[]) => {
    if (selections.length > 0) {
      localStorage.setItem('pendingSerpSelections', JSON.stringify(selections));
      toast.success(`Stored ${selections.length} SERP items for content creation`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const metricsData = [
    { title: "Total Clusters", value: metrics.totalClusters, icon: Network, color: "text-blue-400", bgColor: "bg-blue-500/10" },
    { title: "Total Traffic", value: metrics.totalTraffic, icon: TrendingUp, color: "text-green-400", bgColor: "bg-green-500/10" },
    { title: "Avg. Position", value: metrics.avgPosition, icon: Target, color: "text-purple-400", bgColor: "bg-purple-500/10" },
    { title: "Active Articles", value: metrics.activeArticles, icon: BookOpen, color: "text-orange-400", bgColor: "bg-orange-500/10" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Helmet>
        <title>Topic Clusters | Creaiter</title>
      </Helmet>
      
      <div className="fixed inset-0 pt-20 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/5 rounded-full filter blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <main className="container mx-auto px-4 pt-24 pb-8 relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="text-center space-y-6">
            <div className="space-y-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-white/10"
              >
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AI-Powered Topic Research
                </span>
              </motion.div>
              
              <h1 className="text-4xl md:text-6xl font-bold">
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                  Topic Clusters
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Create strategic content clusters using real SERP data and AI insights
              </p>
            </div>

            <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
              <Card className="bg-white/5 backdrop-blur-md border-white/10 p-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Enter a keyword to analyze and build clusters around..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 bg-white/5 border-white/20 text-white placeholder-gray-400"
                      onKeyPress={(e) => e.key === 'Enter' && handleKeywordAnalysis(searchTerm)}
                    />
                  </div>
                  
                  <Button
                    onClick={() => handleKeywordAnalysis(searchTerm)}
                    disabled={!searchTerm.trim() || isAnalyzing}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                  >
                    {isAnalyzing ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="mr-2">
                          <Zap className="h-4 w-4" />
                        </motion.div>
                        Analyzing SERP Data...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Analyze with AI
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Metrics Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metricsData.map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 * index, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">{metric.title}</p>
                        <p className="text-2xl font-bold text-white">{metric.value}</p>
                      </div>
                      <div className={`p-3 rounded-full ${metric.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                        <metric.icon className={`h-6 w-6 ${metric.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Content Tabs */}
          <motion.div variants={itemVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-white/5 backdrop-blur-md border-white/10">
                <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600">
                  <Network className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="analysis" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  SERP Analysis
                </TabsTrigger>
                <TabsTrigger value="create" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Content
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Your Topic Clusters</h2>
                  <div className="flex gap-3">
                    <Button onClick={() => refetch()} variant="outline" size="sm" disabled={isLoading} className="border-white/20">
                      {isLoading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                          <RefreshCw className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                    <Button onClick={() => setIsCreating(true)} className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Cluster
                    </Button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="grid gap-6">
                    {[1, 2, 3].map(i => (
                      <Card key={i} className="bg-white/5 backdrop-blur-md border-white/10">
                        <CardContent className="p-6">
                          <div className="animate-pulse space-y-4">
                            <div className="h-6 bg-gray-700 rounded w-1/3"></div>
                            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                            <div className="h-2 bg-gray-700 rounded w-full"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-6">
                    <AnimatePresence>
                      {clusters.map((cluster, index) => (
                        <motion.div
                          key={cluster.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <TopicClusterCard
                            cluster={cluster}
                            onAnalyze={(keyword) => handleKeywordAnalysis(keyword)}
                            onEdit={handleEditCluster}
                            onDelete={handleDeleteCluster}
                            onViewDetails={handleViewDetails}
                            onCreateContent={handleCreateContent}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {clusters.length === 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                        <div className="space-y-4">
                          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                            <Network className="h-8 w-8 text-blue-400" />
                          </div>
                          <h3 className="text-xl font-medium text-white">No Clusters Yet</h3>
                          <p className="text-gray-400 max-w-md mx-auto">
                            Create your first topic cluster to start organizing your content strategy
                          </p>
                          <Button onClick={() => setIsCreating(true)} className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Cluster
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="analysis" className="space-y-6">
                <AnimatePresence mode="wait">
                  {selectedKeyword ? (
                    <motion.div key="analysis-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
                      <SerpAnalysisPanel keyword={selectedKeyword} serpData={serpData} isLoading={isAnalyzing} onStoreSelections={handleStoreForContentBuilder} />
                    </motion.div>
                  ) : (
                    <motion.div key="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
                      <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                          <BarChart3 className="h-8 w-8 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-medium text-white">No Analysis Yet</h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                          Enter a keyword in the search box above to get started with SERP analysis
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="create" className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <Card className="bg-white/5 backdrop-blur-md border-white/10 p-8 text-center">
                    <div className="space-y-6">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-full flex items-center justify-center">
                        <Lightbulb className="h-8 w-8 text-green-400" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white">Ready to Create Content?</h3>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                          Use your SERP analysis to create comprehensive content that ranks higher
                        </p>
                      </div>
                      <Button onClick={() => window.location.href = '/ai-chat'} className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 h-12 px-8">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Go to Content Builder
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </main>

      <CreateClusterModal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        onCreate={handleCreateCluster}
      />

      <ClusterDetailsModal
        cluster={clusters.find(c => c.id === selectedClusterId) || null}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedClusterId(null);
        }}
        onCreateContent={handleCreateContent}
      />
    </div>
  );
};

export default TopicClusters;
