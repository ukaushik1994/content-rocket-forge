import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, HelpCircle, TrendingUp, Filter, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import Answer the People service and components
import { analyzeAnswerThePeople, type QuestionData, type AnswerThePeopleResult } from '@/services/answerThePeopleService';

export const PeopleQuestionsTab: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [questionsData, setQuestionsData] = useState<AnswerThePeopleResult | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('questions');
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!keyword.trim()) {
      toast.error('Please enter a keyword to analyze');
      return;
    }

    setLoading(true);
    try {
      toast.info('Analyzing people questions...');
      const result = await analyzeAnswerThePeople(keyword.trim());
      
      if (result) {
        setQuestionsData(result);
        toast.success(`Found ${result.questions?.length || 0} questions about "${keyword}"`);
      } else {
        toast.warning('No question data found for this keyword');
      }
    } catch (error) {
      toast.error('Failed to analyze questions');
      console.error('Error analyzing questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = () => {
    if (!questionsData || selectedQuestions.length === 0) {
      toast.error('Please select some questions to create content');
      return;
    }

    navigate('/content-builder', {
      state: {
        mainKeyword: keyword,
        peopleQuestions: selectedQuestions,
        questionData: questionsData,
        contentType: 'faq',
        step: 1
      }
    });

    toast.success('🚀 Creating FAQ content with selected questions!');
  };

  const handleQuestionSelect = (question: string) => {
    setSelectedQuestions(prev => {
      if (prev.includes(question)) {
        return prev.filter(q => q !== question);
      } else {
        return [...prev, question];
      }
    });
  };

  const handleSelectAll = (questions: any[]) => {
    const allQuestions = questions.map(q => q.question || q.preposition || q.comparison);
    setSelectedQuestions(prev => {
      if (prev.length === allQuestions.length) {
        return [];
      } else {
        return allQuestions;
      }
    });
  };

  const renderQuestions = (questions: any[], type: string, icon: React.ReactNode) => {
    if (!questions || questions.length === 0) {
      return (
        <Card className="bg-background/60 backdrop-blur-sm border-border/50">
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              No {type} found for "{keyword}"
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-background/60 backdrop-blur-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {type} ({questions.length})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSelectAll(questions)}
          >
            {selectedQuestions.length === questions.length ? 'Deselect All' : 'Select All'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {questions.map((question, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                selectedQuestions.includes(question.question || question.preposition || question.comparison)
                  ? 'border-primary bg-primary/10'
                  : 'border-border/50 bg-background/40'
              }`}
              onClick={() => handleQuestionSelect(question.question || question.preposition || question.comparison)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {question.question || question.preposition || question.comparison}
                  </p>
                  {question.searchVolume && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {question.searchVolume} searches
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedQuestions.includes(question.question || question.preposition || question.comparison) && (
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-xs text-white">✓</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* Premium Header Card */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/10 border border-white/10 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl backdrop-blur-sm border border-white/10">
                <Users className="h-8 w-8 text-purple-400" />
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
              People Questions Analysis
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto text-lg leading-relaxed">
              Discover what your audience is asking about any topic. Analyze real questions from search engines and create content that answers their needs.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Search Interface */}
      <Card className="bg-gradient-to-br from-white/10 via-white/5 to-white/5 border border-white/10 backdrop-blur-xl">
        <CardContent className="p-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter your topic or keyword..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                className="bg-black/20 border-white/20 text-white placeholder:text-white/60 h-12 text-lg backdrop-blur-sm"
              />
            </div>
            <Button 
              onClick={handleAnalyze} 
              disabled={loading || !keyword.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-12 px-8 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Analyze Questions
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {questionsData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Selected Questions Summary */}
          {selectedQuestions.length > 0 && (
            <Card className="bg-primary/10 border-primary/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-medium">{selectedQuestions.length} questions selected</span>
                  </div>
                  <Button onClick={handleCreateContent} size="sm" className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Create FAQ Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Questions Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-black/20 via-black/10 to-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-2">
              <TabsTrigger value="questions" className="flex items-center gap-2 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
                <HelpCircle className="h-4 w-4" />
                Questions
              </TabsTrigger>
              <TabsTrigger value="prepositions" className="flex items-center gap-2 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
                <Filter className="h-4 w-4" />
                Prepositions
              </TabsTrigger>
              <TabsTrigger value="comparisons" className="flex items-center gap-2 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
                <TrendingUp className="h-4 w-4" />
                Comparisons
              </TabsTrigger>
              <TabsTrigger value="related" className="flex items-center gap-2 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
                <Search className="h-4 w-4" />
                Related
              </TabsTrigger>
            </TabsList>

            <TabsContent value="questions">
              {renderQuestions(
                questionsData.questions, 
                `Questions about "${questionsData.keyword}"`,
                <HelpCircle className="h-4 w-4 text-blue-500" />
              )}
            </TabsContent>

            <TabsContent value="prepositions">
              {renderQuestions(
                questionsData.prepositions,
                `Prepositions for "${questionsData.keyword}"`,
                <Filter className="h-4 w-4 text-green-500" />
              )}
            </TabsContent>

            <TabsContent value="comparisons">
              {renderQuestions(
                questionsData.comparisons,
                `Comparisons with "${questionsData.keyword}"`,
                <TrendingUp className="h-4 w-4 text-purple-500" />
              )}
            </TabsContent>

            <TabsContent value="related">
              {renderQuestions(
                [],
                `Related to "${questionsData.keyword}"`,
                <Search className="h-4 w-4 text-orange-500" />
              )}
            </TabsContent>
          </Tabs>

          {/* Quick Stats */}
          <Card className="bg-background/40 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 bg-background/60 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{questionsData.questions?.length || 0}</div>
                  <div className="text-muted-foreground">Questions</div>
                </div>
                <div className="text-center p-3 bg-background/60 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">{questionsData.prepositions?.length || 0}</div>
                  <div className="text-muted-foreground">Prepositions</div>
                </div>
                <div className="text-center p-3 bg-background/60 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">{questionsData.comparisons?.length || 0}</div>
                  <div className="text-muted-foreground">Comparisons</div>
                </div>
                <div className="text-center p-3 bg-background/60 rounded-lg">
                  <div className="text-2xl font-bold text-orange-400">0</div>
                  <div className="text-muted-foreground">Related</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {!questionsData && (
        <Card className="bg-background/40 backdrop-blur-sm border-border/50">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Ready to Discover Questions</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Enter any keyword and we'll analyze SERP data to find what people are asking about that topic.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <HelpCircle className="h-4 w-4" />
                Questions
              </div>
              <div className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Prepositions
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Comparisons
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};