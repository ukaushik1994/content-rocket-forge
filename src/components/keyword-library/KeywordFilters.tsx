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
      updateFilter('source_type', currentTypes.filter(t => t !== sourceType));
    }
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const sourceTypes = [
    { value: 'manual', label: 'Manual', color: 'text-blue-400' },
    { value: 'serp', label: 'SERP Research', color: 'text-purple-400' },
    { value: 'glossary', label: 'Glossary', color: 'text-green-400' },
    { value: 'strategy', label: 'Strategy', color: 'text-orange-400' }
  ];

  return (
    <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Source Types */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Source Types</Label>
            <div className="space-y-2">
              {sourceTypes.map((source) => (
                <div key={source.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={source.value}
                    checked={filters.source_type?.includes(source.value) || false}
                    onCheckedChange={(checked) => updateSourceTypes(source.value, !!checked)}
                  />
                  <Label htmlFor={source.value} className={`text-sm ${source.color}`}>
                    {source.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Search Volume */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Search Volume</Label>
            <div className="space-y-2">
              <div>
                <Label htmlFor="volume-min" className="text-xs text-muted-foreground">
                  Minimum
                </Label>
                <Input
                  id="volume-min"
                  type="number"
                  placeholder="0"
                  value={filters.volume_min || ''}
                  onChange={(e) => updateFilter('volume_min', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="border-white/20 bg-white/5"
                />
              </div>
              <div>
                <Label htmlFor="volume-max" className="text-xs text-muted-foreground">
                  Maximum
                </Label>
                <Input
                  id="volume-max"
                  type="number"
                  placeholder="100000"
                  value={filters.volume_max || ''}
                  onChange={(e) => updateFilter('volume_max', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="border-white/20 bg-white/5"
                />
              </div>
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Keyword Difficulty</Label>
            <div className="space-y-2">
              <div>
                <Label htmlFor="difficulty-min" className="text-xs text-muted-foreground">
                  Minimum
                </Label>
                <Input
                  id="difficulty-min"
                  type="number"
                  placeholder="0"
                  min="0"
                  max="100"
                  value={filters.difficulty_min || ''}
                  onChange={(e) => updateFilter('difficulty_min', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="border-white/20 bg-white/5"
                />
              </div>
              <div>
                <Label htmlFor="difficulty-max" className="text-xs text-muted-foreground">
                  Maximum
                </Label>
                <Input
                  id="difficulty-max"
                  type="number"
                  placeholder="100"
                  min="0"
                  max="100"
                  value={filters.difficulty_max || ''}
                  onChange={(e) => updateFilter('difficulty_max', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="border-white/20 bg-white/5"
                />
              </div>
            </div>
          </div>

          {/* Usage and Sorting */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Usage & Sorting</Label>
            <div className="space-y-2">
              <div>
                <Label htmlFor="usage-min" className="text-xs text-muted-foreground">
                  Min Usage Count
                </Label>
                <Input
                  id="usage-min"
                  type="number"
                  placeholder="0"
                  value={filters.usage_count_min || ''}
                  onChange={(e) => updateFilter('usage_count_min', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="border-white/20 bg-white/5"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has-usage"
                  checked={filters.has_usage || false}
                  onCheckedChange={(checked) => updateFilter('has_usage', checked)}
                />
                <Label htmlFor="has-usage" className="text-sm">
                  Only with usage
                </Label>
              </div>

              <div>
                <Label htmlFor="sort-by" className="text-xs text-muted-foreground">
                  Sort By
                </Label>
                <Select 
                  value={filters.sort_by || 'last_updated_at'} 
                  onValueChange={(value) => updateFilter('sort_by', value)}
                >
                  <SelectTrigger className="border-white/20 bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keyword">Keyword</SelectItem>
                    <SelectItem value="search_volume">Search Volume</SelectItem>
                    <SelectItem value="difficulty">Difficulty</SelectItem>
                    <SelectItem value="usage_count">Usage Count</SelectItem>
                    <SelectItem value="first_discovered_at">Date Added</SelectItem>
                    <SelectItem value="last_updated_at">Last Updated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sort-order" className="text-xs text-muted-foreground">
                  Order
                </Label>
                <Select 
                  value={filters.sort_order || 'desc'} 
                  onValueChange={(value) => updateFilter('sort_order', value)}
                >
                  <SelectTrigger className="border-white/20 bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="border-t border-white/10 pt-4">
          <Label className="text-sm font-medium mb-3 block">Date Range</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date-from" className="text-xs text-muted-foreground">
                From
              </Label>
              <Input
                id="date-from"
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => updateFilter('date_from', e.target.value)}
                className="border-white/20 bg-white/5"
              />
            </div>
            <div>
              <Label htmlFor="date-to" className="text-xs text-muted-foreground">
                To
              </Label>
              <Input
                id="date-to"
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => updateFilter('date_to', e.target.value)}
                className="border-white/20 bg-white/5"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};