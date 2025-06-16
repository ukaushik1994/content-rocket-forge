
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, TrendingUp, Target, BarChart3, Download, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { researchKeyword } from '@/services/keywordResearchService';

const KeywordResearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [keywordData, setKeywordData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedKeywords, setSavedKeywords] = useState([]);

  const handleKeywordSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a keyword to research");
      return;
    }

    setLoading(true);
    try {
      const data = await researchKeyword(searchTerm);
      setKeywordData(data);
      toast.success("Keyword research completed!");
    } catch (error) {
      toast.error("Failed to research keyword");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKeyword = (keyword) => {
    if (!savedKeywords.find(k => k.keyword === keyword.keyword)) {
      setSavedKeywords([...savedKeywords, keyword]);
      toast.success("Keyword saved to your list!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Helmet>
        <title>Keyword Research | Research Platform</title>
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
            <h1 className="text-4xl font-bold text-gradient">Keyword Research</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover high-performing keywords, analyze competition, and find content opportunities
            </p>
          </div>

          {/* Search Section */}
          <Card className="glass-panel border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-neon-blue" />
                Keyword Research Tool
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Enter your seed keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-glass border-white/10"
                  onKeyPress={(e) => e.key === 'Enter' && handleKeywordSearch()}
                />
                <Button onClick={handleKeywordSearch} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? 'Researching...' : 'Research'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {keywordData && (
            <Tabs defaultValue="keywords" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="keywords">Related Keywords</TabsTrigger>
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="competitors">Competitors</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
              </TabsList>

              <TabsContent value="keywords" className="space-y-6">
                <Card className="glass-panel border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-neon-green" />
                        Related Keywords for "{keywordData.mainKeyword}"
                      </span>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {keywordData.relatedKeywords.map((keyword, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-glass rounded-lg border border-white/10">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">{keyword.keyword}</h4>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span>Volume: {keyword.searchVolume?.toLocaleString()}/month</span>
                              <span>CPC: {keyword.cpc}</span>
                              <Badge variant={keyword.difficulty < 30 ? 'default' : keyword.difficulty < 70 ? 'secondary' : 'destructive'}>
                                Difficulty: {keyword.difficulty}
                              </Badge>
                              <Badge variant="outline">{keyword.intent}</Badge>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => handleSaveKeyword(keyword)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="questions" className="space-y-6">
                <Card className="glass-panel border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-neon-purple" />
                      Questions People Ask
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {keywordData.questions.map((question, index) => (
                        <div key={index} className="p-4 bg-glass rounded-lg border border-white/10">
                          <p className="text-white">{question}</p>
                          <div className="flex justify-end mt-2">
                            <Button size="sm" variant="outline">
                              Create Content
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="competitors" className="space-y-6">
                <Card className="glass-panel border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-neon-blue" />
                      Competitor Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {keywordData.competitorKeywords.map((keyword, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-glass rounded-lg border border-white/10">
                          <span className="text-white">{keyword}</span>
                          <Button size="sm" variant="outline">
                            Analyze
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                <Card className="glass-panel border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-neon-green" />
                      Search Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-center">
                        <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Trend Analysis</h3>
                        <p className="text-muted-foreground">
                          Interactive trend charts coming soon
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {savedKeywords.length > 0 && (
            <Card className="glass-panel border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-neon-blue" />
                  Saved Keywords ({savedKeywords.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {savedKeywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-sm p-2">
                      {keyword.keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default KeywordResearch;
