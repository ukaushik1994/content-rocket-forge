
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContentSelectionHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalItems: number;
}

const ContentSelectionHeader: React.FC<ContentSelectionHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  totalItems,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-2"
    >
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">
          <motion.div
            whileHover={{ rotate: 45, scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <Search className="h-4 w-4" />
          </motion.div>
        </div>
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search content..."
          className="pl-9 bg-black/50 border-white/10 rounded-lg focus-visible:ring-neon-purple"
        />
      </div>
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          {totalItems} {totalItems === 1 ? 'item' : 'items'} found
        </p>
        {searchQuery && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSearchQuery('')}
            className="text-xs text-neon-purple hover:text-neon-blue transition-colors"
          >
            Clear Search
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default ContentSelectionHeader;
