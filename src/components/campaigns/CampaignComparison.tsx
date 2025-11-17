import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart } from '@/components/ui/chart';
import { ArrowRight, TrendingUp, Eye, MousePointerClick, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsAggregator } from '@/services/analytics/analyticsAggregator';

export function CampaignComparison() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCampaigns();
    }
  }, [user]);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name, status, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const handleCompare = async () => {
    if (selectedCampaigns.length < 2) return;

    setLoading(true);
    try {
      const results = await Promise.all(
        selectedCampaigns.map(async (campaignId) => {
          const campaign = campaigns.find(c => c.id === campaignId);
          const analytics = await analyticsAggregator.aggregateCampaignAnalytics(campaignId);
          
          return {
            name: campaign?.name || 'Unknown',
            views: analytics.totalViews,
            engagement: analytics.totalEngagement,
            conversions: analytics.totalConversions,
            revenue: analytics.totalRevenue,
            engagementRate: analytics.avgEngagementRate,
            conversionRate: analytics.avgConversionRate
          };
        })
      );

      setComparisonData(results);
    } catch (error) {
      console.error('Error comparing campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCampaign = (campaignId: string, index: number) => {
    const newSelected = [...selectedCampaigns];
    newSelected[index] = campaignId;
    setSelectedCampaigns(newSelected);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Comparison</CardTitle>
        <CardDescription>
          Compare performance metrics across different campaigns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Campaign Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="space-y-2">
              <label className="text-sm font-medium">
                Campaign {index + 1} {index < 2 && <span className="text-destructive">*</span>}
              </label>
              <Select
                value={selectedCampaigns[index] || ''}
                onValueChange={(value) => handleSelectCampaign(value, index)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select campaign" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns
                    .filter(c => !selectedCampaigns.includes(c.id) || selectedCampaigns[index] === c.id)
                    .map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <Button
          onClick={handleCompare}
          disabled={selectedCampaigns.filter(Boolean).length < 2 || loading}
          className="w-full"
        >
          {loading ? 'Comparing...' : 'Compare Campaigns'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>

        {/* Comparison Results */}
        {comparisonData.length > 0 && (
          <div className="space-y-6">
            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Views & Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={comparisonData}
                    categories={['views', 'engagement']}
                    index="name"
                    className="h-64"
                    valueFormatter={(value) => value.toLocaleString()}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Conversions & Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={comparisonData}
                    categories={['conversions', 'revenue']}
                    index="name"
                    className="h-64"
                    valueFormatter={(value) => value.toLocaleString()}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Detailed Comparison Table */}
            <div className="space-y-3">
              <h4 className="font-semibold">Detailed Metrics</h4>
              {comparisonData.map((data, index) => {
                const isWinner = index === 0; // Simplistic - first is best
                return (
                  <div
                    key={index}
                    className="p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="font-semibold flex items-center gap-2">
                          {data.name}
                          {isWinner && (
                            <Badge variant="default" className="bg-emerald-600">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Top Performer
                            </Badge>
                          )}
                        </h5>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Views</p>
                          <p className="font-semibold">{data.views.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Engagement</p>
                          <p className="font-semibold">
                            {data.engagement.toLocaleString()} ({data.engagementRate.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Conversions</p>
                          <p className="font-semibold">
                            {data.conversions.toLocaleString()} ({data.conversionRate.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Revenue</p>
                          <p className="font-semibold">${data.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {comparisonData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Select at least 2 campaigns to compare</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
