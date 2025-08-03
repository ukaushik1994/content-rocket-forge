
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OpportunityCard } from './OpportunityCard';
import { OpportunityFilters } from './OpportunityFilters';
import { BriefModal } from './BriefModal';
import { NotificationPanel } from './NotificationPanel';
import { OpportunitySettingsPanel } from './OpportunitySettings';
import { opportunityHunterService, type Opportunity } from '@/services/opportunityHunterService';
import { toast } from 'sonner';
import { Search, TrendingUp, Clock, Settings, RefreshCw, Brain } from 'lucide-react';

export const OpportunityHunter: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [showBriefModal, setShowBriefModal] = useState(false);

  const [filters, setFilters] = useState({
    status: [] as string[],
    priority: [] as string[],
    aioFriendly: false,
    maxDifficulty: 100,
    minVolume: 0
  });

  useEffect(() => {
    loadOpportunities();
  }, []);

  useEffect(() => {
    filterOpportunities();
  }, [opportunities, filters]);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const data = await opportunityHunterService.getOpportunities();
      setOpportunities(data);
    } catch (error) {
      console.error('Error loading opportunities:', error);
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const filterOpportunities = async () => {
    try {
      const filtered = await opportunityHunterService.getFilteredOpportunities(filters);
      setFilteredOpportunities(filtered);
    } catch (error) {
      console.error('Error filtering opportunities:', error);
      setFilteredOpportunities(opportunities);
    }
  };

  const handleScanOpportunities = async () => {
    try {
      setScanning(true);
      const result = await opportunityHunterService.scanOpportunities();
      toast.success(result.message);
      await loadOpportunities();
    } catch (error) {
      console.error('Error scanning opportunities:', error);
      toast.error('Failed to scan for new opportunities');
    } finally {
      setScanning(false);
    }
  };

  const handleGenerateBrief = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowBriefModal(true);
  };

  const handleUpdateOpportunity = async (opportunityId: string, updates: Partial<Opportunity>) => {
    try {
      await opportunityHunterService.updateOpportunity(opportunityId, updates);
      await loadOpportunities();
      toast.success('Opportunity updated successfully');
    } catch (error) {
      console.error('Error updating opportunity:', error);
      toast.error('Failed to update opportunity');
    }
  };

  const handleAddToCalendar = async (opportunityId: string, scheduledDate: string) => {
    try {
      await opportunityHunterService.addToCalendar(opportunityId, scheduledDate);
      await loadOpportunities();
      toast.success('Added to content calendar');
    } catch (error) {
      console.error('Error adding to calendar:', error);
      toast.error('Failed to add to calendar');
    }
  };

  const getStats = () => {
    const total = opportunities.length;
    const newCount = opportunities.filter(o => o.status === 'new').length;
    const highPriority = opportunities.filter(o => o.priority === 'high').length;
    const aioFriendly = opportunities.filter(o => o.is_aio_friendly).length;

    return { total, newCount, highPriority, aioFriendly };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-neon-purple border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-white/10 bg-glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Opportunities</p>
              </div>
              <Search className="h-8 w-8 text-neon-purple" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.newCount}</p>
                <p className="text-sm text-muted-foreground">New This Week</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.highPriority}</p>
                <p className="text-sm text-muted-foreground">High Priority</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.aioFriendly}</p>
                <p className="text-sm text-muted-foreground">AIO-Friendly</p>
              </div>
              <Brain className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="opportunities" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <Button
            onClick={handleScanOpportunities}
            disabled={scanning}
            className="bg-neon-purple hover:bg-neon-blue text-white"
          >
            {scanning ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Scanning...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Scan for Opportunities
              </>
            )}
          </Button>
        </div>

        <TabsContent value="opportunities" className="space-y-6">
          <OpportunityFilters
            filters={filters}
            onFiltersChange={setFilters}
            totalCount={filteredOpportunities.length}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onGenerateBrief={() => handleGenerateBrief(opportunity)}
                onUpdateStatus={(status) => handleUpdateOpportunity(opportunity.id, { status })}
                onAddToCalendar={(date) => handleAddToCalendar(opportunity.id, date)}
              />
            ))}
          </div>

          {filteredOpportunities.length === 0 && (
            <Card className="border-white/10 bg-glass">
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No opportunities found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or scan for new opportunities
                </p>
                <Button
                  onClick={handleScanOpportunities}
                  disabled={scanning}
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Scan Now
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationPanel />
        </TabsContent>

        <TabsContent value="settings">
          <OpportunitySettingsPanel />
        </TabsContent>
      </Tabs>

      {/* Brief Generation Modal */}
      {showBriefModal && selectedOpportunity && (
        <BriefModal
          opportunity={selectedOpportunity}
          isOpen={showBriefModal}
          onClose={() => {
            setShowBriefModal(false);
            setSelectedOpportunity(null);
          }}
        />
      )}
    </div>
  );
};
