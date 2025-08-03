
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Target, 
  Zap, 
  Brain,
  Users,
  AlertCircle,
  RefreshCw,
  BarChart3,
  Trophy
} from 'lucide-react';
import { EnhancedOpportunityCard } from './EnhancedOpportunityCard';
import { opportunityHunterService, Opportunity } from '@/services/opportunityHunterService';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export const OpportunityDashboard: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedIntent, setSelectedIntent] = useState<string>('all');
  const [aioFriendlyOnly, setAioFriendlyOnly] = useState(false);
  const [hasCompetitorAnalysis, setHasCompetitorAnalysis] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    loadOpportunities();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [opportunities, searchQuery, selectedStatus, selectedPriority, selectedIntent, aioFriendlyOnly, hasCompetitorAnalysis]);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const data = await opportunityHunterService.getOpportunities();
      setOpportunities(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load opportunities. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const scanForOpportunities = async () => {
    try {
      setScanning(true);
      const result = await opportunityHunterService.scanOpportunitiesWithCompetitorIntelligence();
      
      toast({
        title: "Scan Complete",
        description: result.message
      });
      
      await loadOpportunities();
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Failed to scan for new opportunities. Please try again.",
        variant: "destructive"
      });
    } finally {
      setScanning(false);
    }
  };

  const applyFilters = () => {
    let filtered = opportunities;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(opp => 
        opp.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opp.suggested_title && opp.suggested_title.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(opp => opp.status === selectedStatus);
    }

    // Priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(opp => opp.priority === selectedPriority);
    }

    // Search intent filter
    if (selectedIntent !== 'all') {
      filtered = filtered.filter(opp => opp.search_intent === selectedIntent);
    }

    // AIO friendly filter
    if (aioFriendlyOnly) {
      filtered = filtered.filter(opp => opp.is_aio_friendly);
    }

    // Competitor analysis filter
    if (hasCompetitorAnalysis) {
      filtered = filtered.filter(opp => 
        opp.competitor_analysis && opp.competitor_analysis.length > 0
      );
    }

    setFilteredOpportunities(filtered);
  };

  const handleRouteToBuilder = async (opportunityId: string) => {
    try {
      const route = await opportunityHunterService.routeToContentBuilder(opportunityId);
      window.location.href = route;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to route to content builder. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getMetrics = () => {
    const total = opportunities.length;
    const highPriority = opportunities.filter(opp => opp.priority === 'high').length;
    const aioFriendly = opportunities.filter(opp => opp.is_aio_friendly).length;
    const withCompetitorAnalysis = opportunities.filter(opp => 
      opp.competitor_analysis && opp.competitor_analysis.length > 0
    ).length;

    return { total, highPriority, aioFriendly, withCompetitorAnalysis };
  };

  const metrics = getMetrics();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Opportunity Hunter</h1>
          <p className="text-muted-foreground">AI-powered content opportunity discovery with competitor intelligence</p>
        </div>
        <Button 
          onClick={scanForOpportunities}
          disabled={scanning}
          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
        >
          {scanning ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          {scanning ? 'Scanning...' : 'Scan for Opportunities'}
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Opportunities</p>
                <p className="text-2xl font-bold text-foreground">{metrics.total}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{metrics.highPriority}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">AIO-Friendly</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.aioFriendly}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">With Competitor Intel</p>
                <p className="text-2xl font-bold text-green-600">{metrics.withCompetitorAnalysis}</p>
              </div>
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search Intent</label>
              <Select value={selectedIntent} onValueChange={setSelectedIntent}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Intents</SelectItem>
                  <SelectItem value="informational">Informational</SelectItem>
                  <SelectItem value="navigational">Navigational</SelectItem>
                  <SelectItem value="transactional">Transactional</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">AIO-Friendly</label>
              <Button
                variant={aioFriendlyOnly ? "default" : "outline"}
                onClick={() => setAioFriendlyOnly(!aioFriendlyOnly)}
                className="w-full justify-start"
              >
                <Brain className="h-4 w-4 mr-2" />
                {aioFriendlyOnly ? "Enabled" : "All"}
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Competitor Intel</label>
              <Button
                variant={hasCompetitorAnalysis ? "default" : "outline"}
                onClick={() => setHasCompetitorAnalysis(!hasCompetitorAnalysis)}
                className="w-full justify-start"
              >
                <Users className="h-4 w-4 mr-2" />
                {hasCompetitorAnalysis ? "With Intel" : "All"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities Grid */}
      {filteredOpportunities.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No opportunities found</h3>
            <p className="text-muted-foreground mb-4">
              {opportunities.length === 0 
                ? "Start by scanning for new content opportunities." 
                : "Try adjusting your filters or search terms."
              }
            </p>
            {opportunities.length === 0 && (
              <Button onClick={scanForOpportunities} disabled={scanning}>
                <Search className="h-4 w-4 mr-2" />
                Scan for Opportunities
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {filteredOpportunities.length} Opportunity{filteredOpportunities.length !== 1 ? 's' : ''} Found
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              Sorted by opportunity score
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map((opportunity) => (
              <EnhancedOpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onRouteToBuilder={handleRouteToBuilder}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
