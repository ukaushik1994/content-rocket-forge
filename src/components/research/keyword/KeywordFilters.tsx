import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Filter } from 'lucide-react';
import { KeywordFilters as KeywordFiltersType } from '@/services/keywordLibraryService';

interface KeywordFiltersProps {
  filters: KeywordFiltersType;
  onFiltersChange: (filters: KeywordFiltersType) => void;
  onClose: () => void;
}

export const KeywordFilters: React.FC<KeywordFiltersProps> = ({
  filters,
  onFiltersChange,
  onClose
}) => {
  const updateFilter = (key: keyof KeywordFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const updateSourceTypes = (sourceType: string, checked: boolean) => {
    const currentTypes = filters.source_type || [];
    if (checked) {
      updateFilter('source_type', [...currentTypes, sourceType]);
    } else {
      updateFilter('source_type', currentTypes.filter(type => type !== sourceType));
    }
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <Card className="glass-panel border-white/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Filter className="h-4 w-4 text-primary" />
          Keyword Filters
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Source Types */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Source Types</Label>
          <div className="grid grid-cols-2 gap-2">
            {['manual', 'serp', 'research', 'glossary', 'strategy'].map((sourceType) => (
              <div key={sourceType} className="flex items-center space-x-2">
                <Checkbox
                  id={sourceType}
                  checked={filters.source_type?.includes(sourceType) || false}
                  onCheckedChange={(checked) => updateSourceTypes(sourceType, checked as boolean)}
                />
                <Label
                  htmlFor={sourceType}
                  className="text-xs capitalize cursor-pointer"
                >
                  {sourceType === 'serp' ? 'SERP Research' : sourceType}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Search Volume Range */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">Min Volume</Label>
            <Input
              type="number"
              placeholder="0"
              value={filters.volume_min || ''}
              onChange={(e) => updateFilter('volume_min', e.target.value ? Number(e.target.value) : undefined)}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Max Volume</Label>
            <Input
              type="number"
              placeholder="∞"
              value={filters.volume_max || ''}
              onChange={(e) => updateFilter('volume_max', e.target.value ? Number(e.target.value) : undefined)}
              className="h-8 text-xs"
            />
          </div>
        </div>

        {/* Keyword Difficulty Range */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">Min Difficulty</Label>
            <Input
              type="number"
              placeholder="0"
              min="0"
              max="100"
              value={filters.difficulty_min || ''}
              onChange={(e) => updateFilter('difficulty_min', e.target.value ? Number(e.target.value) : undefined)}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Max Difficulty</Label>
            <Input
              type="number"
              placeholder="100"
              min="0"
              max="100"
              value={filters.difficulty_max || ''}
              onChange={(e) => updateFilter('difficulty_max', e.target.value ? Number(e.target.value) : undefined)}
              className="h-8 text-xs"
            />
          </div>
        </div>

        {/* Data Freshness */}
        <div>
          <Label className="text-xs text-muted-foreground">Data Freshness</Label>
          <Select
            value={filters.data_freshness || 'any'}
            onValueChange={(value) => updateFilter('data_freshness', value === 'any' ? undefined : value)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="fresh">Fresh (&lt; 24h)</SelectItem>
              <SelectItem value="stale">Stale (&gt; 24h)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Usage and Sorting */}
        <div className="space-y-2">
          <div>
            <Label className="text-xs text-muted-foreground">Min Usage Count</Label>
            <Input
              type="number"
              placeholder="0"
              value={filters.usage_count_min || ''}
              onChange={(e) => updateFilter('usage_count_min', e.target.value ? Number(e.target.value) : undefined)}
              className="h-8 text-xs"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_usage"
              checked={filters.has_usage || false}
              onCheckedChange={(checked) => updateFilter('has_usage', checked)}
            />
            <Label htmlFor="has_usage" className="text-xs cursor-pointer">
              Only with usage
            </Label>
          </div>
        </div>

        {/* Sort Options */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">Sort By</Label>
            <Select
              value={filters.sort_by || 'last_updated_at'}
              onValueChange={(value) => updateFilter('sort_by', value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="keyword">Keyword</SelectItem>
                <SelectItem value="search_volume">Search Volume</SelectItem>
                <SelectItem value="difficulty">Difficulty</SelectItem>
                <SelectItem value="usage_count">Usage Count</SelectItem>
                <SelectItem value="first_discovered_at">Date Added</SelectItem>
                <SelectItem value="serp_last_updated">Data Freshness</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Order</Label>
            <Select
              value={filters.sort_order || 'desc'}
              onValueChange={(value) => updateFilter('sort_order', value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">Date From</Label>
            <Input
              type="date"
              value={filters.date_from || ''}
              onChange={(e) => updateFilter('date_from', e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Date To</Label>
            <Input
              type="date"
              value={filters.date_to || ''}
              onChange={(e) => updateFilter('date_to', e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-xs"
          >
            Clear All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};