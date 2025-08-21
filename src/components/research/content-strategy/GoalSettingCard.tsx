
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { useAuth } from '@/contexts/AuthContext';

export const GoalSettingCard = React.memo(() => {
  const { user } = useAuth();
  const { 
    currentStrategy, 
    createStrategy, 
    updateStrategy, 
    loading 
  } = useContentStrategy();

  const [monthlyTraffic, setMonthlyTraffic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Load current strategy data
  useEffect(() => {
    if (currentStrategy) {
      setMonthlyTraffic(currentStrategy.monthly_traffic_goal?.toString() || '');
    }
  }, [currentStrategy]);

  const handleSaveStrategy = async () => {
    if (!user) {
      toast.error("Please log in to save your strategy");
      return;
    }

    if (!monthlyTraffic) {
      toast.error("Please enter your monthly traffic goal");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const strategyData = {
        name: `Content Strategy - Traffic Goal`,
        monthly_traffic_goal: parseInt(monthlyTraffic) || null
      };

      if (currentStrategy) {
        await updateStrategy(currentStrategy.id, strategyData);
      } else {
        await createStrategy(strategyData);
      }
      
      toast.success('Traffic goal saved successfully!');
    } catch (error) {
      console.error('Strategy save error:', error);
      toast.error('Failed to save strategy');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass-panel border-white/10 shadow-2xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-white">Loading strategy...</span>
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
      <Card className="glass-panel border-white/10 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5" />
        
        <CardHeader className="relative z-10 pb-6">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl backdrop-blur-sm border border-white/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Set Your Traffic Goal
            </span>
            <Badge variant="outline" className="text-primary border-primary ml-auto">
              {currentStrategy ? 'Active Strategy' : 'New Strategy'}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="relative z-10 space-y-8">
          {/* Traffic Goal Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-primary" />
              <Label className="text-base font-medium">Monthly Traffic Goal</Label>
            </div>
            
            <div className="max-w-md mx-auto">
              <motion.div 
                className="space-y-3"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Input
                  id="traffic"
                  placeholder="e.g., 50,000"
                  value={monthlyTraffic}
                  onChange={(e) => setMonthlyTraffic(e.target.value)}
                  className="bg-glass border-white/10 h-12 text-base focus:border-primary transition-all text-center text-lg"
                />
                <p className="text-sm text-white/60 text-center">
                  Enter your desired monthly traffic goal
                </p>
              </motion.div>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={handleSaveStrategy} 
              disabled={isGenerating}
              className="w-full h-14 px-8 text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving Strategy...
                </>
              ) : (
                <>
                  <Target className="h-5 w-5 mr-2" />
                  {currentStrategy ? 'Update Traffic Goal' : 'Save Traffic Goal'}
                </>
              )}
            </Button>
            
            {/* Strategy Status */}
            {!isGenerating && monthlyTraffic && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mt-4"
              >
                {currentStrategy ? (
                  <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Traffic goal saved successfully</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>Ready to save your traffic goal</span>
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
