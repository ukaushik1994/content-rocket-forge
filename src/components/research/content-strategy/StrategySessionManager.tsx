import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  History, 
  Clock, 
  Hash, 
  FileText,
  Archive,
  Trash2,
  Plus,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { aiStrategyService, AIStrategy, StrategySession } from '@/services/aiStrategyService';
import { useToast } from '@/hooks/use-toast';

interface StrategySessionManagerProps {
  onStrategyGenerated?: (proposals: any[]) => void;
  goals?: any;
}

export function StrategySessionManager({ onStrategyGenerated, goals }: StrategySessionManagerProps) {
  const [strategies, setStrategies] = useState<AIStrategy[]>([]);
  const [sessions, setSessions] = useState<StrategySession[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [strategiesData, sessionsData] = await Promise.all([
        aiStrategyService.getStrategies(),
        aiStrategyService.getStrategySessions()
      ]);
      
      setStrategies(strategiesData);
      setSessions(sessionsData);
    } catch (error) {
      console.error('Error loading strategy data:', error);
      toast({
        title: "Error",
        description: "Failed to load strategy sessions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNewStrategy = async () => {
    try {
      setGenerating(true);
      
      // Get used keywords to exclude them
      const usedKeywords = await aiStrategyService.getUsedKeywords();
      
      const result = await aiStrategyService.generateNewStrategy({
        goals: goals || {},
        location: 'United States',
        excludeKeywords: usedKeywords
      });
      
      toast({
        title: 'New Strategy Generated',
        description: result.message
      });
      
      // Refresh data and notify parent
      await loadData();
      onStrategyGenerated?.(result.proposals);
      
    } catch (error) {
      console.error('Error generating new strategy:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate new strategy';
      
      toast({
        title: 'Strategy Generation Failed',
        description: errorMessage.includes('API key') 
          ? 'Please configure your OpenAI and SERP API keys in Settings'
          : errorMessage,
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  const archiveStrategy = async (strategyId: string) => {
    try {
      await aiStrategyService.archiveStrategy(strategyId);
      toast({
        title: "Strategy Archived",
        description: "Strategy has been archived"
      });
      await loadData();
    } catch (error) {
      console.error('Error archiving strategy:', error);
      toast({
        title: "Error",
        description: "Failed to archive strategy",
        variant: "destructive"
      });
    }
  };

  const deleteStrategy = async (strategyId: string) => {
    try {
      await aiStrategyService.deleteStrategy(strategyId);
      toast({
        title: "Strategy Deleted",
        description: "Strategy has been permanently deleted"
      });
      await loadData();
    } catch (error) {
      console.error('Error deleting strategy:', error);
      toast({
        title: "Error",
        description: "Failed to delete strategy",
        variant: "destructive"
      });
    }
  };

  const loadStrategyProposals = (strategy: AIStrategy) => {
    onStrategyGenerated?.(strategy.proposals);
    toast({
      title: 'Strategy Loaded',
      description: `Loaded ${strategy.proposals.length} proposals from ${strategy.title}`
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <History className="h-5 w-5 text-purple-400" />
              Strategy Sessions
            </CardTitle>
            <CardDescription className="text-white/60">
              Manage your AI-generated content strategies and avoid keyword duplication
            </CardDescription>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="gap-2 border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </motion.div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="sessions" className="space-y-4">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger 
              value="sessions"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
            >
              Sessions Overview
            </TabsTrigger>
            <TabsTrigger 
              value="detailed"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
            >
              Detailed View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="space-y-4">
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 mx-auto mb-4 text-white/40" />
                <p className="text-white/60">No strategy sessions found</p>
                <p className="text-sm text-white/40">Generate your first AI strategy to get started</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {sessions.map((session, idx) => (
                  <motion.div
                    key={session.session_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-orange-400" />
                              <span className="font-medium text-white">
                                {formatDate(session.generated_at)}
                              </span>
                              <Badge 
                                variant="outline" 
                                className="text-xs text-white/80 border-white/20 bg-white/10"
                              >
                                {session.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-white/60">
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3 text-blue-400" />
                                {session.proposals_count} proposals
                              </span>
                              <span className="flex items-center gap-1">
                                <Hash className="h-3 w-3 text-green-400" />
                                {session.keywords_used.length} keywords used
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const strategy = strategies.find(s => 
                                  s.session_metadata?.session_id === session.session_id
                                );
                                if (strategy) loadStrategyProposals(strategy);
                              }}
                              className="border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
                            >
                              Load
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            {strategies.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-white/40" />
                <p className="text-white/60">No strategies found</p>
                <p className="text-sm text-white/40">Generate your first AI strategy to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {strategies.map((strategy, idx) => (
                  <motion.div
                    key={strategy.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg text-white">{strategy.title}</CardTitle>
                            <CardDescription className="text-white/60">
                              {strategy.description || 'No description provided'}
                            </CardDescription>
                          </div>
                          <Badge 
                            variant="outline" 
                            className="text-xs text-white/80 border-white/20 bg-white/10"
                          >
                            {strategy.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-white/10">
                            <div className="font-medium text-white text-xl">
                              {strategy.proposals.length}
                            </div>
                            <div className="text-white/60">Proposals</div>
                          </div>
                          <div className="text-center p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-white/10">
                            <div className="font-medium text-white text-xl">
                              {strategy.keywords.length}
                            </div>
                            <div className="text-white/60">Keywords</div>
                          </div>
                          <div className="text-center p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-white/10">
                            <div className="font-medium text-white text-xl">
                              {formatDate(strategy.generated_at).split(',')[0]}
                            </div>
                            <div className="text-white/60">Generated</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/20">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadStrategyProposals(strategy)}
                            className="gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-white/20 text-white hover:bg-white/10"
                          >
                            <FileText className="h-4 w-4" />
                            Load Proposals
                          </Button>
                          
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => archiveStrategy(strategy.id)}
                              className="gap-2 border-white/20 text-white/80 hover:bg-white/10"
                            >
                              <Archive className="h-4 w-4" />
                              Archive
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteStrategy(strategy.id)}
                              className="gap-2 border-red-400/30 text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}