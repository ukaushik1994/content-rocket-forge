import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Network, Plus, Target, BarChart3, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const TopicClusters = () => {
  const [clusterName, setClusterName] = useState('');
  const [selectedCluster, setSelectedCluster] = useState(null);

  const sampleClusters = [
    {
      id: 1,
      name: "Content Marketing",
      pillarPage: "Ultimate Guide to Content Marketing",
      subTopics: [
        "Content Strategy Planning",
        "Content Creation Tools",
        "Content Distribution",
        "Content Performance Metrics",
        "Video Content Marketing",
        "Blog Content Optimization"
      ],
      keywords: 156,
      difficulty: "Medium",
      traffic: "45,000"
    },
    {
      id: 2,
      name: "SEO Optimization",
      pillarPage: "Complete SEO Guide for 2024",
      subTopics: [
        "Keyword Research",
        "On-Page SEO",
        "Technical SEO",
        "Link Building",
        "Local SEO",
        "SEO Tools"
      ],
      keywords: 203,
      difficulty: "High",
      traffic: "67,000"
    },
    {
      id: 3,
      name: "Social Media Marketing",
      pillarPage: "Social Media Marketing Mastery",
      subTopics: [
        "Instagram Marketing",
        "LinkedIn Strategy",
        "Facebook Advertising",
        "Twitter Engagement",
        "TikTok Content",
        "Social Analytics"
      ],
      keywords: 89,
      difficulty: "Low",
      traffic: "23,000"
    }
  ];

  const handleCreateCluster = () => {
    if (!clusterName.trim()) {
      toast.error("Please enter a cluster name");
      return;
    }
    toast.success("Topic cluster created successfully!");
    setClusterName('');
  };

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
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gradient">Topic Clusters</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Organize your content into strategic topic clusters for better SEO and user experience
            </p>
          </div>

          {/* Create New Cluster */}
          <Card className="glass-panel border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-neon-blue" />
                Create New Topic Cluster
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Enter cluster topic (e.g., Content Marketing)"
                  value={clusterName}
                  onChange={(e) => setClusterName(e.target.value)}
                  className="bg-glass border-white/10"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateCluster()}
                />
                <Button onClick={handleCreateCluster}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Cluster
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing Clusters */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Your Topic Clusters</h2>
            <div className="grid gap-6">
              {sampleClusters.map((cluster) => (
                <Card 
                  key={cluster.id}
                  className={`glass-panel border-white/10 cursor-pointer transition-all hover:border-neon-blue/30 ${
                    selectedCluster === cluster.id ? 'border-neon-blue' : ''
                  }`}
                  onClick={() => setSelectedCluster(selectedCluster === cluster.id ? null : cluster.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Network className="h-6 w-6 text-neon-blue" />
                          <h3 className="text-xl font-semibold text-white">{cluster.name}</h3>
                          <Badge variant={cluster.difficulty === 'Low' ? 'default' : cluster.difficulty === 'Medium' ? 'secondary' : 'destructive'}>
                            {cluster.difficulty}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">
                          Pillar Page: {cluster.pillarPage}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-neon-blue">{cluster.keywords}</div>
                        <div className="text-sm text-muted-foreground">Keywords</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-neon-purple">{cluster.subTopics.length}</div>
                        <div className="text-sm text-muted-foreground">Sub-topics</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-neon-green">{cluster.traffic}</div>
                        <div className="text-sm text-muted-foreground">Monthly Traffic</div>
                      </div>
                    </div>

                    {selectedCluster === cluster.id && (
                      <div className="space-y-4 border-t border-white/10 pt-4">
                        <h4 className="font-semibold text-white flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Sub-topics in this cluster:
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {cluster.subTopics.map((topic, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-glass rounded-lg border border-white/10">
                              <span className="text-white text-sm">{topic}</span>
                              <Button size="sm" variant="outline">
                                Edit
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Analytics
                          </Button>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Sub-topic
                          </Button>
                          <Button variant="outline" size="sm">
                            <Users className="h-4 w-4 mr-2" />
                            Content Calendar
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Cluster Opportunities */}
          <Card className="glass-panel border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-neon-green" />
                Cluster Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-6 bg-glass rounded-lg border border-white/10">
                    <Target className="h-8 w-8 text-neon-blue mx-auto mb-2" />
                    <h4 className="font-semibold text-white mb-1">Email Marketing</h4>
                    <p className="text-sm text-muted-foreground mb-2">High opportunity cluster</p>
                    <Badge variant="default">156 keywords available</Badge>
                  </div>
                  <div className="text-center p-6 bg-glass rounded-lg border border-white/10">
                    <Users className="h-8 w-8 text-neon-purple mx-auto mb-2" />
                    <h4 className="font-semibold text-white mb-1">Influencer Marketing</h4>
                    <p className="text-sm text-muted-foreground mb-2">Medium opportunity cluster</p>
                    <Badge variant="secondary">89 keywords available</Badge>
                  </div>
                  <div className="text-center p-6 bg-glass rounded-lg border border-white/10">
                    <BarChart3 className="h-8 w-8 text-neon-green mx-auto mb-2" />
                    <h4 className="font-semibold text-white mb-1">Marketing Analytics</h4>
                    <p className="text-sm text-muted-foreground mb-2">Low competition cluster</p>
                    <Badge variant="default">203 keywords available</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TopicClusters;
