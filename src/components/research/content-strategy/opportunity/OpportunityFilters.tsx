
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Filter, X, Brain, Users } from 'lucide-react';

interface OpportunityFiltersProps {
  filters: {
    status: string[];
    priority: string[];
    aioFriendly: boolean;
    maxDifficulty: number;
    minVolume: number;
    searchIntent?: string[];
    hasCompetitorAnalysis?: boolean;
  };
  onFiltersChange: (filters: any) => void;
  totalCount: number;
}

export const OpportunityFilters: React.FC<OpportunityFiltersProps> = ({
  filters,
  onFiltersChange,
  totalCount
}) => {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: string, value: string) => {
    const currentArray = filters[key as keyof typeof filters] as string[] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      status: [],
      priority: [],
      aioFriendly: false,
      maxDifficulty: 100,
      minVolume: 0,
      searchIntent: [],
      hasCompetitorAnalysis: false
    });
  };

  return (
    <Card className="border-white/10 bg-glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            <Badge variant="secondary" className="ml-2">
              {totalCount} opportunities
            </Badge>
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Status</Label>
          <div className="flex flex-wrap gap-2">
            {['new', 'assigned', 'in_progress', 'scheduled', 'published'].map(status => (
              <Button
                key={status}
                variant={filters.status.includes(status) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleArrayFilter('status', status)}
                className="text-xs"
              >
                {status.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Priority</Label>
          <div className="flex flex-wrap gap-2">
            {['high', 'medium', 'low'].map(priority => (
              <Button
                key={priority}
                variant={filters.priority.includes(priority) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleArrayFilter('priority', priority)}
                className="text-xs"
              >
                {priority}
              </Button>
            ))}
          </div>
        </div>

        {/* Search Intent Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Search Intent</Label>
          <div className="flex flex-wrap gap-2">
            {['informational', 'navigational', 'transactional', 'commercial'].map(intent => (
              <Button
                key={intent}
                variant={filters.searchIntent?.includes(intent) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleArrayFilter('searchIntent', intent)}
                className="text-xs"
              >
                {intent}
              </Button>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* AIO Friendly */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              <Label className="text-sm">AIO-Friendly Only</Label>
            </div>
            <Switch
              checked={filters.aioFriendly}
              onCheckedChange={(checked) => updateFilter('aioFriendly', checked)}
            />
          </div>

          {/* Competitor Analysis */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <Label className="text-sm">Has Competitor Analysis</Label>
            </div>
            <Switch
              checked={filters.hasCompetitorAnalysis || false}
              onCheckedChange={(checked) => updateFilter('hasCompetitorAnalysis', checked)}
            />
          </div>
        </div>

        {/* Difficulty Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Max Keyword Difficulty: {filters.maxDifficulty}
          </Label>
          <Slider
            value={[filters.maxDifficulty]}
            onValueChange={([value]) => updateFilter('maxDifficulty', value)}
            max={100}
            min={0}
            step={5}
            className="w-full"
          />
        </div>

        {/* Volume Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Min Search Volume: {filters.minVolume.toLocaleString()}
          </Label>
          <Slider
            value={[filters.minVolume]}
            onValueChange={([value]) => updateFilter('minVolume', value)}
            max={10000}
            min={0}
            step={100}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};
