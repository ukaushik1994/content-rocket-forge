import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  X, 
  Filter,
  CheckCircle,
  AlertTriangle,
  Settings
} from 'lucide-react';

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  activeFilters: string[];
  onClearFilters: () => void;
}

export const SearchAndFilter = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  activeFilters,
  onClearFilters
}: SearchAndFilterProps) => {
  const statusOptions = [
    { value: 'all', label: 'All Providers', icon: null },
    { value: 'connected', label: 'Connected', icon: CheckCircle, color: 'text-emerald-400' },
    { value: 'error', label: 'Issues', icon: AlertTriangle, color: 'text-amber-400' },
    { value: 'unconfigured', label: 'Needs Setup', icon: Settings, color: 'text-blue-400' }
  ];

  const quickFilters = [
    { label: 'Required', value: 'required' },
    { label: 'AI Services', value: 'ai' },
    { label: 'SEO & Analytics', value: 'seo' },
    { label: 'Communication', value: 'communication' }
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search API providers..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 bg-background/50"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => onSearchChange('')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <div className="flex items-center gap-1">
          <Filter className="h-3 w-3 text-muted-foreground" />
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              variant={statusFilter === option.value ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onStatusFilterChange(option.value)}
              className="h-7 px-2 text-xs"
            >
              {option.icon && (
                <option.icon className={`h-3 w-3 mr-1 ${option.color || ''}`} />
              )}
              {option.label}
            </Button>
          ))}
        </div>

        {/* Divider */}
        {statusFilter !== 'all' && (
          <div className="h-4 w-px bg-border mx-1" />
        )}

        {/* Quick Filters */}
        {quickFilters.map((filter) => (
          <Badge
            key={filter.value}
            variant={activeFilters.includes(filter.value) ? "secondary" : "outline"}
            className="cursor-pointer hover:bg-secondary/80 text-xs"
            onClick={() => {
              // Toggle filter logic would go here
            }}
          >
            {filter.label}
          </Badge>
        ))}

        {/* Clear Filters */}
        {(searchQuery || statusFilter !== 'all' || activeFilters.length > 0) && (
          <>
            <div className="h-4 w-px bg-border mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </>
        )}
      </div>
    </div>
  );
};