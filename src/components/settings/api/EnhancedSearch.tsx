import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Filter, X, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface EnhancedSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  activeFilters: string[];
  onClearFilters: () => void;
}

export const EnhancedSearch = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  activeFilters,
  onClearFilters
}: EnhancedSearchProps) => {
  const filterOptions = [
    { value: 'all', label: 'All Status', icon: null },
    { value: 'connected', label: 'Connected', icon: CheckCircle2, color: 'text-green-500' },
    { value: 'warning', label: 'Needs Attention', icon: AlertCircle, color: 'text-yellow-500' },
    { value: 'error', label: 'Not Working', icon: XCircle, color: 'text-red-500' },
  ];

  const quickFilters = [
    { label: 'Required APIs', value: 'required' },
    { label: 'AI Services', value: 'ai' },
    { label: 'Recently Updated', value: 'recent' },
  ];

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search APIs by name, category, or functionality..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 h-12 bg-background/50 border-border/50 focus:border-neon-purple/50"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => onSearchChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="h-4 w-4 mr-2" />
              Status: {filterOptions.find(f => f.value === statusFilter)?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {filterOptions.map(option => {
              const Icon = option.icon;
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onStatusFilterChange(option.value)}
                  className="flex items-center gap-2"
                >
                  {Icon && <Icon className={`h-4 w-4 ${option.color}`} />}
                  <span>{option.label}</span>
                  {statusFilter === option.value && (
                    <CheckCircle2 className="h-4 w-4 ml-auto text-neon-purple" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick Filter Badges */}
        {quickFilters.map(filter => (
          <Badge
            key={filter.value}
            variant={activeFilters.includes(filter.value) ? "default" : "outline"}
            className={`cursor-pointer transition-all duration-200 ${
              activeFilters.includes(filter.value) 
                ? 'bg-neon-purple/20 text-neon-purple border-neon-purple/30' 
                : 'hover:bg-accent'
            }`}
            onClick={() => {
              // Toggle filter logic would go here
              console.log('Toggle filter:', filter.value);
            }}
          >
            {filter.label}
          </Badge>
        ))}

        {/* Clear Filters */}
        {(searchQuery || statusFilter !== 'all' || activeFilters.length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {(searchQuery || statusFilter !== 'all') && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="text-xs">
              Search: "{searchQuery}"
            </Badge>
          )}
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Status: {filterOptions.find(f => f.value === statusFilter)?.label}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};