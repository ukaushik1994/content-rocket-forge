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
  const {
    user
  } = useAuth();
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
        }, 500);
      }
    } catch (error) {
      console.error('Strategy save error:', error);
      toast.error('Failed to save strategy');
    } finally {
      setIsGenerating(false);
    }
  };
  if (loading) {
    return <Card className="glass-panel border-white/10 shadow-2xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-white">Loading strategy...</span>
          </div>
        </CardContent>
      </Card>;
  }
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.4,
    ease: "easeOut"
  }}>
      <Card className="glass-panel border-white/10 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5" />
        
        <CardHeader className="relative z-10 pb-6">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl backdrop-blur-sm border border-white/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Strategy Goals & SERP Analysis
            </span>
            <Badge variant="outline" className="text-primary border-primary ml-auto">
              {currentStrategy ? 'Active Strategy' : 'New Strategy'}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="relative z-10 space-y-8">
          {/* Keyword Analysis Section */}
          

          {/* SERP Metrics Display */}
          {serpMetrics && <SerpMetricsDisplay metrics={serpMetrics} />}

          {/* Goal Progress Indicator */}
          {currentStrategy && goals.contentPieces && <GoalProgressIndicator goals={goals} />}

          {/* Goals Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-purple-400" />
              <Label className="text-base font-medium">Content Goals</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div className="space-y-3" whileHover={{
              scale: 1.02
            }} transition={{
              duration: 0.2
            }}>
                <Label htmlFor="traffic" className="text-base font-medium">Monthly Traffic Goal</Label>
                <Input id="traffic" placeholder="e.g., 50,000" value={goals.monthlyTraffic} onChange={e => setGoals({
                ...goals,
                monthlyTraffic: e.target.value
              })} className="bg-glass border-white/10 h-12 text-base focus:border-primary transition-all" />
              </motion.div>
              
              <motion.div className="space-y-3" whileHover={{
              scale: 1.02
            }} transition={{
              duration: 0.2
            }}>
                <Label htmlFor="content" className="text-base font-medium">Content Pieces per Month (Optional)</Label>
                <Input id="content" placeholder="Let AI suggest optimal amount" value={goals.contentPieces} onChange={e => setGoals({
                ...goals,
                contentPieces: e.target.value
              })} className="bg-glass border-white/10 h-12 text-base focus:border-purple-400 transition-all" />
                <p className="text-xs text-white/50">Leave empty to let AI suggest based on traffic goal</p>
              </motion.div>
              
              <motion.div className="space-y-3" whileHover={{
              scale: 1.02
            }} transition={{
              duration: 0.2
            }}>
                <Label htmlFor="timeline" className="text-base font-medium">Timeline</Label>
                <select className="w-full px-4 py-3 bg-glass border border-white/10 rounded-md text-white h-12 text-base focus:border-green-400 transition-all" value={goals.timeline} onChange={e => setGoals({
                ...goals,
                timeline: e.target.value
              })}>
                  <option value="1 month">1 month</option>
                  <option value="3 months">3 months</option>
                  <option value="6 months">6 months</option>
                  <option value="12 months">12 months</option>
                </select>
              </motion.div>
            </div>
          </div>

          <motion.div whileHover={{
          scale: 1.02
        }} whileTap={{
          scale: 0.98
        }}>
            <Button onClick={handleSaveStrategy} disabled={isGenerating || !goals.monthlyTraffic} className="w-full h-14 px-8 text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg">
              {isGenerating ? <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating AI Proposals...
                </> : <>
                  <Target className="h-5 w-5 mr-2" />
                  {currentStrategy ? 'Update Strategy' : 'Save Goals & Generate Proposals'}
                </>}
            </Button>
            
            {/* Strategy Action Status */}
            {!isGenerating && <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} className="text-center">
                {!currentStrategy ? <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>Set your monthly traffic goal to get started with AI proposals</span>
                  </div> : <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Strategy saved! Generate more proposals in Strategies tab</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>}
              </motion.div>}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>;
});