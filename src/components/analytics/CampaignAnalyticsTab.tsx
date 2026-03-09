import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Target, 
  DollarSign,
  FileText,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface CampaignWithMetrics {
  id: string;
  name: string;
  status: string;
  created_at: string;
  content_count: number;
  total_views: number;
  total_engagement: number;
  total_conversions: number;
  total_cost: number;
  roi_percentage: number;
}

export const CampaignAnalyticsTab = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<CampaignWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchCampaignAnalytics();
    }
  }, [user, filterStatus]);

  const fetchCampaignAnalytics = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch campaigns with aggregated analytics
      let query = supabase
        .from('campaigns')
        .select(`
          id,
          name,
          status,
          created_at,
          content_items!left(id),
          campaign_analytics!left(views, engagement_count, conversions),
          campaign_costs!left(amount)
        `)
        .eq('user_id', user.id);

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Process data to calculate metrics
      const processedCampaigns = (data || []).map((campaign: any) => {
        const contentCount = campaign.content_items?.length || 0;
        const analytics = campaign.campaign_analytics || [];
        const costs = campaign.campaign_costs || [];

        const totalViews = analytics.reduce((sum: number, a: any) => sum + (a.views || 0), 0);
        const totalEngagement = analytics.reduce((sum: number, a: any) => sum + (a.engagement_count || 0), 0);
        const totalConversions = analytics.reduce((sum: number, a: any) => sum + (a.conversions || 0), 0);
        const totalCost = costs.reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
        
        const roiPercentage = totalCost > 0 
          ? ((totalConversions * 100 - totalCost) / totalCost) * 100 
          : 0;

        return {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          created_at: campaign.created_at,
          content_count: contentCount,
          total_views: totalViews,
          total_engagement: totalEngagement,
          total_conversions: totalConversions,
          total_cost: totalCost,
          roi_percentage: roiPercentage
        };
      });

      setCampaigns(processedCampaigns as CampaignWithMetrics[]);
    } catch (error: any) {
      console.error('Error fetching campaign analytics:', error);
      toast.error('Failed to load campaign analytics');
    } finally {
      setLoading(false);
    }
  };

  // Calculate aggregate metrics across all campaigns
  const aggregateMetrics = campaigns.reduce((acc, campaign) => ({
    totalCampaigns: acc.totalCampaigns + 1,
    totalContent: acc.totalContent + campaign.content_count,
    totalViews: acc.totalViews + campaign.total_views,
    totalEngagement: acc.totalEngagement + campaign.total_engagement,
    totalConversions: acc.totalConversions + campaign.total_conversions,
    totalCost: acc.totalCost + campaign.total_cost,
  }), {
    totalCampaigns: 0,
    totalContent: 0,
    totalViews: 0,
    totalEngagement: 0,
    totalConversions: 0,
    totalCost: 0,
  });

  const avgROI = aggregateMetrics.totalCost > 0 
    ? ((aggregateMetrics.totalConversions * 100 - aggregateMetrics.totalCost) / aggregateMetrics.totalCost) * 100
    : 0;

  const statusColors: Record<string, string> = {
    draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    planned: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    completed: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Aggregate Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{aggregateMetrics.totalCampaigns}</h3>
            <p className="text-sm text-muted-foreground">Total Campaigns</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{aggregateMetrics.totalContent}</h3>
            <p className="text-sm text-muted-foreground">Content Pieces</p>
          </CardContent>
        </Card>

        <Card className="bg-background/60 backdrop-blur-xl border-border/50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-400 shadow-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{aggregateMetrics.totalViews.toLocaleString()}</h3>
            <p className="text-sm text-muted-foreground">Total Views</p>
          </CardContent>
        </Card>

        <Card className="bg-background/60 backdrop-blur-xl border-border/50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-400 shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{avgROI.toFixed(1)}%</h3>
            <p className="text-sm text-muted-foreground">Average ROI</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <Card className="bg-background/60 backdrop-blur-xl border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filter by status:</span>
            <div className="flex gap-2">
              {['all', 'draft', 'planned', 'active', 'completed'].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign List */}
      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <Card className="bg-background/60 backdrop-blur-xl border-border/50">
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-4">Create your first campaign to start tracking performance</p>
              <Button onClick={() => navigate('/campaigns')}>
                Create Campaign
              </Button>
            </CardContent>
          </Card>
        ) : (
          campaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-background/60 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{campaign.name}</CardTitle>
                      <CardDescription>
                        Created {new Date(campaign.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge className={statusColors[campaign.status]} variant="outline">
                      {campaign.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span className="text-xs">Content</span>
                      </div>
                      <p className="text-lg font-bold">{campaign.content_count}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span className="text-xs">Views</span>
                      </div>
                      <p className="text-lg font-bold">{campaign.total_views.toLocaleString()}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MousePointer className="h-4 w-4" />
                        <span className="text-xs">Engagement</span>
                      </div>
                      <p className="text-lg font-bold">{campaign.total_engagement.toLocaleString()}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Target className="h-4 w-4" />
                        <span className="text-xs">Conversions</span>
                      </div>
                      <p className="text-lg font-bold">{campaign.total_conversions}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-xs">Cost</span>
                      </div>
                      <p className="text-lg font-bold">${campaign.total_cost.toFixed(0)}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs">ROI</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <p className={`text-lg font-bold ${campaign.roi_percentage >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {campaign.roi_percentage.toFixed(1)}%
                        </p>
                        {campaign.roi_percentage >= 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/campaigns?id=${campaign.id}`)}
                    >
                      View Campaign
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/repository?tab=campaigns&campaign=${campaign.id}`)}
                    >
                      View Content
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
