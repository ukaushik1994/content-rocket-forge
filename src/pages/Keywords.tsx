
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { KeywordCluster } from '@/components/keywords/KeywordCluster';
import { KeywordResearchTool } from '@/components/keywords/KeywordResearchTool';
import { KeywordTrends } from '@/components/keywords/KeywordTrends';
import { KeywordCompetitors } from '@/components/keywords/KeywordCompetitors';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Filter, 
  DownloadCloud,
  Plus,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { ContentContext } from '@/contexts/ContentContext';

const Keywords = () => {
  const navigate = useNavigate();
  const { setSelectedKeywords } = useContext(ContentContext);
  const [activeTab, setActiveTab] = useState('research');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [animateTabs, setAnimateTabs] = useState(false);

  // Animation effect when changing tabs
  useEffect(() => {
    setAnimateTabs(true);
    const timer = setTimeout(() => setAnimateTabs(false), 300);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleCreateCluster = () => {
    toast.info("Creating a new keyword cluster", {
      description: "This feature will be available soon!"
    });
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      toast.success("Keywords exported successfully!", {
        description: "Your data has been exported to CSV."
      });
    }, 1500);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Keywords refreshed successfully!");
    }, 1500);
  };

  const handleUseKeyword = (keyword: string) => {
    // Add the keyword to the content editor via the context
    setSelectedKeywords(prev => [...prev, keyword]);
    toast.success(`Added "${keyword}" to your content keywords`, {
      action: {
        label: "Go to Content Editor",
        onClick: () => navigate("/content")
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-8 animate-fade-in">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gradient">Keyword Research</h1>
            <Button 
              className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple hover-scale transition-all duration-300"
              onClick={handleCreateCluster}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Keyword Cluster
            </Button>
          </div>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-secondary/30">
              <TabsTrigger value="research" className="transition-all duration-200 hover:bg-secondary/70">Research</TabsTrigger>
              <TabsTrigger value="clusters" className="transition-all duration-200 hover:bg-secondary/70">My Clusters</TabsTrigger>
              <TabsTrigger value="trends" className="transition-all duration-200 hover:bg-secondary/70">Trends</TabsTrigger>
              <TabsTrigger value="serp" className="transition-all duration-200 hover:bg-secondary/70">SERP Analysis</TabsTrigger>
              <TabsTrigger value="competitors" className="transition-all duration-200 hover:bg-secondary/70">Competitors</TabsTrigger>
            </TabsList>

            <TabsContent value="research" className={`mt-6 ${animateTabs ? 'animate-fade-in' : ''}`}>
              <Card className="glass-panel">
                <CardHeader className="pb-2">
                  <CardTitle>Keyword Research Tool</CardTitle>
                </CardHeader>
                <CardContent>
                  <KeywordResearchTool onUseKeyword={handleUseKeyword} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="clusters" className={`mt-6 ${animateTabs ? 'animate-fade-in' : ''}`}>
              <Card className="glass-panel">
                <CardHeader className="pb-2 flex justify-between items-center">
                  <CardTitle>Keyword Clusters</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search clusters..."
                        className="pl-9 bg-glass border-white/10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={filterValue} onValueChange={setFilterValue}>
                      <SelectTrigger className="bg-glass border-white/10 w-[160px] hover:border-white/20 transition-colors">
                        <SelectValue placeholder="All Clusters" />
                      </SelectTrigger>
                      <SelectContent className="bg-glass border-white/10">
                        <SelectItem value="all">All Clusters</SelectItem>
                        <SelectItem value="recent">Recently Updated</SelectItem>
                        <SelectItem value="high-volume">High Volume</SelectItem>
                        <SelectItem value="low-diff">Low Difficulty</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={() => toast.info("Advanced filters")} className="hover:bg-accent/50 transition-colors">
                      <Filter className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={handleExport}
                      disabled={isExporting}
                      className="hover:bg-accent/50 transition-colors"
                    >
                      {isExporting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <DownloadCloud className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 hover:bg-accent/30 transition-colors" 
                      onClick={handleRefresh}
                      disabled={isLoading}
                    >
                      <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <KeywordCluster 
                      primary="best project management software"
                      volume="12,000"
                      difficulty="Medium"
                      cpc="$1.50"
                      intent="Commercial"
                      secondaryKeywords={[
                        "project management tools",
                        "task management software",
                        "team collaboration tools"
                      ]}
                      semanticTerms={[
                        "Gantt charts",
                        "collaboration features",
                        "time tracking"
                      ]}
                      longTailKeywords={[
                        "best project management software for remote teams",
                        "affordable project management tools for startups",
                        "enterprise project management software comparison"
                      ]}
                      onUse={handleUseKeyword}
                    />
                    
                    <KeywordCluster 
                      primary="email marketing platforms"
                      volume="8,500"
                      difficulty="Medium"
                      cpc="$2.10"
                      intent="Commercial"
                      secondaryKeywords={[
                        "email marketing services",
                        "email automation tools",
                        "newsletter software"
                      ]}
                      semanticTerms={[
                        "drip campaigns",
                        "A/B testing",
                        "audience segmentation"
                      ]}
                      longTailKeywords={[
                        "best email marketing platforms for small business",
                        "affordable email marketing software",
                        "email marketing platforms with automation"
                      ]}
                      onUse={handleUseKeyword}
                    />
                    
                    <KeywordCluster 
                      primary="CRM software"
                      volume="18,000"
                      difficulty="High"
                      cpc="$3.25"
                      intent="Transactional"
                      secondaryKeywords={[
                        "customer relationship management",
                        "sales CRM",
                        "contact management software"
                      ]}
                      semanticTerms={[
                        "lead scoring",
                        "pipeline management",
                        "sales analytics"
                      ]}
                      longTailKeywords={[
                        "best CRM software for small business",
                        "free CRM tools for startups",
                        "enterprise CRM comparison"
                      ]}
                      onUse={handleUseKeyword}
                    />
                    
                    <KeywordCluster 
                      primary="digital marketing strategies"
                      volume="9,200"
                      difficulty="Low"
                      cpc="$1.85"
                      intent="Informational"
                      secondaryKeywords={[
                        "online marketing tactics",
                        "digital marketing tips",
                        "marketing strategy guide"
                      ]}
                      semanticTerms={[
                        "SEO",
                        "content marketing",
                        "social media"
                      ]}
                      longTailKeywords={[
                        "digital marketing strategies for small business",
                        "B2B digital marketing strategies",
                        "effective digital marketing strategies 2025"
                      ]}
                      onUse={handleUseKeyword}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className={`mt-6 ${animateTabs ? 'animate-fade-in' : ''}`}>
              <Card className="glass-panel">
                <CardHeader className="pb-2">
                  <CardTitle>Keyword Trends Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <KeywordTrends onUseKeyword={handleUseKeyword} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="serp" className={`mt-6 ${animateTabs ? 'animate-fade-in' : ''}`}>
              <Card className="glass-panel">
                <CardHeader className="pb-2 flex justify-between items-center">
                  <CardTitle>SERP Analysis</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 hover:bg-accent/50 transition-colors"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filter Results
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Top Competitor Content Structure</h3>
                      <div className="space-y-4">
                        {[
                          { title: "Common H1 Pattern", content: "[Number] Best [Keyword] for [Target] in [Year]" },
                          { title: "Average Word Count", content: "2,500 words" },
                          { title: "Common Sections", content: "Introduction, Top Products, Comparison Table, Features, Pricing, FAQ" }
                        ].map((item, i) => (
                          <div key={i} className="space-y-1 hover:translate-x-1 transition-transform duration-200">
                            <h4 className="text-sm font-medium">{item.title}</h4>
                            <p className="text-sm text-muted-foreground bg-glass p-2 rounded-md border border-white/10 hover:border-white/20 transition-colors">
                              {item.content}
                            </p>
                          </div>
                        ))}
                      </div>
                      <Button 
                        variant="ghost" 
                        className="mt-4 hover:text-primary transition-colors"
                        onClick={() => {
                          navigate('/content');
                          toast.success("Content template applied!");
                        }}
                      >
                        <span>Use Content Structure</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">People Also Ask Questions</h3>
                      <div className="space-y-2">
                        {[
                          "What is the easiest project management tool for beginners?",
                          "Which project management software is best for remote teams?",
                          "Is there a free project management tool?",
                          "How much does project management software cost?",
                          "What's better than Asana for project management?"
                        ].map((question, i) => (
                          <div 
                            key={i} 
                            className="p-3 bg-glass rounded-md border border-white/10 hover:border-white/20 transition-all duration-200 hover:translate-x-1 cursor-pointer"
                            onClick={() => {
                              handleUseKeyword(question);
                            }}
                          >
                            <p className="text-sm">
                              <span className="text-primary font-medium">Q:</span> {question}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="competitors" className={`mt-6 ${animateTabs ? 'animate-fade-in' : ''}`}>
              <Card className="glass-panel">
                <CardHeader className="pb-2">
                  <CardTitle>Competitor Keyword Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <KeywordCompetitors onUseKeyword={handleUseKeyword} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Keywords;
