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
    if (filters.difficulty_min || filters.difficulty_max) count += 1;
    if (filters.sort_by && filters.sort_by !== 'serp_last_updated') count += 1;
    if (filters.has_usage) count += 1;
    return count;
  };

  const sourceTypes = [
    { value: 'manual', label: 'Manual', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    { value: 'serp', label: 'SERP Research', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    { value: 'glossary', label: 'Glossary', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
    { value: 'strategy', label: 'Strategy', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' }
  ];

  return (
    <div className="space-y-6 p-1">
      {/* Active Filters Indicator */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
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

      {/* Main Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Types */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Source Types</Label>
          <div className="flex flex-wrap gap-2">
            {sourceTypes.map((source) => (
              <label
                key={source.value}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                  filters.source_type?.includes(source.value)
                    ? source.color
                    : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
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

        {/* Quick Sorting */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Sort By</Label>
          <Select 
            value={filters.sort_by || 'serp_last_updated'} 
            onValueChange={(value) => updateFilter('sort_by', value)}
          >
            <SelectTrigger className="bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="serp_last_updated">Recently Updated</SelectItem>
              <SelectItem value="search_volume">Search Volume</SelectItem>
              <SelectItem value="difficulty">Difficulty</SelectItem>
              <SelectItem value="usage_count">Usage Count</SelectItem>
              <SelectItem value="keyword">Alphabetical</SelectItem>
              <SelectItem value="first_discovered_at">Date Added</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Volume Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Search Volume</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.volume_min || ''}
              onChange={(e) => updateFilter('volume_min', e.target.value ? parseInt(e.target.value) : undefined)}
              className="bg-background/50"
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.volume_max || ''}
              onChange={(e) => updateFilter('volume_max', e.target.value ? parseInt(e.target.value) : undefined)}
              className="bg-background/50"
            />
          </div>
        </div>

        {/* Difficulty Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Keyword Difficulty</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              min="0"
              max="100"
              value={filters.difficulty_min || ''}
              onChange={(e) => updateFilter('difficulty_min', e.target.value ? parseInt(e.target.value) : undefined)}
              className="bg-background/50"
            />
            <Input
              type="number"
              placeholder="Max"
              min="0"
              max="100"
              value={filters.difficulty_max || ''}
              onChange={(e) => updateFilter('difficulty_max', e.target.value ? parseInt(e.target.value) : undefined)}
              className="bg-background/50"
            />
          </div>
        </div>
      </div>

      {/* Additional Options */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={filters.has_usage || false}
              onCheckedChange={(checked) => updateFilter('has_usage', checked)}
            />
            <span className="text-sm">Only keywords with usage</span>
          </label>
          
          <Select 
            value={filters.sort_order || 'desc'} 
            onValueChange={(value) => updateFilter('sort_order', value)}
          >
            <SelectTrigger className="w-32 bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <Button onClick={onApply} className="flex-1">
          Apply Filters
        </Button>
        <Button variant="outline" onClick={clearFilters}>
          Reset
        </Button>
      </div>
    </div>
  );
};