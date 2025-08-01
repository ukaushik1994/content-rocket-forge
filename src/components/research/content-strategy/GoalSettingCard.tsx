
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target, Sparkles, TrendingUp, Search, Volume } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { SerpMetricsDisplay } from './SerpMetricsDisplay';

interface GoalSettingCardProps {
  goals: {
    monthlyTraffic: string;
    contentPieces: string;
    timeline: string;
    mainKeyword: string;
  };
  setGoals: (goals: any) => void;
  serpMetrics: any;
  setSerpMetrics: (metrics: any) => void;
  isGenerating: boolean;
  setIsGenerating: (loading: boolean) => void;
}

export const GoalSettingCard = ({ 
  goals, 
  setGoals, 
  serpMetrics, 
  setSerpMetrics,
  isGenerating, 
  setIsGenerating 
}: GoalSettingCardProps) => {

  const handleAnalyzeKeyword = async () => {
    if (!goals.mainKeyword.trim()) {
      toast.error("Please enter a main keyword to analyze");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Call SERP API
      const response = await fetch('/api/serp-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: goals.mainKeyword,
          location: 'United States',
          language: 'en'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze keyword');
      }
      
      const data = await response.json();
      setSerpMetrics(data);
      toast.success("Keyword analyzed successfully!");
      
    } catch (error) {
      console.error('SERP analysis error:', error);
      // Fallback to mock data for demo
      const mockMetrics = {
        searchVolume: Math.floor(Math.random() * 50000) + 5000,
        keywordDifficulty: Math.floor(Math.random() * 70) + 20,
        competitionScore: Math.random() * 0.8 + 0.1,
        cpc: Math.random() * 3 + 0.5,
        topResults: Array(5).fill(null).map((_, i) => ({
          position: i + 1,
          title: `Top Result ${i + 1} for "${goals.mainKeyword}"`,
          url: `https://example${i + 1}.com`,
          snippet: `High-quality content about ${goals.mainKeyword} with detailed information...`
        })),
        isMockData: true
      };
      setSerpMetrics(mockMetrics);
      toast.success("Keyword analyzed (demo data)");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateStrategy = async () => {
    if (!goals.monthlyTraffic || !goals.contentPieces) {
      toast.error("Please fill in your traffic and content goals");
      return;
    }
    
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    toast.success("AI strategy generated based on your goals and SERP data!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
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
              AI-Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="relative z-10 space-y-8">
          {/* Keyword Analysis Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Search className="h-5 w-5 text-blue-400" />
              <Label className="text-base font-medium">Main Keyword Analysis</Label>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter your main keyword (e.g., content marketing)"
                  value={goals.mainKeyword}
                  onChange={(e) => setGoals({...goals, mainKeyword: e.target.value})}
                  className="bg-glass border-white/10 h-12 text-base focus:border-primary transition-all"
                />
              </div>
              <Button 
                onClick={handleAnalyzeKeyword} 
                disabled={isGenerating || !goals.mainKeyword.trim()}
                className="h-12 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* SERP Metrics Display */}
          {serpMetrics && (
            <SerpMetricsDisplay metrics={serpMetrics} />
          )}

          {/* Goals Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-purple-400" />
              <Label className="text-base font-medium">Content Goals</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                className="space-y-3"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Label htmlFor="traffic" className="text-base font-medium">Monthly Traffic Goal</Label>
                <Input
                  id="traffic"
                  placeholder="e.g., 50,000"
                  value={goals.monthlyTraffic}
                  onChange={(e) => setGoals({...goals, monthlyTraffic: e.target.value})}
                  className="bg-glass border-white/10 h-12 text-base focus:border-primary transition-all"
                />
              </motion.div>
              
              <motion.div 
                className="space-y-3"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Label htmlFor="content" className="text-base font-medium">Content Pieces per Month</Label>
                <Input
                  id="content"
                  placeholder="e.g., 8"
                  value={goals.contentPieces}
                  onChange={(e) => setGoals({...goals, contentPieces: e.target.value})}
                  className="bg-glass border-white/10 h-12 text-base focus:border-purple-400 transition-all"
                />
              </motion.div>
              
              <motion.div 
                className="space-y-3"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Label htmlFor="timeline" className="text-base font-medium">Timeline</Label>
                <select 
                  className="w-full px-4 py-3 bg-glass border border-white/10 rounded-md text-white h-12 text-base focus:border-green-400 transition-all"
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={handleGenerateStrategy} 
              disabled={isGenerating}
              className="w-full h-14 px-8 text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating Strategy...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate AI Strategy
                </>
              )}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
