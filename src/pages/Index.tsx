
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { StatCard } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FeedbackDialog } from '@/components/feedback/FeedbackDialog';
import { 
  RocketIcon, 
  Search, 
  BarChart3, 
  Fingerprint, 
  TrendingUp,
  UserRoundPlus,
  Sparkles,
  FileText,
  MessageCircle,
  FileUp,
  ArrowRight,
} from 'lucide-react';

const Index = () => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="space-y-8">
          {/* Hero section */}
          <div className="relative overflow-hidden rounded-xl p-8 glass-panel shadow-neon">
            <div className="absolute inset-0 futuristic-grid opacity-20" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="space-y-4 max-w-lg">
                <h1 className="text-3xl md:text-4xl font-bold animate-pulse-glow">
                  <span className="text-gradient">AI-Powered SEO</span> Content Builder
                </h1>
                <p className="text-muted-foreground">
                  Generate high-ranking, conversion-driven content by integrating real-time SERP data, 
                  keyword clusters, and business solutions.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
                    onClick={() => navigate('/content')}
                  >
                    New Project
                    <RocketIcon className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="neon-border" onClick={() => setFeedbackOpen(true)}>
                    Share Feedback
                    <MessageCircle className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="w-full max-w-xs flex items-center justify-center animate-float">
                <div className="relative">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-neon-purple via-neon-blue to-neon-pink opacity-20 blur-xl absolute" />
                  <div className="w-40 h-40 rounded-full bg-glass flex items-center justify-center relative z-10">
                    <Sparkles className="h-16 w-16 text-primary animate-pulse-glow" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Projects" 
              value="12" 
              description="2 active workflows"
              icon={<FileText className="h-4 w-4" />}
              trend={{ value: 33, positive: true }}
            />
            <StatCard 
              title="Keywords Analyzed" 
              value="284" 
              description="Last 30 days"
              icon={<Search className="h-4 w-4" />}
              trend={{ value: 12, positive: true }}
            />
            <StatCard 
              title="Average SEO Score" 
              value="78/100" 
              description="Across all content"
              icon={<BarChart3 className="h-4 w-4" />}
              trend={{ value: 5, positive: true }}
            />
            <StatCard 
              title="Conversions" 
              value="5.4%" 
              description="From content links"
              icon={<Fingerprint className="h-4 w-4" />}
              trend={{ value: 2, positive: false }}
            />
          </div>
          
          {/* Quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="glass-panel bg-glass hover:shadow-neon transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-gradient">Keyword Research</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Discover high-value keywords and group them into strategic clusters.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full justify-between group"
                  onClick={() => navigate('/keywords')}
                >
                  <span>Start Research</span>
                  <Search className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
            
            <Card className="glass-panel bg-glass hover:shadow-neon transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-gradient">Content Creation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Generate optimized content with AI that ranks well on search engines.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full justify-between group"
                  onClick={() => navigate('/content')}
                >
                  <span>Create Content</span>
                  <FileText className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
            
            <Card className="glass-panel bg-glass hover:shadow-neon transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-gradient">Solution Upload</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload your products and services to include in generated content.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full justify-between group"
                  onClick={() => navigate('/solutions')}
                >
                  <span>Upload Solutions</span>
                  <FileUp className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent projects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Recent Projects</h2>
              <Button variant="link" className="text-primary" onClick={() => navigate('/content')}>
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { 
                  title: "Best Project Management Software", 
                  status: "Published", 
                  score: 92, 
                  date: "Apr 28, 2025",
                  clicks: 487,
                  impressions: 5240
                },
                { 
                  title: "Email Marketing Platforms Comparison", 
                  status: "Draft", 
                  score: 78, 
                  date: "Apr 25, 2025", 
                  clicks: 0, 
                  impressions: 0 
                },
                { 
                  title: "Top CRM Solutions for SMBs", 
                  status: "In Progress", 
                  score: 65, 
                  date: "Apr 22, 2025",
                  clicks: 0,
                  impressions: 0
                },
              ].map((project, index) => (
                <Card key={index} className="glass-panel">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{project.title}</h3>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        project.status === 'Published' ? 'bg-green-500/20 text-green-500' :
                        project.status === 'Draft' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-blue-500/20 text-blue-500'
                      }`}>
                        {project.status}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">SEO Score</span>
                        <span className="font-medium">{project.score}/100</span>
                      </div>
                      
                      {project.status === 'Published' && (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="space-y-1">
                            <span className="block text-muted-foreground text-xs">Clicks</span>
                            <div className="flex items-center gap-1">
                              <span>{project.clicks}</span>
                              <TrendingUp className="h-3 w-3 text-green-500" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="block text-muted-foreground text-xs">Impressions</span>
                            <div className="flex items-center gap-1">
                              <span>{project.impressions}</span>
                              <TrendingUp className="h-3 w-3 text-green-500" />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        Last updated: {project.date}
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => navigate('/content')}
                    >
                      {project.status === 'Published' ? 'View Stats' : 'Continue Editing'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      {/* Feedback dialog */}
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </div>
  );
};

export default Index;
