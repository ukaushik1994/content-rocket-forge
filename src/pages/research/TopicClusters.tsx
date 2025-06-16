
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Network, Plus, Target, BarChart3, Users, TrendingUp, Search, Filter, Calendar, Edit, Eye, Globe } from 'lucide-react';
import { toast } from 'sonner';

const TopicClusters = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCluster, setSelectedCluster] = useState(null);

  const metrics = {
    totalClusters: 12,
    publishedPages: 34,
    monthlyTraffic: "156K",
    averageRanking: 8.5
  };

  const sampleClusters = [
    {
      id: 1,
      name: "Content Marketing",
      mainKeyword: "content marketing strategy",
      status: "Published",
      completion: 85,
      subTopics: 8,
      keywordVolume: "45,000",
      difficulty: 65,
      monthlyTraffic: "32K",
      lastUpdated: "2 days ago",
      pillarPage: "Ultimate Guide to Content Marketing 2024",
      subTopicsList: [
        "Content Strategy Planning",
        "Content Creation Tools",
        "Content Distribution",
        "Content Performance Metrics"
      ]
    },
    {
      id: 2,
      name: "SEO Optimization",
      mainKeyword: "SEO optimization techniques",
      status: "In Progress",
      completion: 60,
      subTopics: 12,
      keywordVolume: "67,000",
      difficulty: 78,
      monthlyTraffic: "28K",
      lastUpdated: "1 day ago",
      pillarPage: "Complete SEO Guide for 2024",
      subTopicsList: [
        "Keyword Research",
        "On-Page SEO",
        "Technical SEO",
        "Link Building"
      ]
    },
    {
      id: 3,
      name: "Social Media Marketing",
      mainKeyword: "social media marketing strategy",
      status: "Draft",
      completion: 25,
      subTopics: 6,
      keywordVolume: "23,000",
      difficulty: 45,
      monthlyTraffic: "12K",
      lastUpdated: "5 days ago",
      pillarPage: "Social Media Marketing Mastery Guide",
      subTopicsList: [
        "Instagram Marketing",
        "LinkedIn Strategy",
        "Facebook Advertising"
      ]
    },
    {
      id: 4,
      name: "Email Marketing",
      mainKeyword: "email marketing best practices",
      status: "Published",
      completion: 100,
      subTopics: 10,
      keywordVolume: "34,000",
      difficulty: 55,
      monthlyTraffic: "41K",
      lastUpdated: "1 week ago",
      pillarPage: "Email Marketing Complete Guide",
      subTopicsList: [
        "Email Automation",
        "List Building",
        "Email Design",
        "A/B Testing"
      ]
    }
  ];

  const bestPractices = [
    {
      icon: Network,
      title: "Pillar-Hub Structure",
      description: "Create comprehensive pillar pages with supporting cluster content that links back to the main topic."
    },
    {
      icon: Target,
      title: "Strategic Interlinking",
      description: "Build internal links between cluster content and pillar pages to boost topical authority."
    },
    {
      icon: BarChart3,
      title: "Comprehensive Coverage",
      description: "Cover all aspects of your topic cluster to become the go-to resource in your niche."
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty < 40) return 'text-green-600';
    if (difficulty < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleCreateCluster = () => {
    toast.success("Create cluster dialog would open here");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>Topic Clusters | Research Platform</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Topic Clusters</h1>
                <p className="text-gray-600 mt-2">Organize your content into strategic topic clusters for better SEO performance</p>
              </div>
              <Button onClick={handleCreateCluster} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Cluster
              </Button>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Clusters</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.totalClusters}</p>
                    </div>
                    <Network className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Published Pages</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.publishedPages}</p>
                    </div>
                    <Globe className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Monthly Traffic</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.monthlyTraffic}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Ranking</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.averageRanking}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search clusters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-200"
                />
              </div>
              <Button variant="outline" className="border-gray-200">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          {/* Clusters Grid */}
          <div className="grid gap-6">
            {sampleClusters.map((cluster) => (
              <Card key={cluster.id} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{cluster.name}</h3>
                          <Badge className={`${getStatusColor(cluster.status)} border`}>
                            {cluster.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm">Main keyword: <span className="font-medium">{cluster.mainKeyword}</span></p>
                        <p className="text-gray-500 text-xs mt-1">Last updated {cluster.lastUpdated}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Completion</span>
                        <span className="font-medium">{cluster.completion}%</span>
                      </div>
                      <Progress value={cluster.completion} className="h-2" />
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{cluster.subTopics}</div>
                        <div className="text-xs text-gray-500">Sub-topics</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{cluster.keywordVolume}</div>
                        <div className="text-xs text-gray-500">Monthly Volume</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${getDifficultyColor(cluster.difficulty)}`}>{cluster.difficulty}</div>
                        <div className="text-xs text-gray-500">Difficulty</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{cluster.monthlyTraffic}</div>
                        <div className="text-xs text-gray-500">Traffic</div>
                      </div>
                    </div>

                    {/* Pillar Page */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Pillar Page:</p>
                      <p className="font-medium text-gray-900">{cluster.pillarPage}</p>
                    </div>

                    {/* Sub-topics Preview */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Sub-topics:</p>
                      <div className="flex flex-wrap gap-2">
                        {cluster.subTopicsList.map((topic, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                        {cluster.subTopics > cluster.subTopicsList.length && (
                          <Badge variant="outline" className="text-xs">
                            +{cluster.subTopics - cluster.subTopicsList.length} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <Button size="sm" variant="outline">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                      </Button>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Content
                      </Button>
                      <Button size="sm" variant="outline">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Best Practices Section */}
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Topic Cluster Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {bestPractices.map((practice, index) => (
                  <div key={index} className="text-center space-y-3">
                    <div className="flex justify-center">
                      <practice.icon className="h-12 w-12 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">{practice.title}</h4>
                    <p className="text-sm text-gray-600">{practice.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TopicClusters;
