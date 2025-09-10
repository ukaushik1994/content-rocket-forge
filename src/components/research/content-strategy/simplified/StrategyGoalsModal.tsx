import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target, Sparkles, TrendingUp, Search, CheckCircle2, AlertCircle, ArrowRight, Loader2, KeyboardIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { SerpMetricsDisplay } from '../SerpMetricsDisplay';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { useAuth } from '@/contexts/AuthContext';
import { StrategyGenerationProgress } from '../StrategyGenerationProgress';

interface StrategyGoalsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ValidationErrors {
  monthlyTraffic?: string;
  contentPieces?: string;
  mainKeyword?: string;
}

export const StrategyGoalsModal: React.FC<StrategyGoalsModalProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const {
    currentStrategy,
    createStrategy,
    updateStrategy,
    analyzeSERP,
    saveInsight,
    loading,
    generateGoalBasedProposals
  } = useContentStrategy();
  
  const [goals, setGoals] = useState({
    monthlyTraffic: '',
    contentPieces: '',
    timeline: '3 months',
    mainKeyword: ''
  });
  const [serpMetrics, setSerpMetrics] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<'goals' | 'keyword' | 'analyze'>('goals');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isValid, setIsValid] = useState(false);

  // Validation function
  const validateGoals = useCallback(() => {
    const errors: ValidationErrors = {};
    
    if (!goals.monthlyTraffic.trim()) {
      errors.monthlyTraffic = 'Monthly traffic goal is required';
    } else if (isNaN(Number(goals.monthlyTraffic)) || Number(goals.monthlyTraffic) <= 0) {
      errors.monthlyTraffic = 'Please enter a valid positive number';
    }
    
    if (goals.contentPieces && (isNaN(Number(goals.contentPieces)) || Number(goals.contentPieces) <= 0)) {
      errors.contentPieces = 'Please enter a valid positive number';
    }
    
    if (goals.mainKeyword && goals.mainKeyword.length < 2) {
      errors.mainKeyword = 'Keyword must be at least 2 characters';
    }
    
    setValidationErrors(errors);
    setIsValid(Object.keys(errors).length === 0 && goals.monthlyTraffic.trim() !== '');
    return Object.keys(errors).length === 0;
  }, [goals]);

  // Load current strategy data when modal opens
  useEffect(() => {
    if (open && currentStrategy) {
      setGoals({
        monthlyTraffic: currentStrategy.monthly_traffic_goal?.toString() || '',
        contentPieces: currentStrategy.content_pieces_per_month?.toString() || '',
        timeline: currentStrategy.timeline || '3 months',
        mainKeyword: currentStrategy.main_keyword || ''
      });
      if (currentStrategy.main_keyword) {
        setCurrentStep('analyze');
      }
    } else if (open && !currentStrategy) {
      setGoals({
        monthlyTraffic: '',
        contentPieces: '',
        timeline: '3 months',
        mainKeyword: ''
      });
      setCurrentStep('goals');
      setValidationErrors({});
    }
  }, [open, currentStrategy]);

  // Real-time validation
  useEffect(() => {
    validateGoals();
  }, [validateGoals]);

  const handleAnalyzeKeyword = async () => {
    if (!goals.mainKeyword.trim()) {
      toast.error("Please enter a main keyword to analyze");
      return;
    }
    if (!user) {
      toast.error("Please log in to analyze keywords");
      return;
    }
    
    setIsGenerating(true);
    try {
      const data = await analyzeSERP(goals.mainKeyword);
      setSerpMetrics(data);

      // Save the insight to database
      await saveInsight({
        keyword: goals.mainKeyword,
        search_volume: data.searchVolume,
        keyword_difficulty: data.keywordDifficulty,
        competition_score: data.competitionScore,
        serp_data: data,
        opportunity_score: Math.floor((100 - data.keywordDifficulty) * (data.searchVolume / 10000))
      });
      toast.success("Keyword analyzed successfully!");
    } catch (error) {
      console.error('SERP analysis error:', error);
      toast.error('Failed to analyze keyword. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveStrategy = async () => {
    if (!user) {
      toast.error("Please log in to save your strategy");
      return;
    }
    
    if (!validateGoals()) {
      toast.error("Please fix validation errors before saving");
      return;
    }
    
    setIsGenerating(true);
    try {
      const strategyData = {
        name: `Content Strategy - ${goals.mainKeyword || 'General'}`,
        monthly_traffic_goal: parseInt(goals.monthlyTraffic) || null,
        content_pieces_per_month: goals.contentPieces ? parseInt(goals.contentPieces) : null,
        timeline: goals.timeline,
        main_keyword: goals.mainKeyword || null
      };
      
      if (currentStrategy) {
        await updateStrategy(currentStrategy.id, strategyData);
      } else {
        await createStrategy(strategyData);
      }

      // Always generate AI proposals based on traffic goal
      if (generateGoalBasedProposals) {
        toast.success('Strategy saved! Generating AI proposals based on your traffic goal...');
        setTimeout(() => {
          generateGoalBasedProposals({
            monthlyTraffic: parseInt(goals.monthlyTraffic),
            contentPieces: 6, // Default batch size
            timeline: goals.timeline,
            mainKeyword: goals.mainKeyword
          });
          onOpenChange(false); // Close modal after successful save
        }, 500);
      }
    } catch (error) {
      console.error('Strategy save error:', error);
      toast.error('Failed to save strategy. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (currentStep !== 'analyze' && canProceedToNext()) {
        nextStep();
      } else if (currentStep === 'analyze' && isValid) {
        handleSaveStrategy();
      }
    } else if (e.key === 'Escape') {
      onOpenChange(false);
    }
  }, [currentStep, isValid]);

  const canProceedToNext = () => {
    if (currentStep === 'goals') {
      return goals.monthlyTraffic.trim() !== '' && !validationErrors.monthlyTraffic;
    }
    if (currentStep === 'keyword') {
      return true; // Keyword is optional
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep === 'goals') {
      setCurrentStep('keyword');
    } else if (currentStep === 'keyword') {
      setCurrentStep('analyze');
    }
  };

  const prevStep = () => {
    if (currentStep === 'analyze') {
      setCurrentStep('keyword');
    } else if (currentStep === 'keyword') {
      setCurrentStep('goals');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-3xl max-w-[95vw] sm:max-w-3xl glass-panel border-white/20 text-white max-h-[90vh] overflow-y-auto"
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-labelledby="strategy-modal-title"
        aria-describedby="strategy-modal-description"
      >
        <DialogHeader>
          <DialogTitle 
            id="strategy-modal-title"
            className="text-xl sm:text-2xl font-bold flex items-center gap-3"
          >
            <motion.div 
              className="p-2 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl backdrop-blur-sm border border-white/10"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Target className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </motion.div>
            {currentStrategy ? 'Update Strategy Goals' : 'Create Content Strategy'}
          </DialogTitle>
          <p id="strategy-modal-description" className="text-sm text-white/70 mt-2">
            Set your content goals and let AI generate targeted proposals
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2 sm:space-x-4 overflow-x-auto">
            {[
              { id: 'goals', label: 'Goals', icon: Target },
              { id: 'keyword', label: 'Keyword', icon: Search },
              { id: 'analyze', label: 'Analysis', icon: TrendingUp }
            ].map((step, index) => (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <motion.div 
                  className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-300 ${
                    currentStep === step.id 
                      ? 'border-primary bg-primary/20 text-primary shadow-lg shadow-primary/20' 
                      : index < ['goals', 'keyword', 'analyze'].indexOf(currentStep)
                        ? 'border-green-400 bg-green-400/20 text-green-400'
                        : 'border-white/30 text-white/50'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  layout
                >
                  {index < ['goals', 'keyword', 'analyze'].indexOf(currentStep) ? (
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : currentStep === step.id && isGenerating ? (
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  ) : (
                    <step.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </motion.div>
                <div className="hidden sm:block text-xs font-medium mt-2 absolute translate-y-8 text-center min-w-[60px] -translate-x-1/2 left-1/2">
                  {step.label}
                </div>
                {index < 2 && (
                  <motion.div 
                    className={`w-4 sm:w-8 h-0.5 transition-all duration-500 ${
                      index < ['goals', 'keyword', 'analyze'].indexOf(currentStep)
                        ? 'bg-green-400'
                        : 'bg-white/30'
                    }`}
                    layout
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {currentStep === 'goals' && (
              <motion.div
                key="goals"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card className="glass-panel border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-400" />
                      Content Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="traffic" className="text-base font-medium flex items-center gap-2">
                          Monthly Traffic Goal *
                          {validationErrors.monthlyTraffic && (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                        </Label>
                        <Input
                          id="traffic"
                          type="number"
                          placeholder="e.g., 50,000"
                          value={goals.monthlyTraffic}
                          onChange={(e) => setGoals({ ...goals, monthlyTraffic: e.target.value })}
                          className={`glass-panel border-white/10 h-12 text-base transition-all duration-300 focus:ring-2 focus:ring-primary/20 ${
                            validationErrors.monthlyTraffic 
                              ? 'border-destructive focus:border-destructive' 
                              : 'focus:border-primary'
                          }`}
                          aria-describedby={validationErrors.monthlyTraffic ? "traffic-error" : undefined}
                          autoFocus
                        />
                        {validationErrors.monthlyTraffic && (
                          <motion.p 
                            id="traffic-error"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-destructive flex items-center gap-1"
                          >
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.monthlyTraffic}
                          </motion.p>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="timeline" className="text-base font-medium">Timeline</Label>
                        <select
                          id="timeline"
                          className="w-full px-4 py-3 glass-panel border border-white/10 rounded-md text-white h-12 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                          value={goals.timeline}
                          onChange={(e) => setGoals({ ...goals, timeline: e.target.value })}
                          aria-label="Content strategy timeline"
                        >
                          <option value="1 month">1 month</option>
                          <option value="3 months">3 months</option>
                          <option value="6 months">6 months</option>
                          <option value="12 months">12 months</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="content" className="text-base font-medium flex items-center gap-2">
                        Content Pieces per Month (Optional)
                        {validationErrors.contentPieces && (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </Label>
                      <Input
                        id="content"
                        type="number"
                        placeholder="Leave empty to let AI suggest optimal amount"
                        value={goals.contentPieces}
                        onChange={(e) => setGoals({ ...goals, contentPieces: e.target.value })}
                        className={`glass-panel border-white/10 h-12 text-base transition-all duration-300 focus:ring-2 focus:ring-primary/20 ${
                          validationErrors.contentPieces 
                            ? 'border-destructive focus:border-destructive' 
                            : 'focus:border-purple-400'
                        }`}
                        aria-describedby="content-help"
                      />
                      {validationErrors.contentPieces ? (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-destructive flex items-center gap-1"
                        >
                          <AlertCircle className="h-3 w-3" />
                          {validationErrors.contentPieces}
                        </motion.p>
                      ) : (
                        <p id="content-help" className="text-xs text-white/50">
                          Leave empty to let AI suggest based on traffic goal
                        </p>
                      )}
                    </div>

                    {/* Keyboard hint */}
                    <div className="flex items-center gap-2 text-xs text-white/40 pt-2">
                      <KeyboardIcon className="h-3 w-3" />
                      Press Enter to continue
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 'keyword' && (
              <motion.div
                key="keyword"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card className="glass-panel border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Search className="h-5 w-5 text-primary" />
                      Main Keyword (Optional)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Label htmlFor="mainKeyword" className="text-base font-medium flex items-center gap-2">
                        Primary Focus Keyword
                        {validationErrors.mainKeyword && (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </Label>
                      <Input
                        id="mainKeyword"
                        placeholder="e.g., content marketing strategy"
                        value={goals.mainKeyword}
                        onChange={(e) => setGoals({ ...goals, mainKeyword: e.target.value })}
                        className={`glass-panel border-white/10 h-12 text-base transition-all duration-300 focus:ring-2 focus:ring-primary/20 ${
                          validationErrors.mainKeyword 
                            ? 'border-destructive focus:border-destructive' 
                            : 'focus:border-primary'
                        }`}
                        aria-describedby="keyword-help"
                        autoFocus
                      />
                      {validationErrors.mainKeyword ? (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-destructive flex items-center gap-1"
                        >
                          <AlertCircle className="h-3 w-3" />
                          {validationErrors.mainKeyword}
                        </motion.p>
                      ) : (
                        <p id="keyword-help" className="text-xs text-white/50">
                          This will help AI generate more targeted content proposals
                        </p>
                      )}
                    </div>

                    {/* Keyword suggestions */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                      {['content marketing', 'SEO strategy', 'digital marketing', 'social media', 'email marketing', 'content creation'].map((suggestion) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          size="sm"
                          onClick={() => setGoals({ ...goals, mainKeyword: suggestion })}
                          className="text-xs border-white/20 hover:border-primary/50 hover:bg-primary/10"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>

                    {/* Keyboard hint */}
                    <div className="flex items-center gap-2 text-xs text-white/40 pt-2">
                      <KeyboardIcon className="h-3 w-3" />
                      Press Enter to continue
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 'analyze' && (
              <motion.div
                key="analyze"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {goals.mainKeyword && (
                  <Card className="glass-panel border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Search className="h-5 w-5 text-primary" />
                        SERP Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex-1">
                          <Badge variant="outline" className="text-primary border-primary">
                            {goals.mainKeyword}
                          </Badge>
                        </div>
                        <Button
                          onClick={handleAnalyzeKeyword}
                          disabled={isGenerating}
                          className="bg-gradient-to-r from-primary/80 to-blue-500/80 hover:from-primary hover:to-blue-500 w-full sm:w-auto"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Search className="h-4 w-4 mr-2" />
                              Analyze SERP
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <AnimatePresence>
                        {isGenerating && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <StrategyGenerationProgress 
                              isGenerating={isGenerating} 
                              currentStep="keywords"
                              progress={25}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {serpMetrics && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                          >
                            <SerpMetricsDisplay metrics={serpMetrics} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                )}

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-400/30">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        >
                          <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Strategy Ready!</h3>
                          <p className="text-white/70">
                            Save your strategy to start generating AI-powered content proposals
                          </p>
                        </div>

                        {/* Summary */}
                        <div className="bg-white/5 rounded-lg p-4 text-left">
                          <h4 className="font-medium text-white mb-2">Strategy Summary:</h4>
                          <ul className="text-sm text-white/70 space-y-1">
                            <li>• Traffic Goal: {parseInt(goals.monthlyTraffic).toLocaleString()} monthly visits</li>
                            <li>• Timeline: {goals.timeline}</li>
                            {goals.contentPieces && <li>• Content: {goals.contentPieces} pieces/month</li>}
                            {goals.mainKeyword && <li>• Focus: {goals.mainKeyword}</li>}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-white/10"
            layout
          >
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 'goals' || isGenerating}
              className="border-white/20 text-white/80 hover:bg-white/5 transition-all duration-300"
            >
              Previous
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {currentStep !== 'analyze' ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceedToNext() || isGenerating}
                  className="bg-primary/20 hover:bg-primary/30 transition-all duration-300 flex items-center justify-center"
                >
                  {canProceedToNext() ? (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  ) : (
                    'Complete required fields'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleSaveStrategy}
                  disabled={isGenerating || !isValid}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Proposals...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {currentStrategy ? 'Update & Generate Proposals' : 'Save & Generate Proposals'}
                    </>
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};