
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { OpportunityCard } from './OpportunityCard';
import { OpportunityFilters } from './OpportunityFilters';
import { OpportunitySettings } from './OpportunitySettings';
import { NotificationPanel } from './NotificationPanel';
import { opportunityHunterService, type Opportunity, type OpportunityNotification } from '@/services/opportunityHunterService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Search, Settings, Bell, TrendingUp, Eye, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export const OpportunityHunter = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [notifications, setNotifications] = useState<OpportunityNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState('opportunities');
  const [filters, setFilters] = useState({
    status: [] as string[],
    priority: [] as string[],
    aioFriendly: undefined as boolean | undefined,
    maxDifficulty: 50,
    minVolume: 100
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [opportunitiesData, notificationsData] = await Promise.all([
        opportunityHunterService.getOpportunities(),
        opportunityHunterService.getNotifications()
      ]);
      
      setOpportunities(opportunitiesData);
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error loading opportunities:', error);
      toast.error('Failed to load opportunities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanOpportunities = async () => {
    if (!user) return;
    
    try {
      setIsScanning(true);
      const result = await opportunityHunterService.scanOpportunities(user.id);
      toast.success(result.message);
      await loadData(); // Reload data
    } catch (error) {
      console.error('Error scanning opportunities:', error);
      toast.error('Failed to scan for opportunities');
    } finally {
      setIsScanning(false);
    }
  };

  const handleUpdateOpportunity = async (opportunityId: string, updates: Partial<Opportunity>) => {
    try {
      await opportunityHunterService.updateOpportunity(opportunityId, updates);
      await loadData(); // Reload data
      toast.success('Opportunity updated');
    } catch (error) {
      console.error('Error updating opportunity:', error);
      toast.error('Failed to update opportunity');
    }
  };

  const handleDeleteOpportunity = async (opportunityId: string) => {
    try {
      await opportunityHunterService.deleteOpportunity(opportunityId);
      setOpportunities(prev => prev.filter(opp => opp.id !== opportunityId));
      toast.success('Opportunity deleted');
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      toast.error('Failed to delete opportunity');
    }
  };

  const filteredOpportunities = opportunities.filter(opp => {
    if (filters.status.length && !filters.status.includes(opp.status)) return false;
    if (filters.priority.length && !filters.priority.includes(opp.priority)) return false;
    if (filters.aioFriendly !== undefined && opp.is_aio_friendly !== filters.aioFriendly) return false;
    if (filters.maxDifficulty && opp.keyword_difficulty && opp.keyword_difficulty > filters.maxDifficulty) return false;
    if (filters.minVolume && opp.search_volume && opp.search_volume < filters.minVolume) return false;
    return true;
  });

  const opportunityStats = {
    total: opportunities.length,
    new: opportunities.filter(o => o.status === 'new').length,
    inProgress: opportunities.filter(o => o.status === 'in_progress').length,
    highPriority: opportunities.filter(o => o.priority === 'high').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-neon-purple border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neon-purple mb-2">OpportunityHunter</h2>
          <p className="text-muted-foreground">
            AI-powered content opportunity detection and brief generation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleScanOpportunities}
            disabled={isScanning}
            className="bg-neon-purple hover:bg-neon-blue text-white"
          >
            {isScanning ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Scanning...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Scan Opportunities
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-neon-purple/20 bg-glass">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-neon-purple" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Opportunities</p>
                  <p className="text-2xl font-bold">{opportunityStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-neon-blue/20 bg-glass">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-neon-blue" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">New</p>
                  <p className="text-2xl font-bold">{opportunityStats.new}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-yellow-500/20 bg-glass">
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{opportunityStats.inProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-red-500/20 bg-glass">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Bell className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                  <p className="text-2xl font-bold">{opportunityStats.highPriority}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-glass border border-white/10">
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications
            {notifications.length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">{notifications.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-6">
          <OpportunityFilters 
            filters={filters}
            onFiltersChange={setFilters}
          />
          
          <div className="grid grid-cols-1 gap-4">
            {filteredOpportunities.length === 0 ? (
              <Card className="border-white/10 bg-glass">
                <CardContent className="p-8 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Opportunities Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {opportunities.length === 0 
                      ? "Click 'Scan Opportunities' to discover new content opportunities"
                      : "Try adjusting your filters to see more opportunities"
                    }
                  </p>
                  {opportunities.length === 0 && (
                    <Button
                      onClick={handleScanOpportunities}
                      disabled={isScanning}
                      className="bg-neon-purple hover:bg-neon-blue text-white"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Start Scanning
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredOpportunities.map((opportunity, index) => (
                <motion.div
                  key={opportunity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <OpportunityCard
                    opportunity={opportunity}
                    onUpdate={handleUpdateOpportunity}
                    onDelete={handleDeleteOpportunity}
                  />
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationPanel 
            notifications={notifications}
            onNotificationAction={loadData}
          />
        </TabsContent>

        <TabsContent value="settings">
          <OpportunitySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
