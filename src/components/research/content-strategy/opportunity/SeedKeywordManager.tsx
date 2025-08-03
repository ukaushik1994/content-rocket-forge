import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Plus, Search, Trash2, Edit2, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface SeedKeyword {
  id: string;
  keyword: string;
  topic_cluster?: string;
  scan_frequency: string;
  is_active: boolean;
  last_scanned?: string;
  search_volume?: number;
}

export const SeedKeywordManager: React.FC = () => {
  const [seedKeywords] = useState<SeedKeyword[]>([
    {
      id: '1',
      keyword: 'content marketing',
      topic_cluster: 'Marketing',
      scan_frequency: 'daily',
      is_active: true,
      search_volume: 8100,
      last_scanned: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      keyword: 'SEO strategy',
      topic_cluster: 'SEO',
      scan_frequency: 'daily',
      is_active: true,
      search_volume: 5400,
      last_scanned: '2024-01-15T09:15:00Z'
    }
  ]);

  const [newKeyword, setNewKeyword] = useState('');
  const [newCluster, setNewCluster] = useState('');
  const [newFrequency, setNewFrequency] = useState('daily');

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) {
      toast.error('Please enter a keyword');
      return;
    }

    // Here you would integrate with the opportunityHunterService
    toast.success('Seed keyword added successfully');
    setNewKeyword('');
    setNewCluster('');
  };

  const handleDeleteKeyword = (id: string) => {
    // Here you would integrate with the opportunityHunterService
    toast.success('Seed keyword removed');
  };

  const handleToggleActive = (id: string) => {
    // Here you would integrate with the opportunityHunterService
    toast.success('Keyword status updated');
  };

  const formatLastScanned = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'hourly':
        return 'bg-red-500/20 text-red-300';
      case 'daily':
        return 'bg-blue-500/20 text-blue-300';
      case 'weekly':
        return 'bg-green-500/20 text-green-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Seed Keyword */}
      <Card className="border-white/10 bg-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Seed Keyword
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Keyword</Label>
              <Input
                placeholder="Enter seed keyword..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Topic Cluster</Label>
              <Input
                placeholder="e.g., Marketing, SEO..."
                value={newCluster}
                onChange={(e) => setNewCluster(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Scan Frequency</Label>
              <Select value={newFrequency} onValueChange={setNewFrequency}>
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

            <div className="flex items-end">
              <Button 
                onClick={handleAddKeyword}
                className="w-full bg-neon-purple hover:bg-neon-blue"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Keyword
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Seed Keywords */}
      <Card className="border-white/10 bg-glass">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Seed Keywords
            </div>
            <Badge variant="secondary">
              {seedKeywords.filter(k => k.is_active).length} active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {seedKeywords.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No seed keywords yet</h3>
              <p className="text-muted-foreground">
                Add seed keywords to automatically discover content opportunities
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {seedKeywords.map((keyword) => (
                <div
                  key={keyword.id}
                  className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-black/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{keyword.keyword}</h4>
                        {keyword.topic_cluster && (
                          <Badge variant="outline" className="text-xs">
                            {keyword.topic_cluster}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Search className="h-3 w-3" />
                          {keyword.search_volume?.toLocaleString() || 'N/A'} volume
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatLastScanned(keyword.last_scanned)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={getFrequencyColor(keyword.scan_frequency)}>
                      {keyword.scan_frequency}
                    </Badge>
                    
                    <Button
                      variant={keyword.is_active ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleActive(keyword.id)}
                      className="text-xs"
                    >
                      {keyword.is_active ? 'Active' : 'Inactive'}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteKeyword(keyword.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
