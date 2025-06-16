
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Network, Plus, Target, BarChart3, Users, TrendingUp, Search, Filter, Calendar, Eye, Edit, Lightbulb, BookOpen, Zap } from 'lucide-react';
import { toast } from 'sonner';

const TopicClusters = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Enhanced sample data matching the reference
  const clusterData = [
    {
      id: 1,
      title: "Content Marketing Strategy",
      mainKeyword: "content marketing",
      status: "In Progress",
      completion: 75,
      subTopicsCount: 12,
      keywordVolume: "45K",
      difficulty: "Medium",
      lastUpdated: "2 days ago",
      pillarPage: "Ultimate Guide to Content Marketing",
      description: "Comprehensive content marketing strategies and best practices"
    },
    {
      id: 2,
      title: "SEO Optimization Techniques",
      mainKeyword: "SEO optimization",
      status: "Published",
      completion: 100,
      subTopicsCount: 18,
      keywordVolume: "67K",
      difficulty: "High",
      lastUpdated: "1 week ago",
      pillarPage: "Complete SEO Guide for 2024",
      description: "Advanced SEO techniques and optimization strategies"
    },
    {
      id: 3,
      title: "Social Media Marketing",
      mainKeyword: "social media marketing",
      status: "Draft",
      completion: 30,
      subTopicsCount: 8,
      keywordVolume: "23K",
      difficulty: "Low",
      lastUpdated: "3 days ago",
      pillarPage: "Social Media Marketing Mastery",
      description: "Complete social media marketing strategies across platforms"
    },
    {
      id: 4,
      title: "Email Marketing Automation",
      mainKeyword: "email marketing",
      status: "In Progress",
      completion: 60,
      subTopicsCount: 15,
      keywordVolume: "34K",
      difficulty: "Medium",
      lastUpdated: "1 day ago",
      pillarPage: "Email Marketing Automation Guide",
      description: "Advanced email marketing automation and personalization"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-neon-green text-black';
      case 'In Progress': return 'bg-neon-blue text-white';
      case 'Draft': return 'bg-orange-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const filteredClusters = clusterData.filter(cluster => {
    const matchesSearch = cluster.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cluster.mainKeyword.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || cluster.status.toLowerCase().replace(' ', '-') === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Helmet>
        <title>Topic Clusters | Research Platform</title>
      </Helmet>
      
      <Navbar />
      
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-neon-blue/10 rounded-full filter blur-3xl opacity-40"></div>
        <div className="absolute bottom-40 left-1/2 w-64 h-64 bg-neon-purple/10 rounded-full filter blur-3xl opacity-30"></div>
        <div className="futuristic-grid absolute inset-0 opacity-10"></div>
      </div>
      
      <main className="flex-1 container py-8 z-10 relative">
        <div className="space-y-8">
          {/* Enhanced Header */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gradient">Topic Clusters</h1>
                <p className="text-xl text-muted-foreground mt-2">
                  Organize your content into strategic topic clusters for better SEO
                </p>
              </div>
              <Button className="bg-neon-blue hover:bg-neon-blue/90">
                <Plus className="h-4 w-4 mr-2" />
                Create New Cluster
              </Button>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clusters or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-glass border-white/10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48 bg-glass border-white/10">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Metrics Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-panel border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Clusters</p>
                      <p className="text-3xl font-bold text-neon-blue">{clusterData.length}</p>
                    </div>
                    <Network className="h-8 w-8 text-neon-blue" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-panel border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Keywords</p>
                      <p className="text-3xl font-bold text-neon-green">169K</p>
                    </div>
                    <Target className="h-8 w-8 text-neon-green" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-panel border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Completion</p>
                      <p className="text-3xl font-bold text-neon-purple">66%</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-neon-purple" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Enhanced Cluster Cards */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Your Topic Clusters</h2>
            <div className="grid gap-6">
              {filteredClusters.map((cluster) => (
                <Card key={cluster.id} className="glass-panel border-white/10 hover:border-neon-blue/30 transition-all">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header Row */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-white">{cluster.title}</h3>
                            <Badge className={`${getStatusColor(cluster.status)} text-xs`}>
                              {cluster.status}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm">{cluster.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="border-white/20">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="border-white/20">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>

                      {/* Main Keyword and Progress */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Main Keyword</p>
                          <p className="text-lg font-semibold text-neon-blue">{cluster.mainKeyword}</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-muted-foreground">Completion</p>
                            <p className="text-sm font-medium text-white">{cluster.completion}%</p>
                          </div>
                          <Progress value={cluster.completion} className="h-2 bg-gray-700">
                            <div 
                              className="h-full bg-gradient-to-r from-neon-blue to-neon-purple rounded-full transition-all"
                              style={{ width: `${cluster.completion}%` }}
                            />
                          </Progress>
                        </div>
                      </div>

                      {/* Metrics Row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Sub-topics</p>
                          <p className="text-lg font-semibold text-white">{cluster.subTopicsCount}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Search Volume</p>
                          <p className="text-lg font-semibold text-neon-green">{cluster.keywordVolume}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Difficulty</p>
                          <Badge variant={cluster.difficulty === 'Low' ? 'default' : cluster.difficulty === 'Medium' ? 'secondary' : 'destructive'}>
                            {cluster.difficulty}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Last Updated</p>
                          <p className="text-sm text-white flex items-center justify-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {cluster.lastUpdated}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Best Practices Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Topic Cluster Best Practices</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-panel border-white/10">
                <CardContent className="p-6 text-center">
                  <Lightbulb className="h-12 w-12 text-neon-blue mx-auto mb-4" />
                  <h3 className="font-semibold text-white mb-2">Strategic Planning</h3>
                  <p className="text-sm text-muted-foreground">
                    Plan your topic clusters around high-value keywords and user intent to maximize SEO impact.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="glass-panel border-white/10">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-12 w-12 text-neon-green mx-auto mb-4" />
                  <h3 className="font-semibold text-white mb-2">Content Depth</h3>
                  <p className="text-sm text-muted-foreground">
                    Create comprehensive pillar pages with supporting content that covers all aspects of your topic.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="glass-panel border-white/10">
                <CardContent className="p-6 text-center">
                  <Zap className="h-12 w-12 text-neon-purple mx-auto mb-4" />
                  <h3 className="font-semibold text-white mb-2">Internal Linking</h3>
                  <p className="text-sm text-muted-foreground">
                    Build strong internal linking between cluster content to boost topical authority and rankings.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TopicClusters;
