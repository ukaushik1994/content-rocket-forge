import { useState, useEffect, useMemo } from 'react';
import { CompanyCompetitor, CompetitorSolution } from '@/contexts/content-builder/types/company-types';
import { Button } from '@/components/ui/button';
import { Sparkles, Package, Loader2, Target, Download, Trash2, FileText, FileJson, GitCompare } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { discoverCompetitorSolutions, getCompetitorSolutions } from '@/services/competitorSolutionsService';
import { CompetitorSolutionCard } from './CompetitorSolutionCard';
import { CompetitorSolutionDetailsDialog } from './CompetitorSolutionDetailsDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CompetitorSolutionComparison } from './CompetitorSolutionComparison';

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
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [selectedSolutions, setSelectedSolutions] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Fetch solutions
  const { data: solutions = [], isLoading } = useQuery({
    queryKey: ['competitor-solutions', competitor.id],
    queryFn: () => getCompetitorSolutions(competitor.id),
  });

  // Filter and sort logic
  const filteredSolutions = useMemo(() => {
    let filtered = [...solutions];
    
    // Apply filters
    if (filter === 'complete') {
      filtered = filtered.filter(s => s.discoverySource === 'serp:full');
    } else if (filter === 'partial') {
      filtered = filtered.filter(s => s.discoverySource === 'serp:partial');
    } else if (filter === 'with-pricing') {
      filtered = filtered.filter(s => s.pricing);
    }
    
    // Apply sorting
    if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'features') {
      filtered.sort((a, b) => ((b.features as any[])?.length || 0) - ((a.features as any[])?.length || 0));
    } else {
      filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
    
    return filtered;
  }, [solutions, filter, sortBy]);

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

  // Delete all mutation
  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('competitor_solutions')
        .delete()
        .eq('competitor_id', competitor.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitor-solutions', competitor.id] });
      toast({ title: 'All solutions deleted' });
    },
    onError: (error: any) => {
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleDeleteAll = () => deleteAllMutation.mutate();

  const toggleSolutionSelection = (solutionId: string) => {
    setSelectedSolutions(prev =>
      prev.includes(solutionId)
        ? prev.filter(id => id !== solutionId)
        : [...prev, solutionId]
    );
  };

  const getComparisonSolutions = () => {
    return solutions.filter(s => selectedSolutions.includes(s.id));
  };

  // Export functions
  const exportAsCSV = () => {
    const headers = ['Name', 'Category', 'Description', 'Features Count', 'Has Pricing', 'Completeness', 'URL'];
    const rows = solutions.map(s => [
      s.name,
      s.category || '',
      s.shortDescription || '',
      (s.features as any[])?.length || 0,
      s.pricing ? 'Yes' : 'No',
      s.discoverySource === 'serp:full' ? 'Complete' : 'Partial',
      s.externalUrl || ''
    ]);
    
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${competitor.name.replace(/[^a-z0-9]/gi, '_')}_solutions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportAsJSON = () => {
    const json = JSON.stringify(solutions, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${competitor.name.replace(/[^a-z0-9]/gi, '_')}_solutions_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

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
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex-1">
          <h3 className="font-semibold">Discovered Solutions</h3>
          <p className="text-sm text-muted-foreground">{filteredSolutions.length} of {solutions.length} solutions</p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {/* Filter by completeness */}
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Solutions</SelectItem>
              <SelectItem value="complete">Complete Only</SelectItem>
              <SelectItem value="partial">Partial Only</SelectItem>
              <SelectItem value="with-pricing">With Pricing</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Recently Added</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="features">Most Features</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Export dropdown */}
          {solutions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={exportAsCSV}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportAsJSON}>
                  <FileJson className="w-4 h-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Compare button */}
          {selectedSolutions.length >= 2 && (
            <Button variant="outline" size="sm" onClick={() => setShowComparison(true)}>
              <GitCompare className="w-4 h-4 mr-2" />
              Compare ({selectedSolutions.length})
            </Button>
          )}
          
          {/* Delete all */}
          {solutions.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete All Solutions?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {solutions.length} discovered solutions for {competitor.name}.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAll}>Delete All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          
          <Button
            variant="outline"
            onClick={() => discoveryMutation.mutate()}
            disabled={!competitor.website || discoveryMutation.isPending}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Re-discover
          </Button>
        </div>
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
        {filteredSolutions.map((solution) => (
          <CompetitorSolutionCard
            key={solution.id}
            solution={solution}
            onView={handleViewDetails}
            isSelected={selectedSolutions.includes(solution.id)}
            onToggleSelect={toggleSolutionSelection}
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

      {showComparison && (
        <CompetitorSolutionComparison
          solutions={getComparisonSolutions()}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}
