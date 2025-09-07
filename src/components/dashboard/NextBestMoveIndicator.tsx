import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Target, Lightbulb, ArrowRight, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface NextMove {
  cluster: string;
  type: string;
  volume: number;
  priority: string;
  cta: string;
}

export const NextBestMoveIndicator: React.FC = () => {
  const [nextMoves, setNextMoves] = useState<NextMove[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalOpportunities, setTotalOpportunities] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadNextBestMoves();
  }, []);

  const loadNextBestMoves = async () => {
    try {
      setLoading(true);
      
      // Load dashboard summary which contains next moves
      const { data, error } = await supabase.functions.invoke('dashboard-summary');
      
      if (error) throw error;
      
      const moves = data?.next_moves || [];
      setNextMoves(moves);
      
      // Count total opportunities from various sources
      const opportunitiesCount = await loadTotalOpportunities();
      setTotalOpportunities(opportunitiesCount);
      
      console.log('📈 Next best moves loaded:', moves.length);
    } catch (error) {
      console.error('Error loading next best moves:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTotalOpportunities = async (): Promise<number> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      // Count from historical proposals
      const { data: proposals } = await supabase
        .from('ai_strategy_proposals')
        .select('id')
        .eq('user_id', user.id);

      return proposals?.length || 0;
    } catch (error) {
      console.error('Error counting opportunities:', error);
      return 0;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-400/30';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-400/30';
      default: return 'text-white/80 bg-white/10 border-white/20';
    }
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
              <div className="h-4 bg-white/10 rounded w-40 animate-pulse" />
              <div className="h-3 bg-white/10 rounded w-24 animate-pulse" />
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
      <Card className="glass-panel border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 flex items-center justify-center backdrop-blur-xl border border-white/20">
              <Lightbulb className="w-5 h-5 text-neon-blue" />
            </div>
            <span className="bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
              Your Next Best Move
            </span>
          </CardTitle>
          <CardDescription className="text-white/60">
            {totalOpportunities > 0 
              ? `${totalOpportunities} content opportunities available` 
              : 'Discover your next content opportunity'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {nextMoves.length > 0 ? (
              <>
                {nextMoves.slice(0, 3).map((move, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group/item cursor-pointer"
                    onClick={handleViewOpportunities}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white/90 truncate flex-1">
                        {move.cluster}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(move.priority)}`}
                      >
                        {move.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-white/60">
                      <div className="flex items-center gap-2">
                        <Target className="w-3 h-3 text-neon-purple" />
                        <span>{move.type}</span>
                        {move.volume > 0 && (
                          <>
                            <span>•</span>
                            <span>{move.volume.toLocaleString()} vol</span>
                          </>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/40 group-hover/item:text-neon-blue group-hover/item:translate-x-1 transition-all duration-300" />
                    </div>
                  </motion.div>
                ))}
                
                {nextMoves.length > 3 && (
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-xs text-white/50 text-center">
                      +{nextMoves.length - 3} more opportunities
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="p-6 text-center">
                <p className="text-white/60 mb-2">No content opportunities found</p>
                <p className="text-xs text-white/40 mb-4">
                  Start by creating a content strategy to discover opportunities
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-white/20 bg-white/10 hover:bg-white/20 text-white"
                  onClick={handleViewOpportunities}
                >
                  Get Started
                </Button>
              </div>
            )}

            <div className="pt-3 border-t border-white/10">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-white/20 bg-white/10 hover:bg-white/20 text-white gap-2"
                onClick={handleViewOpportunities}
              >
                <TrendingUp className="w-4 h-4" />
                View All Opportunities
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};