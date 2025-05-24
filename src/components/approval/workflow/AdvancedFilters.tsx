
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Filter, X, Calendar, User, Tag } from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';

interface FilterCriteria {
  status?: string;
  assignee?: string;
  dateRange?: { from: string; to: string };
  keyword?: string;
  tags?: string[];
  seoScore?: { min: number; max: number };
  priority?: string;
}

interface AdvancedFiltersProps {
  contentItems: ContentItemType[];
  onFiltersChange: (criteria: FilterCriteria) => void;
  className?: string;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  contentItems,
  onFiltersChange,
  className
}) => {
  const [filters, setFilters] = useState<FilterCriteria>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof FilterCriteria, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const removeFilter = (key: keyof FilterCriteria) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    return Object.keys(filters).filter(key => {
      const value = filters[key as keyof FilterCriteria];
      return value !== undefined && value !== null && value !== '';
    }).length;
  };

  const renderActiveFilters = () => {
    const activeFilters = [];

    if (filters.status) {
      activeFilters.push(
        <Badge key="status" variant="secondary" className="flex items-center gap-1">
          Status: {filters.status}
          <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('status')} />
        </Badge>
      );
    }

    if (filters.assignee) {
      activeFilters.push(
        <Badge key="assignee" variant="secondary" className="flex items-center gap-1">
          Assignee: {filters.assignee}
          <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('assignee')} />
        </Badge>
      );
    }

    if (filters.keyword) {
      activeFilters.push(
        <Badge key="keyword" variant="secondary" className="flex items-center gap-1">
          Keyword: {filters.keyword}
          <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('keyword')} />
        </Badge>
      );
    }

    if (filters.seoScore) {
      activeFilters.push(
        <Badge key="seoScore" variant="secondary" className="flex items-center gap-1">
          SEO: {filters.seoScore.min}-{filters.seoScore.max}
          <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('seoScore')} />
        </Badge>
      );
    }

    return activeFilters;
  };

  return (
    <Card className={`bg-white/5 border-white/10 backdrop-blur-sm ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white/90">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="outline" className="bg-neon-purple/20 text-neon-purple border-neon-purple/30">
                {getActiveFilterCount()} active
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Filters */}
        {getActiveFilterCount() > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-white/80">Active Filters:</Label>
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-white/70 hover:text-white">
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {renderActiveFilters()}
            </div>
          </div>
        )}

        {/* Quick Filters */}
        <div className="grid grid-cols-2 gap-2">
          <Select value={filters.status || ''} onValueChange={(value) => updateFilter('status', value || undefined)}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="needs_changes">Needs Changes</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.assignee || ''} onValueChange={(value) => updateFilter('assignee', value || undefined)}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Assignees</SelectItem>
              <SelectItem value="reviewer-1">John Doe</SelectItem>
              <SelectItem value="reviewer-2">Jane Smith</SelectItem>
              <SelectItem value="reviewer-3">Mike Johnson</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-white/10">
            {/* Keyword Search */}
            <div className="space-y-2">
              <Label className="text-white/80">Keyword Search</Label>
              <Input
                placeholder="Search in title and content..."
                value={filters.keyword || ''}
                onChange={(e) => updateFilter('keyword', e.target.value || undefined)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>

            {/* SEO Score Range */}
            <div className="space-y-2">
              <Label className="text-white/80">SEO Score Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="100"
                  value={filters.seoScore?.min || ''}
                  onChange={(e) => {
                    const min = parseInt(e.target.value) || 0;
                    updateFilter('seoScore', { 
                      min, 
                      max: filters.seoScore?.max || 100 
                    });
                  }}
                  className="bg-white/5 border-white/10 text-white"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="100"
                  value={filters.seoScore?.max || ''}
                  onChange={(e) => {
                    const max = parseInt(e.target.value) || 100;
                    updateFilter('seoScore', { 
                      min: filters.seoScore?.min || 0, 
                      max 
                    });
                  }}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            {/* Priority Filter */}
            <div className="space-y-2">
              <Label className="text-white/80">Priority</Label>
              <Select value={filters.priority || ''} onValueChange={(value) => updateFilter('priority', value || undefined)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
