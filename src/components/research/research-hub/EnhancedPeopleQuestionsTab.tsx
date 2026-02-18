import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  HelpCircle, 
  TrendingUp, 
  Filter, 
  Search, 
  CheckCircle2, 
  Circle, 
  Plus,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { analyzeAnswerThePeople, type AnswerThePeopleResult } from '@/services/answerThePeopleService';

interface EnhancedPeopleQuestionsTabProps {
  searchTerm: string;
  onDataUpdate?: (data: any) => void;
}

export const EnhancedPeopleQuestionsTab: React.FC<EnhancedPeopleQuestionsTabProps> = ({ 
  searchTerm, 
  onDataUpdate 
}) => {
  const [questionsData, setQuestionsData] = useState<AnswerThePeopleResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'questions' | 'prepositions' | 'comparisons'>('all');
  const navigate = useNavigate();

  const categories = [
    { id: 'all', label: 'All Questions', icon: Search, color: 'text-white' },
    { id: 'questions', label: 'Questions', icon: HelpCircle, color: 'text-blue-400' },
    { id: 'prepositions', label: 'Prepositions', icon: Filter, color: 'text-green-400' },
    { id: 'comparisons', label: 'Comparisons', icon: TrendingUp, color: 'text-purple-400' }
  ];

  const getAllQuestions = () => {
    if (!questionsData) return [];
    
    const allQuestions = [
      ...(questionsData.questions || []).map(q => ({ ...q, category: 'questions', text: q.question })),
      ...(questionsData.prepositions || []).map(q => ({ ...q, category: 'prepositions', text: q.preposition })),
      ...(questionsData.comparisons || []).map(q => ({ ...q, category: 'comparisons', text: q.comparison }))
    ];
    
    if (activeCategory === 'all') {
      return allQuestions;
    }
    
    return allQuestions.filter(q => q.category === activeCategory);
  };

  const getQuestionsByCategory = (category: string) => {
    if (!questionsData) return [];
    
    switch (category) {
      case 'questions':
        return questionsData.questions || [];
      case 'prepositions':
        return questionsData.prepositions || [];
      case 'comparisons':
        return questionsData.comparisons || [];
      default:
        return [];
    }
  };

  const getCategoryCount = (category: string) => {
    if (category === 'all') {
      return getAllQuestions().length;
    }
    return getQuestionsByCategory(category).length;
  };

  const handleAnalyzeQuestions = async () => {
    if (!searchTerm.trim()) return;

    setIsAnalyzing(true);
    try {
      toast.info(`Analyzing people questions for "${searchTerm}"`);
      
      const result = await analyzeAnswerThePeople(searchTerm.trim());
      
      if (result) {
        setQuestionsData(result);
        onDataUpdate?.(result);
        
        const totalQuestions = (result.questions?.length || 0) + 
                              (result.prepositions?.length || 0) + 
                              (result.comparisons?.length || 0);
        
        toast.success(`Found ${totalQuestions} questions about "${searchTerm}"`);
      } else {
        toast.warning('No question data found for this keyword');
      }
    } catch (error) {
      toast.error('Failed to analyze questions');
      console.error('Error analyzing questions:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuestionSelect = (questionText: string) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionText)) {
        return prev.filter(q => q !== questionText);
      } else {
        return [...prev, questionText];
      }
    });
  };

  const handleSelectAll = () => {
    const allQuestions = getAllQuestions().map(q => q.text);
    if (selectedQuestions.length === allQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(allQuestions);
    }
  };

  const handleCreateContent = () => {
    if (!questionsData || selectedQuestions.length === 0) {
      toast.error('Please select some questions to create content');
      return;
    }

    navigate('/content-builder', {
      state: {
        mainKeyword: searchTerm,
        peopleQuestions: selectedQuestions,
        questionData: questionsData,
        contentType: 'faq',
        step: 1
      }
    });

    toast.success('🚀 Creating FAQ content with selected questions!');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'questions': return '❓';
      case 'prepositions': return '📍';
      case 'comparisons': return '⚖️';
      default: return '💭';
    }
  };

  // Auto-analyze when searchTerm changes
  useEffect(() => {
    if (searchTerm && searchTerm.trim()) {
      handleAnalyzeQuestions();
    }
  }, [searchTerm]);

  const displayedQuestions = getAllQuestions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background/60 backdrop-blur-xl border border-border/50 p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">People Questions</h3>
              <p className="text-muted-foreground">
                Discover what people are asking about "{searchTerm}"
              </p>
            </div>
          </div>

          {questionsData && (
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {getCategoryCount('all')}
              </div>
              <div className="text-muted-foreground text-sm">Total Questions</div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Category Filter */}
      {questionsData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-background/60 backdrop-blur-xl border border-border/50 p-4"
        >
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const count = getCategoryCount(category.id as any);
              const Icon = category.icon;
              
              return (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category.id as any)}
                  className={`${
                    activeCategory === category.id
                      ? 'bg-primary hover:bg-primary/80'
                      : 'border-border text-muted-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {category.label}
                  <Badge 
                    variant="secondary" 
                    className="ml-2 bg-muted text-muted-foreground border-0"
                  >
                    {count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Selection Controls */}
      {questionsData && displayedQuestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-background/60 backdrop-blur-xl border border-border/50 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                {selectedQuestions.length} of {displayedQuestions.length} questions selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="border-border text-muted-foreground hover:bg-accent"
              >
                {selectedQuestions.length === displayedQuestions.length ? 'Deselect All' : 'Select All'}
              </Button>
              {selectedQuestions.length > 0 && (
                <Button
                  size="sm"
                  onClick={handleCreateContent}
                  className="bg-primary hover:bg-primary/80"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create FAQ Content ({selectedQuestions.length})
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Questions List */}
      {displayedQuestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {displayedQuestions.map((question, index) => (
            <motion.div
              key={`${question.category}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-background/60 backdrop-blur-xl border cursor-pointer transition-all duration-300 p-4 ${
                selectedQuestions.includes(question.text)
                  ? 'bg-primary/10 border-primary/30 ring-1 ring-primary/20'
                  : 'border-border/50 hover:border-border'
              }`}
              onClick={() => handleQuestionSelect(question.text)}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center mt-1">
                  {selectedQuestions.includes(question.text) ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getCategoryIcon(question.category)}</span>
                    <Badge 
                      variant="outline" 
                      className="text-xs border-border text-muted-foreground bg-muted/50"
                    >
                      {question.category}
                    </Badge>
                  </div>
                  
                  <p className="text-foreground font-medium mb-2 leading-relaxed">
                    {question.text}
                  </p>
                  
                  {question.searchVolume && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-green-400" />
                      <Badge 
                        variant="outline" 
                        className="text-xs text-green-400 border-green-400/30 bg-green-400/10"
                      >
                        {question.searchVolume} searches
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Stats Summary */}
      {questionsData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-background/60 backdrop-blur-xl border border-border/50 p-6"
        >
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Analysis Summary
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(1).map((category) => {
              const count = getCategoryCount(category.id as any);
              const Icon = category.icon;
              
                return (
                  <div key={category.id} className="text-center p-4 bg-muted/50 rounded-lg border border-border">
                    <Icon className={`h-8 w-8 mx-auto mb-2 ${category.color}`} />
                    <div className="text-2xl font-bold text-foreground">{count}</div>
                    <div className="text-muted-foreground text-sm">{category.label}</div>
                  </div>
                );
            })}
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-background/60 backdrop-blur-xl border border-border/50 p-8 text-center"
        >
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Analyzing People Questions</h3>
          <p className="text-muted-foreground">
            Discovering what people are asking about "{searchTerm}"...
          </p>
        </motion.div>
      )}

      {/* Empty State */}
      {!isAnalyzing && !questionsData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background/60 backdrop-blur-xl border border-border/50 p-12 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-blue-400/20 flex items-center justify-center mx-auto mb-6">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Discover Questions</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Enter a keyword to analyze what people are asking about that topic 
            across search engines and forums.
          </p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-blue-400" />
              <span>Questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-green-400" />
              <span>Prepositions</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-400" />
              <span>Comparisons</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};