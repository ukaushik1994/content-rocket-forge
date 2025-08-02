import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FloatingSearchProps {
  isOpen: boolean;
  onToggle: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
  availableCategories: string[];
}

export const FloatingSearch: React.FC<FloatingSearchProps> = ({
  isOpen,
  onToggle,
  searchQuery,
  onSearchChange,
  selectedFilters,
  onFilterChange,
  availableCategories
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);
    onSearchChange(value);
  };

  const toggleFilter = (category: string) => {
    const newFilters = selectedFilters.includes(category)
      ? selectedFilters.filter(f => f !== category)
      : [...selectedFilters, category];
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onFilterChange([]);
    setLocalQuery('');
    onSearchChange('');
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-30"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={onToggle}
          size="lg"
          className="rounded-full h-12 w-12 p-0 bg-neon-purple hover:bg-neon-purple/80 shadow-lg shadow-neon-purple/25"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div
                key="search"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Search className="h-5 w-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Search Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-24 right-6 w-80 bg-glass backdrop-blur-sm border border-white/10 rounded-xl p-4 z-30 shadow-xl"
          >
            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={localQuery}
                onChange={handleQueryChange}
                placeholder="Search providers..."
                className="pl-10 bg-white/5 border-white/10"
              />
            </div>

            {/* Filter Categories */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Categories</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {availableCategories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedFilters.includes(category) ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      selectedFilters.includes(category)
                        ? 'bg-neon-purple text-white'
                        : 'hover:bg-white/10'
                    }`}
                    onClick={() => toggleFilter(category)}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Active Filters Summary */}
            {(selectedFilters.length > 0 || localQuery) && (
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {selectedFilters.length} filter{selectedFilters.length !== 1 ? 's' : ''} active
                    {localQuery && `, searching "${localQuery}"`}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-6 px-2 text-xs"
                  >
                    Clear all
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};