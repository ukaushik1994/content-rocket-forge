import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, DollarSign, TrendingUp, Calculator, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CampaignROIProps {
  campaignId: string;
}

interface CostEntry {
  id: string;
  cost_type: string;
  amount: number;
  description: string;
  date: string;
}

export function CampaignROI({ campaignId }: CampaignROIProps) {
  const { user } = useAuth();
  const [costs, setCosts] = useState<CostEntry[]>([]);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCost, setNewCost] = useState({
    cost_type: 'time',
    amount: '',
    description: ''
  });

  useEffect(() => {
    if (user && campaignId) {
      fetchROIData();
    }
  }, [campaignId, user]);

  const fetchROIData = async () => {
    try {
      setLoading(true);

      // Fetch costs
      const { data: costsData, error: costsError } = await supabase
        .from('campaign_costs')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('date', { ascending: false });

      if (costsError) throw costsError;
      setCosts(costsData || []);

      // Fetch revenue from analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('campaign_analytics')
        .select('revenue')
        .eq('campaign_id', campaignId);

      if (analyticsError) throw analyticsError;

      const totalRevenue = analyticsData?.reduce((sum, a) => sum + parseFloat(a.revenue?.toString() || '0'), 0) || 0;
      setRevenue(totalRevenue);
    } catch (error) {
      console.error('Error fetching ROI data:', error);
      toast.error('Failed to load ROI data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCost = async () => {
    if (!newCost.amount || parseFloat(newCost.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const { error } = await supabase
        .from('campaign_costs')
        .insert({
          campaign_id: campaignId,
          user_id: user?.id,
          cost_type: newCost.cost_type,
          amount: parseFloat(newCost.amount),
          description: newCost.description || null,
          date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      toast.success('Cost added successfully');
      setDialogOpen(false);
      setNewCost({ cost_type: 'time', amount: '', description: '' });
      fetchROIData();
    } catch (error) {
      console.error('Error adding cost:', error);
      toast.error('Failed to add cost');
    }
  };

  const totalCosts = costs.reduce((sum, cost) => sum + cost.amount, 0);
  const roi = totalCosts > 0 ? ((revenue - totalCosts) / totalCosts) * 100 : 0;
  const profitLoss = revenue - totalCosts;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign ROI Calculator</CardTitle>
          <CardDescription>Loading financial data...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Campaign ROI Calculator
            </CardTitle>
            <CardDescription>Track costs and measure return on investment</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Cost
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Campaign Cost</DialogTitle>
                <DialogDescription>
                  Track expenses related to this campaign for accurate ROI calculation
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="cost-type">Cost Type</Label>
                  <Select value={newCost.cost_type} onValueChange={(value) => setNewCost({ ...newCost, cost_type: value })}>
                    <SelectTrigger id="cost-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="time">Time / Labor</SelectItem>
                      <SelectItem value="promotion">Paid Promotion</SelectItem>
                      <SelectItem value="tools">Tools / Software</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={newCost.amount}
                    onChange={(e) => setNewCost({ ...newCost, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="e.g., 10 hours of content creation"
                    value={newCost.description}
                    onChange={(e) => setNewCost({ ...newCost, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddCost}>Add Cost</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ROI Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                ${totalCosts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Generated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                ${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Profit / Loss</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${profitLoss >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                {profitLoss >= 0 ? '+' : ''}${profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ROI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${roi >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ROI Interpretation */}
        <div className="p-4 rounded-lg bg-muted/50">
          <div className="flex items-start gap-3">
            <TrendingUp className={`h-5 w-5 mt-0.5 ${roi >= 0 ? 'text-emerald-600' : 'text-destructive'}`} />
            <div>
              <p className="font-semibold">
                {roi >= 100 ? 'Excellent Return!' : roi >= 50 ? 'Good Return' : roi >= 0 ? 'Positive Return' : 'Needs Improvement'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {roi >= 100 && 'Your campaign has more than doubled your investment. Keep doing what you\'re doing!'}
                {roi >= 50 && roi < 100 && 'Your campaign is generating solid returns. Consider scaling successful tactics.'}
                {roi >= 0 && roi < 50 && 'Your campaign is profitable but has room for optimization. Review performance insights.'}
                {roi < 0 && `Your campaign needs attention. Review costs and focus on higher-performing content formats.`}
              </p>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        {costs.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold">Cost Breakdown</h4>
            <div className="space-y-2">
              {costs.map((cost) => (
                <div
                  key={cost.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {cost.cost_type.charAt(0).toUpperCase() + cost.cost_type.slice(1)}
                      </p>
                      {cost.description && (
                        <p className="text-sm text-muted-foreground">{cost.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(cost.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-destructive border-destructive">
                    ${cost.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {costs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No costs recorded yet</p>
            <p className="text-sm">Add costs to calculate accurate ROI</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
