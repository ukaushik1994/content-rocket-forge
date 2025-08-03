
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Filter, X } from 'lucide-react';

interface OpportunityFiltersProps {
  filters: {
    status: string[];
    priority: string[];
    aioFriendly: boolean | undefined;
    maxDifficulty: number;
    minVolume: number;
  };
  onFiltersChange: (filters: any) => void;
  totalCount: number;
}

export const OpportunityFilters: React.FC<OpportunityFiltersProps> = ({
  filters,
  onFiltersChange,
  totalCount
}) => {
  const statusOptions = ['new', 'in_progress', 'scheduled', 'published', 'dismissed'];
  const priorityOptions = ['high', 'medium', 'low'];

  const handleStatusToggle = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    
    onFiltersChange({ ...filters, status: newStatus });
  };

  const handlePriorityToggle = (priority: string) => {
    const newPriority = filters.priority.includes(priority)
      ? filters.priority.filter(p => p !== priority)
      : [...filters.priority, priority];
    
    onFiltersChange({ ...filters, priority: newPriority });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: [],
      priority: [],
      aioFriendly: undefined,
      maxDifficulty: 50,
      minVolume: 100
    });
  };

  const hasActiveFilters = 
    filters.status.length > 0 || 
    filters.priority.length > 0 || 
    filters.aioFriendly !== undefined ||
    filters.maxDifficulty !== 50 ||
    filters.minVolume !== 100;

  return (
    <Card className="border-white/10 bg-glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-white"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Filter */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Status</Label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(status => (
              <Badge
                key={status}
                variant={filters.status.includes(status) ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  filters.status.includes(status) 
                    ? 'bg-neon-purple text-white' 
                    : 'hover:bg-white/10'
                }`}
                onClick={() => handleStatusToggle(status)}
              >
                {status.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Priority</Label>
          <div className="flex flex-wrap gap-2">
            {priorityOptions.map(priority => (
              <Badge
                key={priority}
                variant={filters.priority.includes(priority) ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  filters.priority.includes(priority) 
                    ? 'bg-neon-purple text-white' 
                    : 'hover:bg-white/10'
                }`}
                onClick={() => handlePriorityToggle(priority)}
              >
                {priority}
              </Badge>
            ))}
          </div>
        </div>

        {/* AIO Friendly Filter */}
        <div className="flex items-center justify-between">
          <Label htmlFor="aio-friendly" className="text-sm font-medium">
            AIO Friendly Only
          </Label>
          <Switch
            id="aio-friendly"
            checked={filters.aioFriendly === true}
            onCheckedChange={(checked) => 
              onFiltersChange({ ...filters, aioFriendly: checked ? true : undefined })
            }
          />
        </div>

        {/* Difficulty Range */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Max Keyword Difficulty: {filters.maxDifficulty}
          </Label>
          <Slider
            value={[filters.maxDifficulty]}
            onValueChange={([value]) => 
              onFiltersChange({ ...filters, maxDifficulty: value })
            }
            max={100}
            min={1}
            step={1}
            className="w-full"
          />
        </div>

        {/* Volume Range */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Min Search Volume: {filters.minVolume.toLocaleString()}
          </Label>
          <Slider
            value={[filters.minVolume]}
            onValueChange={([value]) => 
              onFiltersChange({ ...filters, minVolume: value })
            }
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
