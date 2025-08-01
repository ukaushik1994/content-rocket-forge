
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Brain, 
  Zap, 
  TrendingUp, 
  HelpCircle, 
  Users, 
  Target,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  Play,
  Plus,
  BarChart3,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { analyzeAnswerThePeople, type QuestionData, type AnswerThePeopleResult } from '@/services/answerThePeopleService';

const AnswerThePeople = () => {
  const [keyword, setKeyword] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [questionsData, setQuestionsData] = useState<AnswerThePeopleResult | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'questions' | 'prepositions' | 'comparisons'>('questions');
  
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  // Simulate real-time analysis steps
  const analysisSteps = [
    'Analyzing search patterns...',
    'Extracting questions from SERP data...',
    'Processing semantic relationships...',
    'Calculating search volumes...',
    'Identifying content opportunities...',
    'Generating insights...'
  ];

  const handleAnalyze = async () => {
    if (!keyword.trim()) {
      toast.error('Please enter a keyword to analyze');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setCurrentStep(analysisSteps[0]);

    // Simulate progress with steps
    for (let i = 0; i < analysisSteps.length; i++) {
      setCurrentStep(analysisSteps[i]);
      setAnalysisProgress((i + 1) * (100 / analysisSteps.length));
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      const result = await analyzeAnswerThePeople(keyword.trim());
      setQuestionsData(result);
      
      if (result.isRealData) {
        toast.success(`Found ${result.questions.length} questions with real SERP data!`, {
          description: `${result.totalOpportunities} high-opportunity questions identified`
        });
      } else {
        toast.warning('Using enhanced mock data. Add your SERP API key for real insights.', {
          action: {
            label: 'Add API Key',
            onClick: () => navigate('/settings/api')
          }
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze questions. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
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

  const handleCreateContent = () => {
    if (selectedQuestions.size === 0) {
      toast.error('Please select at least one question to create content');
      return;
    }

    const selectedQuestionsData = questionsData?.questions.filter(q => selectedQuestions.has(q.id)) || [];
    
    // Store selected questions for Content Builder
    localStorage.setItem('pendingSerpSelections', JSON.stringify(
      selectedQuestionsData.map(q => ({
        type: 'question',
        content: q.question,
        metadata: {
          searchVolume: q.searchVolume,
          difficulty: q.difficulty,
          opportunity: q.opportunity,
          intent: q.intent,
          source: q.source
        }
      }))
    ));
    
    toast.success(`Selected ${selectedQuestions.size} questions for content creation`);
    navigate('/content/builder');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30';
      case 'Medium': return 'bg-orange-500/20 text-orange-400 border-orange-400/30';
      case 'Hard': return 'bg-red-500/20 text-red-400 border-red-400/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity) {
      case 'High': return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      case 'Low': return 'bg-red-500/20 text-red-400 border-red-400/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  const getTabData = () => {
    if (!questionsData) return { items: [], count: 0 };
    
    switch (activeTab) {
      case 'questions':
        return { items: questionsData.questions, count: questionsData.questions.length };
      case 'prepositions':
        return { items: questionsData.prepositions, count: questionsData.prepositions.length };
      case 'comparisons':
        return { items: questionsData.comparisons, count: questionsData.comparisons.length };
      default:
        return { items: [], count: 0 };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
      <Helmet>
        <title>Answer The People | Research Platform</title>
      </Helmet>
      
      <Navbar />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full filter blur-3xl animate-pulse opacity-50"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl animate-pulse opacity-40"></div>
        <div className="absolute bottom-40 left-1/2 w-64 h-64 bg-teal-600/10 rounded-full filter blur-3xl animate-pulse opacity-30"></div>
      </div>
      
      <main className="flex-1 container py-8 z-10 relative">
        <motion.div 
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div className="text-center space-y-6" variants={itemVariants}>
            <div className="space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto"
              >
                <Brain className="h-10 w-10 text-white" />
              </motion.div>
              
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
                  Answer The People
                </h1>
                <p className="text-xl text-gray-300 mt-3 max-w-2xl mx-auto">
                  Discover what your audience is asking about any topic with AI-powered SERP analysis
                </p>
              </div>
            </div>
          </motion.div>

          {/* Search Section */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Enter your topic or keyword..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="pl-12 h-14 bg-white/5 border-white/20 text-white placeholder-gray-400 text-lg"
                        onKeyPress={(e) => e.key === 'Enter' && !isAnalyzing && handleAnalyze()}
                        disabled={isAnalyzing}
                      />
                    </div>
                    <Button 
                      onClick={handleAnalyze} 
                      disabled={isAnalyzing} 
                      size="lg"
                      className="h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isAnalyzing ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Zap className="h-5 w-5 mr-2" />
                          </motion.div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Search className="h-5 w-5 mr-2" />
                          Analyze
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Progress Section */}
                  <AnimatePresence>
                    {isAnalyzing && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <div className="flex items-center gap-3 mb-3">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <Brain className="h-5 w-5 text-blue-400" />
                            </motion.div>
                            <span className="text-sm font-medium">{currentStep}</span>
                          </div>
                          <Progress value={analysisProgress} className="h-2" />
                          <div className="text-xs text-gray-400 mt-2">
                            {Math.round(analysisProgress)}% complete
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Trending suggestions */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm text-gray-400">Try these:</span>
                    {['content marketing', 'SEO strategy', 'digital marketing', 'AI tools'].map((trend) => (
                      <Button
                        key={trend}
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                        onClick={() => setKeyword(trend)}
                      >
                        {trend}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section */}
          <AnimatePresence>
            {questionsData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <motion.div variants={cardVariants} whileHover="hover">
                    <Card className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 border-blue-500/30">
                      <CardContent className="p-4 text-center">
                        <HelpCircle className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-400">{questionsData.questions.length}</div>
                        <div className="text-sm text-gray-300">Questions Found</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  
                  <motion.div variants={cardVariants} whileHover="hover">
                    <Card className="bg-gradient-to-r from-green-600/20 to-green-700/20 border-green-500/30">
                      <CardContent className="p-4 text-center">
                        <Target className="h-6 w-6 text-green-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-400">{questionsData.totalOpportunities}</div>
                        <div className="text-sm text-gray-300">High Opportunities</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  
                  <motion.div variants={cardVariants} whileHover="hover">
                    <Card className="bg-gradient-to-r from-purple-600/20 to-purple-700/20 border-purple-500/30">
                      <CardContent className="p-4 text-center">
                        <Users className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-purple-400">{questionsData.questions.filter(q => q.isFaqRecommended).length}</div>
                        <div className="text-sm text-gray-300">FAQ Ready</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  
                  <motion.div variants={cardVariants} whileHover="hover">
                    <Card className="bg-gradient-to-r from-teal-600/20 to-teal-700/20 border-teal-500/30">
                      <CardContent className="p-4 text-center">
                        <BarChart3 className="h-6 w-6 text-teal-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-teal-400">{questionsData.dataQuality}</div>
                        <div className="text-sm text-gray-300">Data Quality</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                  {[
                    { id: 'questions', label: 'Questions', icon: HelpCircle, count: questionsData.questions.length },
                    { id: 'prepositions', label: 'Prepositions', icon: MessageCircle, count: questionsData.prepositions.length },
                    { id: 'comparisons', label: 'Comparisons', icon: BarChart3, count: questionsData.comparisons.length }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
                          activeTab === tab.id 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                        <Badge variant="secondary" className="ml-1 bg-white/20">
                          {tab.count}
                        </Badge>
                      </button>
                    );
                  })}
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold text-white">
                    {activeTab === 'questions' && `Questions about "${questionsData.keyword}"`}
                    {activeTab === 'prepositions' && `Prepositions for "${questionsData.keyword}"`}
                    {activeTab === 'comparisons' && `Comparisons with "${questionsData.keyword}"`}
                  </div>
                  
                  <div className="flex gap-3">
                    {selectedQuestions.size > 0 && (
                      <Button
                        onClick={handleCreateContent}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Content ({selectedQuestions.size})
                      </Button>
                    )}
                  </div>
                </div>

                {/* Content Grid */}
                <motion.div 
                  className="space-y-4"
                  layout
                >
                  <AnimatePresence mode="wait">
                    {activeTab === 'questions' && (
                      <motion.div
                        key="questions"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-3"
                      >
                        {questionsData.questions.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Card 
                              className={`bg-white/5 backdrop-blur-xl border-white/10 hover:border-blue-500/30 transition-all cursor-pointer ${
                                selectedQuestions.has(item.id) ? 'border-blue-500/50 bg-blue-500/10' : ''
                              }`}
                              onClick={() => handleQuestionSelect(item.id)}
                            >
                              <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                  <input
                                    type="checkbox"
                                    checked={selectedQuestions.has(item.id)}
                                    onChange={() => handleQuestionSelect(item.id)}
                                    className="mt-1 rounded border-white/20 bg-transparent"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                      <Badge variant="outline" className="text-xs uppercase bg-blue-500/20 border-blue-400/30 text-blue-400">
                                        {item.type}
                                      </Badge>
                                      <Badge variant="outline" className={`text-xs ${getDifficultyColor(item.difficulty)}`}>
                                        {item.difficulty}
                                      </Badge>
                                      <Badge variant="outline" className={`text-xs ${getOpportunityColor(item.opportunity)}`}>
                                        {item.opportunity}
                                      </Badge>
                                      {item.isFaqRecommended && (
                                        <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-400 border-purple-400/30">
                                          <Sparkles className="h-3 w-3 mr-1" />
                                          FAQ Ready
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <h3 className="text-white font-medium text-lg mb-3">{item.question}</h3>
                                    
                                    <div className="flex items-center gap-6 text-sm text-gray-400">
                                      <div className="flex items-center gap-1">
                                        <TrendingUp className="h-3 w-3" />
                                        {item.searchVolume.toLocaleString()} searches/mo
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Target className="h-3 w-3" />
                                        {item.intent} intent
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {item.funnelStage} stage
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <ArrowRight className="h-5 w-5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                    {activeTab === 'prepositions' && (
                      <motion.div
                        key="prepositions"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-3"
                      >
                        {questionsData.prepositions.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:border-blue-500/30 transition-all">
                              <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <h3 className="text-white font-medium text-lg mb-3">{item.preposition}</h3>
                                    
                                    <div className="flex items-center gap-6 text-sm text-gray-400 mb-3">
                                      <div className="flex items-center gap-1">
                                        <TrendingUp className="h-3 w-3" />
                                        {item.searchVolume.toLocaleString()} searches/mo
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span>Difficulty: {item.difficulty}</span>
                                        <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                                          <div 
                                            className={`h-full transition-all ${
                                              item.difficulty < 40 ? 'bg-green-500' : 
                                              item.difficulty < 60 ? 'bg-orange-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${item.difficulty}%` }}
                                          />
                                        </div>
                                      </div>
                                      <Badge className={`text-xs ${getOpportunityColor(item.opportunity)}`}>
                                        {item.opportunity}
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Use
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                    {activeTab === 'comparisons' && (
                      <motion.div
                        key="comparisons"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-3"
                      >
                        {questionsData.comparisons.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:border-blue-500/30 transition-all">
                              <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <h3 className="text-white font-medium text-lg mb-3">{item.comparison}</h3>
                                    
                                    <div className="flex items-center gap-6 text-sm text-gray-400 mb-3">
                                      <div className="flex items-center gap-1">
                                        <TrendingUp className="h-3 w-3" />
                                        {item.searchVolume.toLocaleString()} searches/mo
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span>Difficulty: {item.difficulty}</span>
                                        <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                                          <div 
                                            className={`h-full transition-all ${
                                              item.difficulty < 40 ? 'bg-green-500' : 
                                              item.difficulty < 60 ? 'bg-orange-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${item.difficulty}%` }}
                                          />
                                        </div>
                                      </div>
                                      <Badge className={`text-xs ${getOpportunityColor(item.opportunity)}`}>
                                        {item.opportunity}
                                      </Badge>
                                      {item.competitiveAdvantage && (
                                        <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400 border-green-400/30">
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          Advantage
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Compare
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pro Tips Section */}
          {!questionsData && !isAnalyzing && (
            <motion.div variants={itemVariants}>
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-3">How it works</h3>
                    <p className="text-gray-300">Get insights from real SERP data to create better content</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <motion.div 
                      className="text-center space-y-4"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                        <Search className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-white">Analyze</h4>
                      <p className="text-sm text-gray-400">
                        Enter any keyword and we'll analyze SERP data to find what people are asking
                      </p>
                    </motion.div>
                    
                    <motion.div 
                      className="text-center space-y-4"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto">
                        <Target className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-white">Select</h4>
                      <p className="text-sm text-gray-400">
                        Choose high-opportunity questions and topics that match your content goals
                      </p>
                    </motion.div>
                    
                    <motion.div 
                      className="text-center space-y-4"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto">
                        <Lightbulb className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-white">Create</h4>
                      <p className="text-sm text-gray-400">
                        Generate AI-powered content that directly answers your audience's questions
                      </p>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default AnswerThePeople;
