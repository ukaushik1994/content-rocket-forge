import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, BookOpen, Mail, Globe, MessageSquare, Edit } from 'lucide-react';
import { ContentType } from '@/contexts/content/types';
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
  selectedContentType: ContentType | 'all';
  selectedStatus: string;
  searchQuery: string;
  onContentTypeChange: (type: ContentType | 'all') => void;
  onStatusChange: (status: string) => void;
  onSearchChange: (query: string) => void;
}

export const RepositoryFilters: React.FC<RepositoryFiltersProps> = ({
  contentStats,
  selectedContentType,
  selectedStatus,
  searchQuery,
  onContentTypeChange,
  onStatusChange,
  onSearchChange
}) => {
  const contentTypeFilters = [
    { value: 'all', label: 'All Content', icon: FileText, count: contentStats.total, color: 'text-foreground' },
    { value: 'article', label: 'Articles', icon: FileText, count: contentStats.articles, color: 'text-blue-500' },
    { value: 'blog', label: 'Blog Posts', icon: Edit, count: contentStats.blogs, color: 'text-green-500' },
    { value: 'glossary', label: 'Glossaries', icon: BookOpen, count: contentStats.glossaries, color: 'text-purple-500' },
    { value: 'email', label: 'Emails', icon: Mail, count: contentStats.emails, color: 'text-orange-500' },
    { value: 'landing_page', label: 'Landing Pages', icon: Globe, count: contentStats.landingPages, color: 'text-cyan-500' },
    { value: 'social_post', label: 'Social Posts', icon: MessageSquare, count: contentStats.socialPosts, color: 'text-pink-500' }
  ];

  return (
    <motion.div 
      className="space-y-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Enhanced Content Type Filter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {contentTypeFilters.map((filter, index) => (
          <motion.div
            key={filter.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              onClick={() => onContentTypeChange(filter.value as ContentType | 'all')}
              className={`glass-button h-auto p-4 flex flex-col items-center gap-2 transition-all duration-300 w-full ${
                selectedContentType === filter.value 
                  ? 'bg-gradient-to-r from-primary/20 to-neon-blue/20 border-primary/50 shadow-lg' 
                  : 'bg-background/40 backdrop-blur-sm border-white/10 hover:border-white/30'
              }`}
            >
              <filter.icon className={`h-5 w-5 ${
                selectedContentType === filter.value ? 'text-primary' : filter.color
              }`} />
              <div className="text-center">
                <div className="text-xs font-medium mb-1">{filter.label}</div>
                <CustomBadge 
                  className={`text-xs ${
                    selectedContentType === filter.value
                      ? 'bg-primary/30 text-primary'
                      : 'bg-muted/50 text-muted-foreground'
                  }`}
                >
                  {filter.count}
                </CustomBadge>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Enhanced Search and Status Filter */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        {/* Enhanced Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by title, content, tags, or solution..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 h-12 glass-input bg-background/50 backdrop-blur-xl border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 text-base"
          />
        </div>

        {/* Enhanced Status Filter */}
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-56 h-12 glass-input bg-background/50 backdrop-blur-xl border-white/10 focus:border-primary/50">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-background/95 backdrop-blur-xl border-white/20">
            <SelectItem value="all" className="hover:bg-white/10">
              <div className="flex items-center justify-between w-full">
                <span>All Status</span>
                <CustomBadge className="ml-2 bg-primary/20 text-primary">
                  {contentStats.total}
                </CustomBadge>
              </div>
            </SelectItem>
            <SelectItem value="draft" className="hover:bg-white/10">
              <div className="flex items-center justify-between w-full">
                <span>Draft</span>
                <CustomBadge className="ml-2 bg-yellow-500/20 text-yellow-600">
                  {contentStats.drafts}
                </CustomBadge>
              </div>
            </SelectItem>
            <SelectItem value="published" className="hover:bg-white/10">
              <div className="flex items-center justify-between w-full">
                <span>Published</span>
                <CustomBadge className="ml-2 bg-green-500/20 text-green-600">
                  {contentStats.published}
                </CustomBadge>
              </div>
            </SelectItem>
            <SelectItem value="archived" className="hover:bg-white/10">
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