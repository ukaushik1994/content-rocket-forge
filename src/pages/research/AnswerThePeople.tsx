
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageCircle, HelpCircle, TrendingUp, Search, Plus } from 'lucide-react';
import { toast } from 'sonner';

const AnswerThePeople = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const questionCategories = {
    what: [
      "What is content marketing strategy?",
      "What are the best content marketing tools?",
      "What makes content go viral?",
      "What is SEO content writing?"
    ],
    how: [
      "How to create engaging content?",
      "How to measure content performance?",
      "How to optimize content for SEO?",
      "How to repurpose content effectively?"
    ],
    why: [
      "Why is content marketing important?",
      "Why do content strategies fail?",
      "Why should businesses blog?",
      "Why is storytelling crucial in marketing?"
    ],
    when: [
      "When to publish content for maximum reach?",
      "When should you update old content?",
      "When to use video vs written content?",
      "When to invest in paid content promotion?"
    ],
    where: [
      "Where to distribute content for best results?",
      "Where to find content inspiration?",
      "Where do audiences consume content most?",
      "Where to host video content?"
    ]
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a keyword to find questions");
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockQuestions = [
        `What is ${searchTerm}?`,
        `How to use ${searchTerm} effectively?`,
        `Why is ${searchTerm} important?`,
        `When should I implement ${searchTerm}?`,
        `Where can I learn about ${searchTerm}?`,
        `How much does ${searchTerm} cost?`,
        `What are the benefits of ${searchTerm}?`,
        `How to get started with ${searchTerm}?`
      ];
      setQuestions(mockQuestions);
      setLoading(false);
      toast.success("Questions generated successfully!");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Helmet>
        <title>Answer the People | Research Platform</title>
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
            <h1 className="text-4xl font-bold text-gradient">Answer the People</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover what people are asking about your topics and create content that answers their questions
            </p>
          </div>

          {/* Search Section */}
          <Card className="glass-panel border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-neon-blue" />
                Find Questions People Ask
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Enter your topic or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-glass border-white/10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? 'Finding...' : 'Find Questions'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="results" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="results">Search Results</TabsTrigger>
              <TabsTrigger value="categories">Question Categories</TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="space-y-6">
              {questions.length > 0 ? (
                <Card className="glass-panel border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-neon-green" />
                      Questions about "{searchTerm}"
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {questions.map((question, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-glass rounded-lg border border-white/10">
                          <div className="flex-1">
                            <p className="text-white">{question}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                High Intent
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Avg. 2.5K searches/month
                              </span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Content
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="glass-panel border-white/10">
                  <CardContent className="text-center py-12">
                    <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Questions Yet</h3>
                    <p className="text-muted-foreground">
                      Enter a keyword above to find questions people are asking
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <div className="grid gap-6">
                {Object.entries(questionCategories).map(([category, categoryQuestions]) => (
                  <Card key={category} className="glass-panel border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 capitalize">
                        <HelpCircle className="h-5 w-5 text-neon-blue" />
                        {category} Questions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {categoryQuestions.map((question, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-glass rounded-lg border border-white/10">
                            <span className="text-white">{question}</span>
                            <Button size="sm" variant="outline">
                              Analyze
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AnswerThePeople;
