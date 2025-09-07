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
  contentStats: ContentStats;
  searchQuery: string;
  selectedStatus: string;
  onSearchChange: (query: string) => void;
  onStatusChange: (status: string) => void;
}

export const RepositoryFilters: React.FC<RepositoryFiltersProps> = ({
  contentStats,
  searchQuery,
  selectedStatus,
  onSearchChange,
  onStatusChange
}) => {
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Search and Status Filter */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content by title, content, or tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 glass-input bg-background/40 backdrop-blur-sm border-white/10 focus:border-white/20"
          />
        </div>

        {/* Status Filter */}
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-48 glass-input bg-background/40 backdrop-blur-sm border-white/10 focus:border-white/20">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">
              <div className="flex items-center justify-between w-full">
                <span>Draft</span>
                <CustomBadge className="ml-2 bg-yellow-500/20 text-yellow-600">
                  {contentStats.drafts}
                </CustomBadge>
              </div>
            </SelectItem>
            <SelectItem value="published">
              <div className="flex items-center justify-between w-full">
                <span>Published</span>
                <CustomBadge className="ml-2 bg-green-500/20 text-green-600">
                  {contentStats.published}
                </CustomBadge>
              </div>
            </SelectItem>
            <SelectItem value="archived">
              <div className="flex items-center justify-between w-full">
                <span>Archived</span>
                <CustomBadge className="ml-2 bg-gray-500/20 text-gray-600">
                  {contentStats.archived}
                </CustomBadge>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </motion.div>
    </motion.div>
  );
};