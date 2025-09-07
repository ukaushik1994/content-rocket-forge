import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { CustomBadge } from '@/components/ui/custom-badge';

interface ContentStats {
  total: number;
  articles: number;
  blogs: number;
  glossaries: number;
  socialPosts: number;
  emails: number;
  landingPages: number;
  drafts: number;
  published: number;
  archived: number;
}

interface RepositoryFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const RepositoryFilters: React.FC<RepositoryFiltersProps> = ({
  searchQuery,
  onSearchChange
}) => {
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Search Input */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content by title, content, or tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 glass-input bg-background/40 backdrop-blur-sm border-white/10 focus:border-white/20"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};