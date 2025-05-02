
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { KeywordCluster } from '@/components/keywords/KeywordCluster';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  DownloadCloud,
  Plus,
  RefreshCcw,
} from 'lucide-react';

const Keywords = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gradient">Keyword Research</h1>
            <Button className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple">
              <Plus className="mr-2 h-4 w-4" />
              New Keyword Cluster
            </Button>
          </div>
          
          <Card className="glass-panel">
            <CardHeader className="pb-2">
              <CardTitle>Keyword Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative md:col-span-3">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter keyword to analyze..."
                    className="pl-9 bg-glass border-white/10"
                  />
                </div>
                <Select>
                  <SelectTrigger className="bg-glass border-white/10">
                    <SelectValue placeholder="Search Volume" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Volume (10K+)</SelectItem>
                    <SelectItem value="medium">Medium Volume (1K-10K)</SelectItem>
                    <SelectItem value="low">Low Volume (100-1K)</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze
                </Button>
              </div>
              
              <Tabs defaultValue="all">
                <div className="flex justify-between items-center">
                  <TabsList className="bg-secondary/30">
                    <TabsTrigger value="all">All Keywords</TabsTrigger>
                    <TabsTrigger value="saved">Saved</TabsTrigger>
                    <TabsTrigger value="clusters">Clusters</TabsTrigger>
                  </TabsList>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Filter className="h-4 w-4" />
                      <span>Filter</span>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <DownloadCloud className="h-4 w-4" />
                      <span>Export</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <TabsContent value="all" className="mt-4">
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
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="saved">
                  <div className="flex items-center justify-center h-40 text-muted-foreground">
                    No saved keywords yet. Save keywords to access them here.
                  </div>
                </TabsContent>
                
                <TabsContent value="clusters">
                  <div className="flex items-center justify-center h-40 text-muted-foreground">
                    No clusters created yet. Group keywords to create clusters.
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card className="glass-panel">
            <CardHeader className="pb-2">
              <CardTitle>SERP Analysis</CardTitle>
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
                      <div key={i} className="space-y-1">
                        <h4 className="text-sm font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground bg-glass p-2 rounded-md border border-white/10">
                          {item.content}
                        </p>
                      </div>
                    ))}
                  </div>
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
                      <div key={i} className="p-3 bg-glass rounded-md border border-white/10">
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
        </div>
      </main>
    </div>
  );
};

export default Keywords;
