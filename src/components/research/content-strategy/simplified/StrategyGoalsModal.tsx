import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target, Sparkles, TrendingUp, Search, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { SerpMetricsDisplay } from '../SerpMetricsDisplay';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { useAuth } from '@/contexts/AuthContext';
import { StrategyGenerationProgress } from '../StrategyGenerationProgress';

interface StrategyGoalsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StrategyGoalsModal: React.FC<StrategyGoalsModalProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const {
    currentStrategy,
    createStrategy,
    updateStrategy,
    analyzeSERP,
    saveInsight,
    loading
  } = useContentStrategy();
  const ctx = useContentStrategy();
  
  const [goals, setGoals] = useState({
    monthlyTraffic: '',
    contentPieces: '',
    timeline: '3 months',
    mainKeyword: ''
  });
  const [serpMetrics, setSerpMetrics] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<'goals' | 'keyword' | 'analyze'>('goals');

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
    }
  }, [open, currentStrategy]);

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
      toast.error('Failed to analyze keyword');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveStrategy = async () => {
    if (!user) {
      toast.error("Please log in to save your strategy");
      return;
    }
    
    if (!goals.monthlyTraffic) {
      toast.error("Please set your monthly traffic goal");
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
      const { generateGoalBasedProposals } = ctx || {};
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
      toast.error('Failed to save strategy');
    } finally {
      setIsGenerating(false);
    }
  };

  const canProceedToNext = () => {
    if (currentStep === 'goals') {
      return goals.monthlyTraffic.trim() !== '';
    }
    if (currentStep === 'keyword') {
      return goals.mainKeyword.trim() !== '';
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
      <DialogContent className="max-w-3xl bg-gray-900 border-white/20 text-white max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl backdrop-blur-sm border border-white/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            {currentStrategy ? 'Update Strategy Goals' : 'Create Content Strategy'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-4">
            {[
              { id: 'goals', label: 'Goals', icon: Target },
              { id: 'keyword', label: 'Keyword', icon: Search },
              { id: 'analyze', label: 'Analysis', icon: TrendingUp }
            ].map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  currentStep === step.id 
                    ? 'border-primary bg-primary/20 text-primary' 
                    : index < ['goals', 'keyword', 'analyze'].indexOf(currentStep)
                      ? 'border-green-400 bg-green-400/20 text-green-400'
                      : 'border-white/30 text-white/50'
                }`}>
                  <step.icon className="h-5 w-5" />
                </div>
                {index < 2 && (
                  <div className={`w-8 h-0.5 transition-colors ${
                    index < ['goals', 'keyword', 'analyze'].indexOf(currentStep)
                      ? 'bg-green-400'
                      : 'bg-white/30'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {currentStep === 'goals' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-400" />
                    Content Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="traffic" className="text-base font-medium">Monthly Traffic Goal *</Label>
                      <Input
                        id="traffic"
                        placeholder="e.g., 50,000"
                        value={goals.monthlyTraffic}
                        onChange={(e) => setGoals({ ...goals, monthlyTraffic: e.target.value })}
                        className="bg-glass border-white/10 h-12 text-base focus:border-primary transition-all"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="timeline" className="text-base font-medium">Timeline</Label>
                      <select
                        className="w-full px-4 py-3 bg-glass border border-white/10 rounded-md text-white h-12 text-base focus:border-green-400 transition-all"
                        value={goals.timeline}
                        onChange={(e) => setGoals({ ...goals, timeline: e.target.value })}
                      >
                        <option value="1 month">1 month</option>
                        <option value="3 months">3 months</option>
                        <option value="6 months">6 months</option>
                        <option value="12 months">12 months</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="content" className="text-base font-medium">Content Pieces per Month (Optional)</Label>
                    <Input
                      id="content"
                      placeholder="Leave empty to let AI suggest optimal amount"
                      value={goals.contentPieces}
                      onChange={(e) => setGoals({ ...goals, contentPieces: e.target.value })}
                      className="bg-glass border-white/10 h-12 text-base focus:border-purple-400 transition-all"
                    />
                    <p className="text-xs text-white/50">Leave empty to let AI suggest based on traffic goal</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 'keyword' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Main Keyword (Optional)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Label htmlFor="mainKeyword" className="text-base font-medium">Primary Focus Keyword</Label>
                    <Input
                      id="mainKeyword"
                      placeholder="e.g., content marketing strategy"
                      value={goals.mainKeyword}
                      onChange={(e) => setGoals({ ...goals, mainKeyword: e.target.value })}
                      className="bg-glass border-white/10 h-12 text-base focus:border-primary transition-all"
                    />
                    <p className="text-xs text-white/50">
                      This will help AI generate more targeted content proposals
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 'analyze' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {goals.mainKeyword && (
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Search className="h-5 w-5 text-primary" />
                      SERP Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Badge variant="outline" className="text-primary border-primary">
                          {goals.mainKeyword}
                        </Badge>
                      </div>
                      <Button
                        onClick={handleAnalyzeKeyword}
                        disabled={isGenerating}
                        className="bg-gradient-to-r from-primary/80 to-blue-500/80 hover:from-primary hover:to-blue-500"
                      >
                        {isGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
                    
                    {isGenerating && (
                      <StrategyGenerationProgress 
                        isGenerating={isGenerating} 
                        currentStep="keywords"
                        progress={25}
                      />
                    )}

                    {serpMetrics && <SerpMetricsDisplay metrics={serpMetrics} />}
                  </CardContent>
                </Card>
              )}

              <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-400/30">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">Strategy Ready!</h3>
                      <p className="text-white/70">
                        Save your strategy to start generating AI-powered content proposals
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-white/10">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 'goals'}
              className="border-white/20 text-white/80"
            >
              Previous
            </Button>
            
            <div className="flex gap-3">
              {currentStep !== 'analyze' ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceedToNext()}
                  className="bg-primary/20 hover:bg-primary/30"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSaveStrategy}
                  disabled={isGenerating || !goals.monthlyTraffic}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};