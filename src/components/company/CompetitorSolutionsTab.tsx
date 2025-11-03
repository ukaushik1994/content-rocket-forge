import { useState, useEffect } from 'react';
import { CompanyCompetitor, CompetitorSolution } from '@/contexts/content-builder/types/company-types';
import { Button } from '@/components/ui/button';
import { Sparkles, Package, Loader2 } from 'lucide-react';
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
      toast({
        title: 'Discovery Complete',
        description: `Found and analyzed ${data.solutions.length} solutions`,
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
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Package className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Solutions Discovered</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          Automatically discover {competitor.name}'s products and solutions from their website
        </p>
        <Button
          onClick={() => discoveryMutation.mutate()}
          disabled={!competitor.website}
          size="lg"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Discover Solutions
        </Button>
        {!competitor.website && (
          <p className="text-xs text-muted-foreground mt-2">
            Website URL is required for discovery
          </p>
        )}
      </div>
    );
  }

  // Loading state during discovery
  if (discoveryMutation.isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <div className="text-center space-y-2 max-w-md">
          <h3 className="font-semibold">Discovering Solutions...</h3>
          <p className="text-sm text-muted-foreground">
            Finding product pages and analyzing each solution. This may take 3-5 minutes.
          </p>
          <Progress value={33} className="mt-4" />
          <p className="text-xs text-muted-foreground">
            Step 1/3: Searching for solution pages...
          </p>
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
