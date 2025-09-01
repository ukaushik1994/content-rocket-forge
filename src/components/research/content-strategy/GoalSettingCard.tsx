
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target, Sparkles, TrendingUp, Search, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { SerpMetricsDisplay } from './SerpMetricsDisplay';
import { GoalProgressIndicator } from './GoalProgressIndicator';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { useAuth } from '@/contexts/AuthContext';

export const GoalSettingCard = React.memo(() => {
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

  // Load current strategy data
  useEffect(() => {
    if (currentStrategy) {
      setGoals({
        monthlyTraffic: currentStrategy.monthly_traffic_goal?.toString() || '',
        contentPieces: currentStrategy.content_pieces_per_month?.toString() || '',
        timeline: currentStrategy.timeline || '3 months',
        mainKeyword: currentStrategy.main_keyword || ''
      });
    }
  }, [currentStrategy]);

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

    if (!goals.monthlyTraffic || !goals.contentPieces) {
      toast.error("Please fill in your traffic and content goals");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const strategyData = {
        name: `Content Strategy - ${goals.mainKeyword || 'General'}`,
        monthly_traffic_goal: parseInt(goals.monthlyTraffic) || null,
        content_pieces_per_month: parseInt(goals.contentPieces) || null,
        timeline: goals.timeline,
        main_keyword: goals.mainKeyword || null
      };

      if (currentStrategy) {
        await updateStrategy(currentStrategy.id, strategyData);
      } else {
        await createStrategy(strategyData);
      }
      
      // Auto-generate AI proposals based on goals after saving strategy
      const { generateGoalBasedProposals } = ctx || {};
      if (generateGoalBasedProposals && goals.contentPieces) {
        toast.success('Strategy saved! Generating AI proposals to match your goals...');
        setTimeout(() => {
          generateGoalBasedProposals(goals);
        }, 500);
      }
    } catch (error) {
      console.error('Strategy save error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-md border-border/40 shadow-2xl rounded-2xl">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
            <span className="text-xl font-medium text-foreground">Loading strategy...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="bg-card/80 backdrop-blur-md border-border/40 shadow-2xl overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3" />
        
        <CardHeader className="relative z-10 pb-8 pt-8">
          <CardTitle className="flex items-center gap-4 text-3xl">
            <motion.div 
              className="p-3 bg-primary/10 rounded-2xl border border-primary/20"
              whileHover={{ scale: 1.05 }}
            >
              <Target className="h-7 w-7 text-primary" />
            </motion.div>
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent font-semibold">
              Strategy Goals & SERP Analysis
            </span>
            <Badge variant="secondary" className="ml-auto px-4 py-1 rounded-full text-sm font-medium">
              {currentStrategy ? 'Active Strategy' : 'New Strategy'}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="relative z-10 space-y-10 px-8 pb-8">
          {/* Keyword Analysis Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Search className="h-6 w-6 text-blue-500" />
              <Label className="text-xl font-semibold text-foreground">Main Keyword Analysis</Label>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter your main keyword (e.g., content marketing)"
                  value={goals.mainKeyword}
                  onChange={(e) => setGoals({...goals, mainKeyword: e.target.value})}
                  className="h-14 text-lg px-6 rounded-xl border-border/40 bg-background/50 backdrop-blur-sm focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>
              <Button 
                onClick={handleAnalyzeKeyword} 
                disabled={isGenerating || !goals.mainKeyword.trim()}
                className="h-14 px-8 text-lg font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl shadow-lg transition-all duration-300"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-5 w-5 mr-3" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* SERP Metrics Display */}
          {serpMetrics && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <SerpMetricsDisplay metrics={serpMetrics} />
            </motion.div>
          )}

          {/* Goal Progress Indicator */}
          {currentStrategy && goals.contentPieces && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <GoalProgressIndicator goals={goals} />
            </motion.div>
          )}

          {/* Goals Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Target className="h-6 w-6 text-purple-500" />
              <Label className="text-xl font-semibold text-foreground">Content Goals</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                className="space-y-4"
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Label htmlFor="traffic" className="text-lg font-medium text-foreground">Monthly Traffic Goal</Label>
                <Input
                  id="traffic"
                  placeholder="e.g., 50,000"
                  value={goals.monthlyTraffic}
                  onChange={(e) => setGoals({...goals, monthlyTraffic: e.target.value})}
                  className="h-14 text-lg px-6 rounded-xl border-border/40 bg-background/50 backdrop-blur-sm focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </motion.div>
              
              <motion.div 
                className="space-y-4"
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Label htmlFor="content" className="text-lg font-medium text-foreground">Content Pieces per Month</Label>
                <Input
                  id="content"
                  placeholder="e.g., 8"
                  value={goals.contentPieces}
                  onChange={(e) => setGoals({...goals, contentPieces: e.target.value})}
                  className="h-14 text-lg px-6 rounded-xl border-border/40 bg-background/50 backdrop-blur-sm focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/20 transition-all"
                />
              </motion.div>
              
              <motion.div 
                className="space-y-4"
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Label htmlFor="timeline" className="text-lg font-medium text-foreground">Timeline</Label>
                <select 
                  className="w-full px-6 py-4 bg-background/50 backdrop-blur-sm border border-border/40 rounded-xl text-foreground h-14 text-lg focus:border-green-500/60 focus:ring-1 focus:ring-green-500/20 transition-all"
                  value={goals.timeline}
                  onChange={(e) => setGoals({...goals, timeline: e.target.value})}
                >
                  <option value="1 month">1 month</option>
                  <option value="3 months">3 months</option>
                  <option value="6 months">6 months</option>
                  <option value="12 months">12 months</option>
                </select>
              </motion.div>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="pt-4"
          >
            <Button 
              onClick={handleSaveStrategy} 
              disabled={isGenerating}
              className="w-full h-16 px-10 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary rounded-xl transition-all duration-300 shadow-xl"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Saving Strategy...
                </>
              ) : (
                <>
                  <Target className="h-6 w-6 mr-3" />
                  {currentStrategy ? 'Update Strategy' : 'Save Strategy & Generate AI Proposals'}
                </>
              )}
            </Button>
            
            {/* Strategy Action Status */}
            {!isGenerating && goals.contentPieces && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center pt-4"
              >
                {!currentStrategy ? (
                  <div className="flex items-center justify-center gap-3 text-muted-foreground text-base">
                    <AlertCircle className="h-5 w-5" />
                    <span>Save your goals to unlock AI proposal generation</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3 text-green-500 text-base font-medium">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Strategy saved! AI proposals will generate automatically</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
