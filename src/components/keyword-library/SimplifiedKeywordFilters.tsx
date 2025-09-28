import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { KeywordFilters as KeywordFiltersType } from '@/services/keywordLibraryService';

interface SimplifiedKeywordFiltersProps {
  filters: KeywordFiltersType;
  onFiltersChange: (filters: KeywordFiltersType) => void;
  onApply: () => void;
}

export const SimplifiedKeywordFilters: React.FC<SimplifiedKeywordFiltersProps> = ({
  filters,
  onFiltersChange,
  onApply
}) => {
  const updateFilter = (key: keyof KeywordFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const updateSourceTypes = (sourceType: string, checked: boolean) => {
    const currentTypes = filters.source_type || [];
    if (checked) {
      updateFilter('source_type', [...currentTypes, sourceType]);
    } else {
      updateFilter('source_type', currentTypes.filter(t => t !== sourceType));
    }
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.source_type?.length) count += filters.source_type.length;
    if (filters.volume_min || filters.volume_max) count += 1;
    if (filters.sort_by && filters.sort_by !== 'serp_last_updated') count += 1;
    return count;
  };

  const sourceTypes = [
    { value: 'manual', label: 'Manual', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { value: 'serp', label: 'SERP Research', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { value: 'glossary', label: 'Glossary', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { value: 'strategy', label: 'Strategy', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' }
  ];

  return (
    <div className="space-y-6">
      {/* Active Filters Indicator */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex items-center gap-2 pb-4 border-b border-border">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            {getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''} active
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Simplified Filters - Only 3 Core Options */}
      <div className="space-y-6">
        {/* Source Types */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Source Type</Label>
          <div className="grid grid-cols-2 gap-2">
            {sourceTypes.map((source) => (
              <label
                key={source.value}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${
                  filters.source_type?.includes(source.value)
                    ? source.color
                    : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted/50'
                }`}
              >
                <Checkbox
                  checked={filters.source_type?.includes(source.value) || false}
                  onCheckedChange={(checked) => updateSourceTypes(source.value, !!checked)}
                  className="hidden"
                />
                <span className="text-sm font-medium">{source.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Search Volume Range */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Search Volume Range</Label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              placeholder="Min volume"
              value={filters.volume_min || ''}
              onChange={(e) => updateFilter('volume_min', e.target.value ? parseInt(e.target.value) : undefined)}
              className="h-11"
            />
            <Input
              type="number"
              placeholder="Max volume"
              value={filters.volume_max || ''}
              onChange={(e) => updateFilter('volume_max', e.target.value ? parseInt(e.target.value) : undefined)}
              className="h-11"
            />
          </div>
        </div>

        {/* Sort By */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Sort By</Label>
          <Select 
            value={filters.sort_by || 'serp_last_updated'} 
            onValueChange={(value) => updateFilter('sort_by', value)}
          >
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-lg">
              <SelectItem value="serp_last_updated">Recently Updated</SelectItem>
              <SelectItem value="search_volume">Search Volume</SelectItem>
              <SelectItem value="usage_count">Usage Count</SelectItem>
              <SelectItem value="keyword">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <Button onClick={onApply} className="flex-1 h-11">
          Apply Filters
        </Button>
        <Button variant="outline" onClick={clearFilters} className="h-11">
          Reset
        </Button>
      </div>
    </div>
  );
};