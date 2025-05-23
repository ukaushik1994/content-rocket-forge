
import React from 'react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, Search, Filter, Grid3X3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface ContentSelectionHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalItems: number;
}

const ContentSelectionHeader: React.FC<ContentSelectionHeaderProps> = ({ 
  searchQuery, 
  setSearchQuery,
  totalItems
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border border-white/10">
              <Grid3X3 className="h-5 w-5 text-neon-purple" />
            </div>
            <span className="text-gradient">Your Content Library</span>
          </CardTitle>
          <CardDescription className="text-lg">
            Select content to transform into different formats and reach new audiences
          </CardDescription>
        </div>
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 border border-white/10"
        >
          <Sparkles className="h-4 w-4 text-neon-purple animate-pulse" />
          <span className="text-sm font-medium">{totalItems} items ready for transformation</span>
        </motion.div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search your content..." 
              className="pl-10 w-80 bg-black/30 border-white/20 focus:border-neon-purple/50 focus:ring-neon-purple/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="border-white/20 bg-black/30 hover:bg-neon-purple/10 hover:border-neon-purple/30 transition-all"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {totalItems > 0 ? (
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              {totalItems} content {totalItems === 1 ? 'item' : 'items'} available
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              No content available
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContentSelectionHeader;
