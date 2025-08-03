import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, Search, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface SeedKeyword {
  id: string;
  keyword: string;
  topic_cluster: string;
  search_volume: number;
  is_active: boolean;
  scan_frequency: string;
  last_scanned: string;
  created_at: string;
}

export const SeedKeywordManager: React.FC = () => {
  const [seeds, setSeeds] = useState<SeedKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyword, setNewKeyword] = useState('');
  const [newTopicCluster, setNewTopicCluster] = useState('');
  const [newScanFrequency, setNewScanFrequency] = useState('daily');

  useEffect(() => {
    loadSeeds();
  }, []);

  const loadSeeds = async () => {
    try {
      const { data, error } = await supabase
        .from('opportunity_seeds')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSeeds(data || []);
    } catch (error) {
      console.error('Error loading seeds:', error);
      toast.error('Failed to load seed keywords');
    } finally {
      setLoading(false);
    }
  };

  const addSeed = async () => {
    if (!newKeyword.trim()) return;

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error('Please log in to add seed keywords');
        return;
      }

      const { data, error } = await supabase
        .from('opportunity_seeds')
        .insert([{
          user_id: user.id,
          keyword: newKeyword.trim(),
          topic_cluster: newTopicCluster.trim() || null,
          scan_frequency: newScanFrequency,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      setSeeds(prev => [data, ...prev]);
      setNewKeyword('');
      setNewTopicCluster('');
      toast.success('Seed keyword added successfully');
    } catch (error) {
      console.error('Error adding seed:', error);
      toast.error('Failed to add seed keyword');
    }
  };

  const updateSeed = async (id: string, updates: Partial<SeedKeyword>) => {
    try {
      const { error } = await supabase
        .from('opportunity_seeds')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setSeeds(prev => prev.map(seed => 
        seed.id === id ? { ...seed, ...updates } : seed
      ));
      toast.success('Seed keyword updated');
    } catch (error) {
      console.error('Error updating seed:', error);
      toast.error('Failed to update seed keyword');
    }
  };

  const deleteSeed = async (id: string) => {
    try {
      const { error } = await supabase
        .from('opportunity_seeds')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSeeds(prev => prev.filter(seed => seed.id !== id));
      toast.success('Seed keyword deleted');
    } catch (error) {
      console.error('Error deleting seed:', error);
      toast.error('Failed to delete seed keyword');
    }
  };

  const triggerScan = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('scheduled-opportunity-scan', {
        body: { manual_trigger: true }
      });

      if (error) throw error;
      toast.success('Opportunity scan initiated');
      
      // Reload seeds to update last_scanned times
      setTimeout(loadSeeds, 2000);
    } catch (error) {
      console.error('Error triggering scan:', error);
      toast.error('Failed to trigger scan');
    }
  };

  const getScanStatusColor = (lastScanned: string, frequency: string) => {
    if (!lastScanned) return 'bg-gray-500';
    
    const last = new Date(lastScanned);
    const now = new Date();
    const hoursSince = (now.getTime() - last.getTime()) / (1000 * 60 * 60);
    
    const threshold = frequency === 'hourly' ? 1 : frequency === 'daily' ? 24 : 168;
    
    if (hoursSince < threshold) return 'bg-green-500';
    if (hoursSince < threshold * 1.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-neon-purple border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Seed */}
      <Card className="border-white/10 bg-glass">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2 text-neon-purple" />
            Add Seed Keywords
          </CardTitle>
          <CardDescription>
            Seed keywords are the foundation for discovering content opportunities. 
            The system will regularly scan these keywords for new content gaps and trends.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="keyword">Keyword</Label>
              <Input
                id="keyword"
                placeholder="Enter seed keyword..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSeed()}
              />
            </div>
            <div>
              <Label htmlFor="cluster">Topic Cluster (Optional)</Label>
              <Input
                id="cluster"
                placeholder="e.g., Analytics, HR Tech..."
                value={newTopicCluster}
                onChange={(e) => setNewTopicCluster(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="frequency">Scan Frequency</Label>
              <Select value={newScanFrequency} onValueChange={setNewScanFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={addSeed} disabled={!newKeyword.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Seed Keyword
            </Button>
            <Button onClick={triggerScan} variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Trigger Scan Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Seed Keywords List */}
      <Card className="border-white/10 bg-glass">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
              Seed Keywords ({seeds.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {seeds.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No seed keywords added yet.</p>
              <p className="text-sm">Add your first seed keyword to start discovering opportunities.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {seeds.map((seed) => (
                <div 
                  key={seed.id}
                  className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{seed.keyword}</h3>
                      <div className={`w-2 h-2 rounded-full ${getScanStatusColor(seed.last_scanned, seed.scan_frequency)}`} />
                      {seed.topic_cluster && (
                        <Badge variant="outline" className="text-xs">
                          {seed.topic_cluster}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {seed.scan_frequency}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last scanned: {seed.last_scanned ? format(new Date(seed.last_scanned), 'MMM d, HH:mm') : 'Never'}
                      </span>
                      {seed.search_volume && (
                        <span>Volume: {seed.search_volume.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={seed.is_active}
                      onCheckedChange={(checked) => updateSeed(seed.id, { is_active: checked })}
                    />
                    <Select
                      value={seed.scan_frequency}
                      onValueChange={(value) => updateSeed(seed.id, { scan_frequency: value })}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSeed(seed.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scan Status Overview */}
      <Card className="border-white/10 bg-glass">
        <CardHeader>
          <CardTitle className="text-sm">Scan Status Legend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Recently scanned (within schedule)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span>Overdue (needs scan)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span>Significantly overdue</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
            <span>Never scanned</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};