import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, Lightbulb, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { opportunityHunterService } from '@/services/opportunityHunterService';
import { aiStrategyService } from '@/services/aiStrategyService';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const ContentOpportunitiesIndicator: React.FC = () => {
  const [totalOpportunities, setTotalOpportunities] = useState(0);
  const [loading, setLoading] = useState(true);
  const [breakdown, setBreakdown] = useState({
    opportunities: 0,
    strategies: 0,
    historical: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadOpportunitiesCount();
  }, []);

  const loadOpportunitiesCount = async () => {
    try {
      setLoading(true);
      
      // Load opportunities from multiple sources in parallel
      const [opportunitiesData, strategiesData, historicalData] = await Promise.all([
        opportunityHunterService.getOpportunities().catch(() => []),
        aiStrategyService.getStrategies().catch(() => []),
        loadHistoricalProposals().catch(() => [])
      ]);

      // Count opportunities from Opportunity Hunter
      const opportunitiesCount = opportunitiesData?.length || 0;

      // Count proposals from AI strategies
      let strategiesCount = 0;
      if (strategiesData && Array.isArray(strategiesData)) {
        for (const strategy of strategiesData) {
          if (strategy.proposals && Array.isArray(strategy.proposals)) {
            strategiesCount += strategy.proposals.length;
          }
        }
      }

      // Count historical proposals
      const historicalCount = historicalData?.length || 0;

      const total = opportunitiesCount + strategiesCount + historicalCount;

      setBreakdown({
        opportunities: opportunitiesCount,
        strategies: strategiesCount,
        historical: historicalCount
      });
      setTotalOpportunities(total);
      
      console.log('📊 Content opportunities loaded:', {
        total,
        breakdown: { opportunities: opportunitiesCount, strategies: strategiesCount, historical: historicalCount }
      });
    } catch (error) {
      console.error('Error loading content opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistoricalProposals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('ai_strategy_proposals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return data || [];
  };

  const handleViewOpportunities = () => {
    navigate('/research/content-strategy');
  };

  if (loading) {
    return (
      <Card className="glass-panel border-white/10 bg-white/5 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-neon-blue animate-spin" />
            <div className="space-y-1">
              <div className="h-4 bg-white/10 rounded w-32 animate-pulse" />
              <div className="h-3 bg-white/10 rounded w-20 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="glass-panel border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group cursor-pointer"
            onClick={handleViewOpportunities}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 flex items-center justify-center backdrop-blur-xl border border-white/20">
              <Target className="w-5 h-5 text-neon-blue" />
            </div>
            <span className="bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
              Content Opportunities
            </span>
          </CardTitle>
          <CardDescription className="text-white/60">
            Available content opportunities from AI analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold bg-gradient-to-r from-neon-blue to-cyan-400 bg-clip-text text-transparent">
                  {totalOpportunities}
                </p>
                <p className="text-xs text-white/50">total opportunities</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="border-neon-purple/30 bg-neon-purple/10 hover:bg-neon-purple/20 text-neon-purple"
                onClick={(e) => {
                  e.stopPropagation();
                  loadOpportunitiesCount();
                }}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Active Strategies</span>
                <span className="text-white">{breakdown.strategies}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Opportunity Hunter</span>
                <span className="text-white">{breakdown.opportunities}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Historical</span>
                <span className="text-white">{breakdown.historical}</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-white/20 bg-white/10 hover:bg-white/20 text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleViewOpportunities();
              }}
            >
              View All Opportunities
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};