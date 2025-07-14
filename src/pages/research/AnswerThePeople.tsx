import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageCircle, HelpCircle, TrendingUp, Search, Plus, Download, FileText, Target, Lightbulb, Eye, Filter, Brain, Zap, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { analyzeAnswerThePeople, exportQuestionsForContentBuilder, type AnswerThePeopleResult, type QuestionData } from '@/services/answerThePeopleService';
import { useNavigate } from 'react-router-dom';

const AnswerThePeople = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [questionsData, setQuestionsData] = useState<AnswerThePeopleResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState('All');
  
  const navigate = useNavigate();

  // Sample data matching the reference
  const sampleQuestionsData = {
    questions: [
      {
        id: 1,
        question: "what is content marketing strategy",
        type: "what",
        searchVolume: 3200,
        difficulty: "Medium",
        opportunity: "High",
        hasHighSearchIntent: true,
        hasFeaturedSnippet: false
      },
      {
        id: 2,
        question: "how to create a content marketing strategy",
        type: "how",
        searchVolume: 4800,
        difficulty: "Hard",
        opportunity: "High",
        hasHighSearchIntent: false,
        hasFeaturedSnippet: true
      },
      {
        id: 3,
        question: "why content marketing strategy is important",
        type: "why",
        searchVolume: 2100,
        difficulty: "Easy",
        opportunity: "Medium",
        hasHighSearchIntent: true,
        hasFeaturedSnippet: false
      },
      {
        id: 4,
        question: "when to update content marketing strategy",
        type: "when",
        searchVolume: 980,
        difficulty: "Easy",
        opportunity: "Medium",
        hasHighSearchIntent: true,
        hasFeaturedSnippet: false
      },
      {
        id: 5,
        question: "who needs a content marketing strategy",
        type: "who",
        searchVolume: 720,
        difficulty: "Easy",
        opportunity: "Low",
        hasHighSearchIntent: true,
        hasFeaturedSnippet: false
      }
    ],
    prepositions: [
      {
        id: 1,
        preposition: "content marketing strategy for b2b",
        searchVolume: 2400,
        difficulty: 58,
        opportunity: "High"
      },
      {
        id: 2,
        preposition: "content marketing strategy with limited budget",
        searchVolume: 1200,
        difficulty: 42,
        opportunity: "Medium"
      },
      {
        id: 3,
        preposition: "content marketing strategy without social media",
        searchVolume: 580,
        difficulty: 35,
        opportunity: "Low"
      },
      {
        id: 4,
        preposition: "content marketing strategy in 2025",
        searchVolume: 3100,
        difficulty: 61,
        opportunity: "High"
      },
      {
        id: 5,
        preposition: "content marketing strategy by industry",
        searchVolume: 1800,
        difficulty: 53,
        opportunity: "Medium"
      },
      {
        id: 6,
        preposition: "content marketing strategy to increase engagement",
        searchVolume: 1600,
        difficulty: 49,
        opportunity: "Medium"
      }
    ],
    comparisons: [
      {
        id: 1,
        comparison: "content marketing strategy vs social media strategy",
        searchVolume: 1900,
        difficulty: 52,
        opportunity: "High"
      },
      {
        id: 2,
        comparison: "content marketing strategy vs seo strategy",
        searchVolume: 1700,
        difficulty: 55,
        opportunity: "Medium"
      },
      {
        id: 3,
        comparison: "content marketing strategy vs traditional marketing",
        searchVolume: 1400,
        difficulty: 48,
        opportunity: "Medium"
      },
      {
        id: 4,
        comparison: "content marketing strategy vs content plan",
        searchVolume: 990,
        difficulty: 39,
        opportunity: "Low"
      },
      {
        id: 5,
        comparison: "b2b content marketing vs b2c content marketing",
        searchVolume: 1500,
        difficulty: 58,
        opportunity: "High"
      }
    ]
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a keyword to find questions");
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeAnswerThePeople(searchTerm.trim());
      setQuestionsData(result);
      
      if (result.isRealData) {
        toast.success(`Found ${result.questions.length} questions with real SERP data!`, {
          description: `${result.totalOpportunities} high-opportunity questions identified`
        });
      } else {
        toast.warning("Using limited data. Add your SERP API key in Settings for comprehensive insights.", {
          action: {
            label: "Add API Key",
            onClick: () => navigate("/settings/api")
          }
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error("Failed to analyze questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-neon-green text-black';
      case 'Medium': return 'bg-orange-500 text-white';
      case 'Hard': return 'bg-red-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getOpportunityColor = (opportunity) => {
    switch (opportunity) {
      case 'High': return 'bg-neon-green text-black';
      case 'Medium': return 'bg-orange-500 text-white';
      case 'Low': return 'bg-red-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getDifficultyBarColor = (difficulty) => {
    if (difficulty < 40) return 'bg-neon-green';
    if (difficulty < 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const handleQuestionSelect = (questionId: string) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestions(newSelected);
  };

  const handleCreateContentFromQuestions = () => {
    if (selectedQuestions.size === 0) {
      toast.error("Please select at least one question to create content");
      return;
    }

    const selectedQuestionsData = questionsData?.questions.filter(q => selectedQuestions.has(q.id)) || [];
    
    // Store selected questions in localStorage to pass to Content Builder
    const questionsForBuilder = exportQuestionsForContentBuilder(selectedQuestionsData);
    localStorage.setItem('pendingSerpSelections', JSON.stringify(questionsForBuilder));
    
    toast.success(`Selected ${selectedQuestions.size} questions for content creation`);
    navigate('/content/builder');
  };

  const handleExportData = () => {
    if (!questionsData) {
      toast.error("No data to export");
      return;
    }

    const exportData = {
      keyword: questionsData.keyword,
      questions: questionsData.questions,
      prepositions: questionsData.prepositions,
      comparisons: questionsData.comparisons,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `answer-the-people-${questionsData.keyword}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Data exported successfully!");
  };

  const getFilteredQuestions = () => {
    if (!questionsData) return [];
    if (activeFilter === 'All') return questionsData.questions;
    return questionsData.questions.filter(q => q.type.toLowerCase() === activeFilter.toLowerCase());
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'commercial': return 'bg-neon-blue/20 text-neon-blue border-neon-blue/30';
      case 'transactional': return 'bg-neon-green/20 text-neon-green border-neon-green/30';
      case 'navigational': return 'bg-neon-purple/20 text-neon-purple border-neon-purple/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
    }
  };

  const getFunnelStageColor = (stage: string) => {
    switch (stage) {
      case 'awareness': return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
      case 'consideration': return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
      case 'decision': return 'bg-green-500/20 text-green-300 border-green-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
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
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gradient">Answer The People</h1>
                <p className="text-xl text-muted-foreground mt-2">
                  Discover questions your audience is asking about any topic
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="border-white/20"
                  onClick={handleExportData}
                  disabled={!questionsData}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button 
                  className="bg-neon-blue hover:bg-neon-blue/90"
                  onClick={handleCreateContentFromQuestions}
                  disabled={selectedQuestions.size === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Content ({selectedQuestions.size})
                </Button>
              </div>
            </div>

            {/* Search Section */}
            <Card className="glass-panel border-white/10">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter your topic or keyword..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-glass border-white/10"
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                    </div>
                    <Button onClick={handleSearch} disabled={loading} className="bg-neon-blue hover:bg-neon-blue/90">
                      <Search className="h-4 w-4 mr-2" />
                      {loading ? 'Searching...' : 'Search'}
                    </Button>
                  </div>
                  
                  {/* Trending searches */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Trending searches:</span>
                    {['content marketing', 'seo strategies', 'email marketing', 'social media marketing'].map((trend) => (
                      <Badge 
                        key={trend} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-neon-blue/20"
                        onClick={() => {
                          setSearchTerm(trend);
                          handleSearch();
                        }}
                      >
                        {trend}
                      </Badge>
                    ))}
                  </div>
                  
                  {questionsData && (
                    <div className="flex items-center gap-4 pt-2 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-neon-blue" />
                        <span className="text-sm text-muted-foreground">
                          Data Quality: <span className={questionsData.dataQuality === 'high' ? 'text-neon-green' : 'text-orange-400'}>
                            {questionsData.dataQuality}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-neon-green" />
                        <span className="text-sm text-muted-foreground">
                          High Opportunities: <span className="text-neon-green">{questionsData.totalOpportunities}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-neon-purple" />
                        <span className="text-sm text-muted-foreground">
                          {questionsData.isRealData ? 'Real SERP Data' : 'Limited Data'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          {questionsData && (
            <Tabs defaultValue="questions" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-glass border border-white/10">
                <TabsTrigger value="questions" className="data-[state=active]:bg-neon-blue data-[state=active]:text-white">
                  Questions ({questionsData.questions.length})
                </TabsTrigger>
                <TabsTrigger value="prepositions" className="data-[state=active]:bg-neon-blue data-[state=active]:text-white">
                  Prepositions ({questionsData.prepositions.length})
                </TabsTrigger>
                <TabsTrigger value="comparisons" className="data-[state=active]:bg-neon-blue data-[state=active]:text-white">
                  Comparisons ({questionsData.comparisons.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="questions" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Questions people ask about "content marketing"</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Discover questions your audience is asking about this topic</span>
                    <div className="flex gap-1">
                      {['All', 'What', 'How', 'Why', 'When', 'Where', 'Which', 'Who'].map((filter) => (
                        <Button 
                          key={filter} 
                          size="sm" 
                          variant={filter === activeFilter ? 'default' : 'outline'} 
                          className="text-xs"
                          onClick={() => setActiveFilter(filter)}
                        >
                          {filter}
                          {filter !== 'All' && questionsData && (
                            <span className="ml-1 text-xs opacity-70">
                              ({questionsData.questions.filter(q => q.type.toLowerCase() === filter.toLowerCase()).length})
                            </span>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {getFilteredQuestions().map((item) => (
                    <Card 
                      key={item.id} 
                      className={`glass-panel border-white/10 hover:border-neon-blue/30 transition-all cursor-pointer ${
                        selectedQuestions.has(item.id) ? 'border-neon-blue/50 bg-neon-blue/5' : ''
                      }`}
                      onClick={() => handleQuestionSelect(item.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedQuestions.has(item.id)}
                            onChange={() => handleQuestionSelect(item.id)}
                            className="mt-1 rounded border-white/20 bg-transparent"
                            onClick={(e) => e.stopPropagation()}
                          />
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="outline" className="text-xs uppercase bg-neon-blue/20 border-neon-blue/30">
                                {item.type}
                              </Badge>
                              <Badge variant="outline" className={`text-xs ${getIntentColor(item.intent)}`}>
                                {item.intent}
                              </Badge>
                              <Badge variant="outline" className={`text-xs ${getFunnelStageColor(item.funnelStage)}`}>
                                {item.funnelStage}
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-300 border-purple-400/30">
                                {item.contentType}
                              </Badge>
                            </div>
                            
                            <h3 className="text-white font-medium mb-3">{item.question}</h3>
                            
                            <div className="flex items-center gap-4 text-sm mb-2">
                              <span className="text-muted-foreground">
                                <TrendingUp className="h-3 w-3 inline mr-1" />
                                {item.searchVolume.toLocaleString()} searches/mo
                              </span>
                              <Badge className={`text-xs ${getDifficultyColor(item.difficulty)}`}>
                                Difficulty: {item.difficulty}
                              </Badge>
                              <Badge className={`text-xs ${getOpportunityColor(item.opportunity)}`}>
                                {item.opportunity} Opportunity
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Competition: {item.competitionLevel}%
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-xs">
                              {item.hasHighSearchIntent && (
                                <div className="flex items-center gap-1 text-neon-blue">
                                  <div className="w-2 h-2 bg-neon-blue rounded-full"></div>
                                  High search intent
                                </div>
                              )}
                              {item.hasFeaturedSnippet && (
                                <div className="flex items-center gap-1 text-neon-green">
                                  <div className="w-2 h-2 bg-neon-green rounded-full"></div>
                                  Featured snippet opportunity
                                </div>
                              )}
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                Source: {item.source}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="prepositions" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Prepositions for "content marketing"</h2>
                  <Button variant="outline" className="border-white/20">
                    Filter Results
                  </Button>
                </div>

                <div className="space-y-3">
                  {questionsData.prepositions.map((item) => (
                    <Card key={item.id} className="glass-panel border-white/10 hover:border-neon-blue/30 transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-white font-medium mb-2">{item.preposition}</h3>
                            
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">
                                <TrendingUp className="h-3 w-3 inline mr-1" />
                                {item.searchVolume.toLocaleString()} searches/mo
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Difficulty: {item.difficulty}</span>
                                <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${getDifficultyBarColor(item.difficulty)} transition-all`}
                                    style={{ width: `${item.difficulty}%` }}
                                  />
                                </div>
                              </div>
                              <Badge className={`text-xs ${getOpportunityColor(item.opportunity)}`}>
                                {item.opportunity} Opportunity
                              </Badge>
                            </div>

                            <div className="flex items-center gap-1 text-xs text-neon-blue mt-2">
                              <div className="w-2 h-2 bg-neon-blue rounded-full"></div>
                              Updated 1 days ago
                            </div>
                          </div>
                          
                          <Button size="sm" className="bg-neon-blue hover:bg-neon-blue/90">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Content
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="text-center pt-4">
                  <Button variant="outline" className="border-white/20">
                    Show More Prepositions
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="comparisons" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Comparisons for "content marketing"</h2>
                  <div className="text-sm text-muted-foreground">
                    Discover how people are comparing this topic with other topics
                  </div>
                </div>

                <div className="space-y-3">
                  {questionsData.comparisons.map((item) => (
                    <Card key={item.id} className="glass-panel border-white/10 hover:border-neon-blue/30 transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-white font-medium mb-2">{item.comparison}</h3>
                            
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">
                                <TrendingUp className="h-3 w-3 inline mr-1" />
                                {item.searchVolume.toLocaleString()} searches/mo
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Difficulty: {item.difficulty}</span>
                                <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${getDifficultyBarColor(item.difficulty)} transition-all`}
                                    style={{ width: `${item.difficulty}%` }}
                                  />
                                </div>
                              </div>
                              <Badge className={`text-xs ${getOpportunityColor(item.opportunity)}`}>
                                {item.opportunity} Opportunity
                              </Badge>
                            </div>

                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MessageCircle className="h-3 w-3" />
                                Video suggestion
                              </div>
                              <div className="flex items-center gap-1 text-xs text-neon-green">
                                <FileText className="h-3 w-3" />
                                Table opportunity
                              </div>
                            </div>
                          </div>
                          
                          <Button size="sm" className="bg-neon-blue hover:bg-neon-blue/90">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Comparison
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Pro Tips Section */}
          <Card className="glass-panel border-white/10">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">Pro Tips for "Answer the People"</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-neon-blue/20 rounded-lg flex items-center justify-center mx-auto">
                    <FileText className="h-6 w-6 text-neon-blue" />
                  </div>
                  <h3 className="font-semibold text-white">Create FAQ Content</h3>
                  <p className="text-sm text-muted-foreground">
                    Use these questions to create comprehensive FAQ pages that address your audience's top concerns.
                  </p>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-neon-green/20 rounded-lg flex items-center justify-center mx-auto">
                    <Target className="h-6 w-6 text-neon-green" />
                  </div>
                  <h3 className="font-semibold text-white">Optimize for Featured Snippets</h3>
                  <p className="text-sm text-muted-foreground">
                    Structure your content to directly answer questions and increase chances of earning featured snippets.
                  </p>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-neon-purple/20 rounded-lg flex items-center justify-center mx-auto">
                    <Lightbulb className="h-6 w-6 text-neon-purple" />
                  </div>
                  <h3 className="font-semibold text-white">Understand User Intent</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyze questions to better understand what information your audience is really seeking.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AnswerThePeople;
