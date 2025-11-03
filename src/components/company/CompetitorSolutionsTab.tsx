import { useState, useEffect } from 'react';
import { CompanyCompetitor, CompetitorSolution } from '@/contexts/content-builder/types/company-types';
import { Button } from '@/components/ui/button';
import { Sparkles, Package, Loader2, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { discoverCompetitorSolutions, getCompetitorSolutions } from '@/services/competitorSolutionsService';
import { CompetitorSolutionCard } from './CompetitorSolutionCard';
import { CompetitorSolutionDetailsDialog } from './CompetitorSolutionDetailsDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CompetitorSolutionsTabProps {
  competitor: CompanyCompetitor;
}

export function CompetitorSolutionsTab({ competitor }: CompetitorSolutionsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSolution, setSelectedSolution] = useState<CompetitorSolution | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepDescription, setStepDescription] = useState('Searching for product pages...');
  const [lastDiagnostics, setLastDiagnostics] = useState<any>(null);

  // Fetch solutions
  const { data: solutions = [], isLoading } = useQuery({
    queryKey: ['competitor-solutions', competitor.id],
    queryFn: () => getCompetitorSolutions(competitor.id),
  });

  // Discovery mutation
  const discoveryMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (!competitor.website) {
        throw new Error('Competitor website is required');
      }

      return discoverCompetitorSolutions(
        competitor.id,
        competitor.website,
        competitor.name,
        user.id
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['competitor-solutions', competitor.id] });
      setLastDiagnostics(data.diagnostics);
      setProgressPercent(100);
      toast({
        title: 'Discovery Complete',
        description: `Found and analyzed ${data.solutions.length} solutions in ${(data.diagnostics?.total_time_ms / 1000).toFixed(1)}s`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Discovery Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Progress tracking during discovery
  useEffect(() => {
    if (discoveryMutation.isPending) {
      setProgressPercent(0);
      setCurrentStep(1);
      const interval = setInterval(() => {
        setProgressPercent(prev => {
          const next = Math.min(prev + 3, 95);
          
          if (next < 33) {
            setCurrentStep(1);
            setStepDescription('🔍 Searching website for product pages...');
          } else if (next < 66) {
            setCurrentStep(2);
            setStepDescription('🧠 Extracting product information...');
          } else {
            setCurrentStep(3);
            setStepDescription('📊 Analyzing solution details...');
          }
          
          return next;
        });
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [discoveryMutation.isPending]);

  const handleViewDetails = (solution: CompetitorSolution) => {
    setSelectedSolution(solution);
    setDetailsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Empty state
  if (solutions.length === 0 && !discoveryMutation.isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-8 mb-6 shadow-lg">
          <Package className="w-16 h-16 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Solutions Discovered Yet</h3>
        <p className="text-sm text-muted-foreground mb-8 max-w-md">
          Automatically discover and analyze all of {competitor.name}'s products, features, pricing, and technical details
        </p>
        <Button
          onClick={() => discoveryMutation.mutate()}
          disabled={!competitor.website}
          size="lg"
          className="shadow-lg hover:shadow-xl transition-all"
        >
          <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
          Discover Solutions
        </Button>
        {!competitor.website && (
          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-xs text-amber-600 font-medium">
              ⚠️ Website URL required - please add competitor website first
            </p>
          </div>
        )}
      </div>
    );
  }

  // Loading state during discovery
  if (discoveryMutation.isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin text-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          </div>
        </div>
        
        <div className="text-center space-y-3 max-w-md">
          <h3 className="font-semibold text-lg">Discovering Solutions...</h3>
          <p className="text-sm text-muted-foreground">
            Analyzing {competitor.name}'s website to identify all products and solutions
          </p>
          
          <div className="space-y-2 mt-6">
            <Progress value={progressPercent} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Step {currentStep}/3</span>
              <span>{progressPercent}% complete</span>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-lg bg-muted/50 backdrop-blur-sm border">
            <p className="text-xs text-muted-foreground">
              {stepDescription}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Solutions display
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold">Discovered Solutions</h3>
          <p className="text-sm text-muted-foreground">{solutions.length} solutions tracked</p>
        </div>
        <Button
          variant="outline"
          onClick={() => discoveryMutation.mutate()}
          disabled={!competitor.website || discoveryMutation.isPending}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Re-discover
        </Button>
      </div>

      {lastDiagnostics && solutions.length > 0 && (
        <div className="mb-6 p-4 rounded-lg bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold">Discovery Diagnostics</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">SERP Queries</p>
              <p className="text-lg font-bold text-primary">{lastDiagnostics.serp_queries || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Pages Discovered</p>
              <p className="text-lg font-bold text-primary">{lastDiagnostics.pages_discovered || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Solutions Found</p>
              <p className="text-lg font-bold text-primary">{lastDiagnostics.solutions_extracted || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Processing Time</p>
              <p className="text-lg font-bold text-primary">
                {((lastDiagnostics.total_time_ms || 0) / 1000).toFixed(1)}s
              </p>
            </div>
          </div>
          {lastDiagnostics.partial_extractions > 0 && (
            <div className="mt-3 p-2 rounded bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-amber-600">
                ⚠️ {lastDiagnostics.partial_extractions} solutions have incomplete data - some details could not be extracted
              </p>
            </div>
          )}
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-xs text-muted-foreground">
              💡 Used {lastDiagnostics.ai_calls || 0} AI calls to analyze competitor offerings
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {solutions.map((solution) => (
          <CompetitorSolutionCard
            key={solution.id}
            solution={solution}
            onView={handleViewDetails}
          />
        ))}
      </div>

      {selectedSolution && (
        <CompetitorSolutionDetailsDialog
          solution={selectedSolution}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        />
      )}
    </div>
  );
}
