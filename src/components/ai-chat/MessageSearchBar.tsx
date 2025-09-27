import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, Download, BarChart3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface MessageSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExportConversation: (format: 'json' | 'markdown' | 'txt') => void;
  onShowAnalytics: () => void;
  messageCount: number;
  filteredCount?: number;
  className?: string;
}

export const MessageSearchBar: React.FC<MessageSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onExportConversation,
  onShowAnalytics,
  messageCount,
  filteredCount,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClearSearch = useCallback(() => {
    onSearchChange('');
    setIsExpanded(false);
  }, [onSearchChange]);

  const handleSearchFocus = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const isFiltered = searchQuery.length > 0;

  return (
    <motion.div 
      className={cn(
        "bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg",
        className
      )}
      animate={{ 
        height: isExpanded ? 'auto' : '48px',
        opacity: 1 
      }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      {/* Search Input */}
      <div className="flex items-center gap-2 p-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={handleSearchFocus}
            className="pl-10 pr-10 bg-background/50 border-border/50"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onExportConversation('json')}>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExportConversation('markdown')}>
                Export as Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExportConversation('txt')}>
                Export as Text
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={onShowAnalytics}
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search Results Summary */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 pb-3 border-t border-border/50"
          >
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {isFiltered && filteredCount !== undefined ? (
                  <Badge variant="secondary" className="text-xs">
                    {filteredCount} of {messageCount} messages
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    {messageCount} total messages
                  </Badge>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6"
                onClick={() => setIsExpanded(false)}
              >
                Collapse
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};