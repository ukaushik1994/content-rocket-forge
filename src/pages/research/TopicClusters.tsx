
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, 
  Plus, 
  Search, 
  TrendingUp, 
  BarChart3, 
  Target,
  Lightbulb,
  Zap,
  Eye,
  Edit,
  Loader2,
  ArrowRight,
  Globe,
  Clock,
  Users,
  BookOpen,
  Sparkles,
  Brain,
  PenTool
} from 'lucide-react';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { SerpAnalysisResult } from '@/types/serp';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface TopicCluster {
  id: string;
  name: string;
  mainKeyword: string;
  keywords: string[];
  searchVolume: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  competition: number;
  pillarContent?: string;
  subTopics: Array<{
    title: string;
    searchVolume: number;
    difficulty: string;
    contentGap: boolean;
  }>;
  serpData?: SerpAnalysisResult;
  createdAt: Date;
  status: 'draft' | 'analyzing' | 'ready' | 'published';
}

const TopicClusters = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCluster, setSelectedCluster] = useState<TopicCluster | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newClusterKeyword, setNewClusterKeyword] = useState('');
  const [clusters, setClusters] = useState<TopicCluster[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const { setMainKeyword, navigateToStep } = useContentBuilder();
  const navigate = useNavigate();

  // Mock data for demonstration
  const mockClusters: TopicCluster[] = [
    {
      id: '1',
      name: 'Content Marketing Fundamentals',
      mainKeyword: 'content marketing',
      keywords: ['content strategy', 'content creation', 'content planning', 'content calendar'],
      searchVolume: 45000,
      difficulty: 'Medium',
      competition: 0.68,
      pillarContent: 'The Complete Guide to Content Marketing',
      subTopics: [
        { title: 'Content Strategy', searchVolume: 18000, difficulty: 'Medium', contentGap: false },
        { title: 'Content Creation Tools', searchVolume: 12000, difficulty: 'Easy', contentGap: true },
        { title: 'Content Distribution', searchVolume: 8500, difficulty: 'Hard', contentGap: true },
        { title: 'Content Analytics', searchVolume: 6200, difficulty: 'Medium', contentGap: false }
      ],
      createdAt: new Date('2024-01-15'),
      status: 'ready'
    },
    {
      id: '2',
      name: 'SEO Optimization Cluster',
      mainKeyword: 'SEO optimization',
      keywords: ['keyword research', 'on-page SEO', 'technical SEO', 'link building'],
      searchVolume: 67000,
      difficulty: 'Hard',
      competition: 0.82,
      pillarContent: 'SEO Optimization Guide 2024',
      subTopics: [
        { title: 'Keyword Research Tools', searchVolume: 25000, difficulty: 'Medium', contentGap: false },
        { title: 'Technical SEO Audit', searchVolume: 15000, difficulty: 'Hard', contentGap: true },
        { title: 'Local SEO', searchVolume: 22000, difficulty: 'Medium', contentGap: false },
        { title: 'SEO Analytics', searchVolume: 11000, difficulty: 'Easy', contentGap: true }
      ],
      createdAt: new Date('2024-01-20'),
      status: 'published'
    },
    {
      id: '3',
      name: 'Social Media Strategy',
      mainKeyword: 'social media marketing',
      keywords: ['social media strategy', 'social content', 'social media analytics'],
      searchVolume: 28000,
      difficulty: 'Easy',
      competition: 0.45,
      subTopics: [
        { title: 'Social Media Content Calendar', searchVolume: 8500, difficulty: 'Easy', contentGap: true },
        { title: 'Social Media Automation', searchVolume: 6200, difficulty: 'Medium', contentGap: true },
        { title: 'Influencer Marketing', searchVolume: 14000, difficulty: 'Hard', contentGap: false }
      ],
      createdAt: new Date('2024-01-25'),
      status: 'analyzing'
    }
  ];

  useEffect(() => {
    setClusters(mockClusters);
  }, []);

  const handleAnalyzeCluster = async (cluster: TopicCluster) => {
    setIsAnalyzing(cluster.id);
    try {
      const serpData = await analyzeKeywordSerp(cluster.mainKeyword);
      if (serpData) {
        setClusters(prev => prev.map(c => 
          c.id === cluster.id 
            ? { ...c, serpData, status: 'ready' as const }
            : c
        ));
        toast.success(`Analysis complete for "${cluster.name}"`);
      }
    } catch (error) {
      toast.error('Failed to analyze cluster');
    } finally {
      setIsAnalyzing(null);
    }
  };

  const handleCreateContent = (cluster: TopicCluster) => {
    setMainKeyword(cluster.mainKeyword);
    navigateToStep(1);
    navigate('/content-builder');
    toast.success(`Starting content creation for "${cluster.name}"`);
  };

  const handleCreateCluster = async () => {
    if (!newClusterKeyword.trim()) return;
    
    const newCluster: TopicCluster = {
      id: Date.now().toString(),
      name: `${newClusterKeyword.charAt(0).toUpperCase() + newClusterKeyword.slice(1)} Cluster`,
      mainKeyword: newClusterKeyword,
      keywords: [newClusterKeyword],
      searchVolume: 0,
      difficulty: 'Medium',
      competition: 0,
      subTopics: [],
      createdAt: new Date(),
      status: 'analyzing'
    };

    setClusters(prev => [newCluster, ...prev]);
    setShowCreateDialog(false);
    setNewClusterKeyword('');
    
    // Auto-analyze the new cluster
    setTimeout(() => handleAnalyzeCluster(newCluster), 500);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'Hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-400 bg-green-500/20';
      case 'ready': return 'text-blue-400 bg-blue-500/20';
      case 'analyzing': return 'text-yellow-400 bg-yellow-500/20';
      case 'draft': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const filteredClusters = clusters.filter(cluster =>
    cluster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cluster.mainKeyword.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <Helmet>
        <title>Topic Clusters | AI Content Research</title>
      </Helmet>
      
      <Navbar />
      
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-5" 
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
      </div>
      
      <main className="flex-1 container py-8 z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex justify-center">
                <div className="p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl backdrop-blur-sm border border-white/10">
                  <Network className="h-12 w-12 text-purple-400 animate-pulse" />
                </div>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                Topic Clusters
              </h1>
              <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
                Organize your content strategy with AI-powered topic clusters and real-time SERP insights
              </p>
            </motion.div>

            {/* Search and Create */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex gap-4 max-w-2xl mx-auto"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Search topics or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 backdrop-blur-sm focus:bg-white/15 transition-all"
                />
              </div>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Cluster
              </Button>
            </motion.div>
          </div>

          {/* Stats Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            {[
              { icon: Network, label: 'Total Clusters', value: clusters.length, color: 'from-purple-500/20 to-pink-500/20' },
              { icon: Target, label: 'Ready Clusters', value: clusters.filter(c => c.status === 'ready').length, color: 'from-blue-500/20 to-cyan-500/20' },
              { icon: TrendingUp, label: 'Avg. Volume', value: `${Math.round(clusters.reduce((acc, c) => acc + c.searchVolume, 0) / clusters.length || 0).toLocaleString()}`, color: 'from-green-500/20 to-emerald-500/20' },
              { icon: BarChart3, label: 'Published', value: clusters.filter(c => c.status === 'published').length, color: 'from-orange-500/20 to-red-500/20' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/60">{stat.label}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                      </div>
                      <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Clusters Grid */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="space-y-6"
          >
            <AnimatePresence>
              {filteredClusters.map((cluster, index) => (
                <motion.div
                  key={cluster.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <Card className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border-white/20 hover:border-purple-400/40 transition-all duration-300 overflow-hidden">
                    <CardContent className="p-8">
                      <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
                                {cluster.name}
                              </h3>
                              <Badge className={`${getStatusColor(cluster.status)} border-0`}>
                                {cluster.status}
                              </Badge>
                            </div>
                            <p className="text-purple-300 font-mono text-lg">{cluster.mainKeyword}</p>
                            <div className="flex items-center gap-4 text-sm text-white/60">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {cluster.createdAt.toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {cluster.subTopics.length} subtopics
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedCluster(cluster)}
                              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            {cluster.status === 'draft' && (
                              <Button 
                                size="sm"
                                onClick={() => handleAnalyzeCluster(cluster)}
                                disabled={isAnalyzing === cluster.id}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
                              >
                                {isAnalyzing === cluster.id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Brain className="h-4 w-4 mr-2" />
                                )}
                                Analyze
                              </Button>
                            )}
                            {cluster.status === 'ready' && (
                              <Button 
                                size="sm"
                                onClick={() => handleCreateContent(cluster)}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0"
                              >
                                <PenTool className="h-4 w-4 mr-2" />
                                Create Content
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="text-sm text-white/60">Search Volume</div>
                            <div className="text-xl font-bold text-blue-400">{cluster.searchVolume.toLocaleString()}</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="text-sm text-white/60">Difficulty</div>
                            <Badge className={`${getDifficultyColor(cluster.difficulty)} mt-1`}>
                              {cluster.difficulty}
                            </Badge>
                          </div>
                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="text-sm text-white/60">Competition</div>
                            <div className="text-xl font-bold text-yellow-400">{Math.round(cluster.competition * 100)}%</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="text-sm text-white/60">Content Gaps</div>
                            <div className="text-xl font-bold text-red-400">
                              {cluster.subTopics.filter(t => t.contentGap).length}
                            </div>
                          </div>
                        </div>

                        {/* Keywords Preview */}
                        <div className="space-y-2">
                          <div className="text-sm text-white/60">Related Keywords</div>
                          <div className="flex flex-wrap gap-2">
                            {cluster.keywords.slice(0, 6).map((keyword, idx) => (
                              <Badge key={idx} variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-300">
                                {keyword}
                              </Badge>
                            ))}
                            {cluster.keywords.length > 6 && (
                              <Badge variant="outline" className="bg-white/10 border-white/20 text-white/60">
                                +{cluster.keywords.length - 6} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Empty State */}
          {filteredClusters.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full w-20 h-20 mx-auto mb-6">
                <Network className="h-12 w-12 text-purple-400 mx-auto mt-2" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No clusters found</h3>
              <p className="text-white/60 mb-6">Create your first topic cluster to get started</p>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Cluster
              </Button>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Create Cluster Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-xl border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Create New Topic Cluster
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/80 mb-2 block">Main Keyword</label>
              <Input
                placeholder="Enter main keyword (e.g., 'digital marketing')"
                value={newClusterKeyword}
                onChange={(e) => setNewClusterKeyword(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateCluster()}
              />
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleCreateCluster}
                disabled={!newClusterKeyword.trim()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Brain className="h-4 w-4 mr-2" />
                Create & Analyze
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cluster Details Dialog */}
      {selectedCluster && (
        <Dialog open={!!selectedCluster} onOpenChange={() => setSelectedCluster(null)}>
          <DialogContent className="max-w-4xl bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-xl border-white/20 max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Network className="h-5 w-5 text-purple-400" />
                {selectedCluster.name}
              </DialogTitle>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="bg-white/10 border-white/20">
                <TabsTrigger value="overview" className="text-white data-[state=active]:bg-purple-600">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="subtopics" className="text-white data-[state=active]:bg-purple-600">
                  Subtopics
                </TabsTrigger>
                <TabsTrigger value="serp" className="text-white data-[state=active]:bg-purple-600">
                  SERP Analysis
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-96">
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-white text-sm">Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Search Volume</span>
                          <span className="text-blue-400 font-bold">{selectedCluster.searchVolume.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Difficulty</span>
                          <Badge className={getDifficultyColor(selectedCluster.difficulty)}>{selectedCluster.difficulty}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Competition</span>
                          <span className="text-yellow-400">{Math.round(selectedCluster.competition * 100)}%</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-white text-sm">Progress</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60">Completion</span>
                            <span className="text-white">
                              {selectedCluster.status === 'published' ? '100%' : selectedCluster.status === 'ready' ? '75%' : '25%'}
                            </span>
                          </div>
                          <Progress 
                            value={selectedCluster.status === 'published' ? 100 : selectedCluster.status === 'ready' ? 75 : 25} 
                            className="h-2"
                          />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Status</span>
                          <Badge className={getStatusColor(selectedCluster.status)}>{selectedCluster.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-white/5 border-white/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-sm">Keywords</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedCluster.keywords.map((keyword, idx) => (
                          <Badge key={idx} variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-300">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="subtopics" className="space-y-4">
                  {selectedCluster.subTopics.map((subtopic, idx) => (
                    <Card key={idx} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium text-white">{subtopic.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-white/60">
                              <span>Volume: {subtopic.searchVolume.toLocaleString()}</span>
                              <Badge className={getDifficultyColor(subtopic.difficulty)} size="sm">
                                {subtopic.difficulty}
                              </Badge>
                              {subtopic.contentGap && (
                                <Badge className="text-red-400 bg-red-500/20">Gap</Badge>
                              )}
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setMainKeyword(subtopic.title);
                              navigateToStep(1);
                              navigate('/content-builder');
                              setSelectedCluster(null);
                            }}
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                          >
                            <PenTool className="h-4 w-4 mr-2" />
                            Create Content
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="serp" className="space-y-4">
                  {selectedCluster.serpData ? (
                    <div className="space-y-4">
                      <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                          <CardTitle className="text-white text-sm">SERP Insights</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="text-sm text-white/80">
                            Analysis completed with {selectedCluster.serpData.topResults?.length || 0} competitors analyzed
                          </div>
                          {selectedCluster.serpData.topResults?.slice(0, 3).map((result, idx) => (
                            <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10">
                              <div className="font-medium text-white text-sm">{result.title}</div>
                              <div className="text-xs text-white/60 mt-1">{result.snippet?.slice(0, 100)}...</div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Globe className="h-12 w-12 text-white/40 mx-auto mb-4" />
                      <p className="text-white/60">No SERP analysis available</p>
                      <Button 
                        className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        onClick={() => {
                          setSelectedCluster(null);
                          handleAnalyzeCluster(selectedCluster);
                        }}
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        Analyze Now
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TopicClusters;
