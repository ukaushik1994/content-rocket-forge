import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Sparkles, 
  TrendingUp, 
  FileText, 
  CheckCircle2,
  Target,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { aiStrategyService } from '@/services/aiStrategyService';
import { useToast } from '@/hooks/use-toast';

interface ContentStrategyFlowProps {
  goals: {
    monthlyTraffic: string;
  };
}

interface AIProposal {
  id: string;
  title: string;
  description: string;
  primary_keyword: string;
  content_type: string;
  estimated_traffic: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeline_days: number;
}

export const ContentStrategyFlow = ({ goals }: ContentStrategyFlowProps) => {
  const [proposals, setProposals] = useState<AIProposal[]>([]);
  const [selectedProposals, setSelectedProposals] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const { toast } = useToast();

  const monthlyTrafficGoal = parseInt(goals.monthlyTraffic) || 0;

  const generateProposals = async () => {
    if (!monthlyTrafficGoal) {
      toast({
        title: "Set Your Traffic Goal",
        description: "Please set your monthly traffic goal first.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Generate AI proposals based on traffic goal
      const result = await aiStrategyService.generateNewStrategy({
        goals: {
          monthlyTraffic: monthlyTrafficGoal,
          contentPieces: Math.ceil(monthlyTrafficGoal / 1000), // Rough estimate: 1 piece per 1k traffic
          timeline: '3 months',
          mainKeyword: ''
        },
        location: 'United States'
      });

      const aiProposals: AIProposal[] = result.proposals?.map((p: any, index: number) => ({
        id: `proposal-${index}`,
        title: p.title || `Content Piece ${index + 1}`,
        description: p.brief || p.description || 'AI generated content piece',
        primary_keyword: p.primary_keyword || '',
        content_type: p.content_type || 'article',
        estimated_traffic: p.estimated_impressions || Math.floor(monthlyTrafficGoal / 10),
        difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as 'easy' | 'medium' | 'hard',
        timeline_days: Math.floor(Math.random() * 14) + 7
      })) || [];

      setProposals(aiProposals);
      setGenerated(true);
      
      toast({
        title: "Strategy Generated",
        description: `Generated ${aiProposals.length} content proposals to reach your ${monthlyTrafficGoal.toLocaleString()} monthly traffic goal.`
      });
    } catch (error) {
      console.error('Error generating proposals:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate strategy proposals. Please check your API configuration.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleProposal = (proposalId: string) => {
    const newSelected = new Set(selectedProposals);
    if (newSelected.has(proposalId)) {
      newSelected.delete(proposalId);
    } else {
      newSelected.add(proposalId);
    }
    setSelectedProposals(newSelected);
  };

  const selectAll = () => {
    setSelectedProposals(new Set(proposals.map(p => p.id)));
  };

  const clearSelection = () => {
    setSelectedProposals(new Set());
  };

  const selectedTraffic = proposals
    .filter(p => selectedProposals.has(p.id))
    .reduce((sum, p) => sum + p.estimated_traffic, 0);

  const progressPercentage = monthlyTrafficGoal > 0 ? Math.min((selectedTraffic / monthlyTrafficGoal) * 100, 100) : 0;

  if (!generated && !loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-white/10">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Generate Your Content Strategy</CardTitle>
          <CardDescription className="text-base">
            Let AI create a personalized content strategy to reach your {monthlyTrafficGoal.toLocaleString()} monthly traffic goal
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={generateProposals}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Generate AI Strategy
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Generating Your Strategy...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-4 w-4 rounded" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-400" />
            Strategy Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Traffic Goal Progress</span>
              <span className="text-sm font-medium">
                {selectedTraffic.toLocaleString()} / {monthlyTrafficGoal.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{proposals.length}</div>
                <div className="text-xs text-muted-foreground">Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{selectedProposals.size}</div>
                <div className="text-xs text-muted-foreground">Selected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{Math.round(progressPercentage)}%</div>
                <div className="text-xs text-muted-foreground">Progress</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selection Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select Content to Create</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={selectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={clearSelection}>
            Clear
          </Button>
          <Button variant="outline" size="sm" onClick={generateProposals}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Regenerate
          </Button>
        </div>
      </div>

      {/* Proposals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {proposals.map((proposal, index) => (
            <motion.div
              key={proposal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-200 ${
                  selectedProposals.has(proposal.id)
                    ? 'bg-blue-500/20 border-blue-500/50 ring-1 ring-blue-500/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                onClick={() => toggleProposal(proposal.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        checked={selectedProposals.has(proposal.id)}
                        onChange={() => toggleProposal(proposal.id)}
                      />
                      <FileText className="h-4 w-4 text-blue-400" />
                    </div>
                    <Badge 
                      variant="outline"
                      className={`text-xs ${
                        proposal.difficulty === 'easy' ? 'text-green-400 border-green-400/50' :
                        proposal.difficulty === 'medium' ? 'text-yellow-400 border-yellow-400/50' :
                        'text-red-400 border-red-400/50'
                      }`}
                    >
                      {proposal.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-medium leading-tight">
                    {proposal.title}
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {proposal.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      <span className="text-muted-foreground">
                        ~{proposal.estimated_traffic.toLocaleString()} monthly visits
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Keyword: {proposal.primary_keyword}</span>
                      <span>{proposal.timeline_days} days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Action Button */}
      {selectedProposals.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Button 
            size="lg"
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
          >
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Create {selectedProposals.size} Content Pieces
          </Button>
        </motion.div>
      )}
    </div>
  );
};