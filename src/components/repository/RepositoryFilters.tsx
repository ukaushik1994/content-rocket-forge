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
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Content Type Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {contentTypeFilters.map((filter, index) => (
          <motion.div
            key={filter.value}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <Button
              variant={selectedContentType === filter.value ? "default" : "outline"}
              onClick={() => onContentTypeChange(filter.value as ContentType | 'all')}
              className={`glass-button transition-all duration-300 ${
                selectedContentType === filter.value 
                  ? 'bg-gradient-to-r from-primary to-neon-blue text-white border-white/20 shadow-lg' 
                  : 'bg-background/40 backdrop-blur-sm border-white/10 hover:border-white/20'
              }`}
              size="sm"
            >
              <filter.icon className={`mr-2 h-4 w-4 ${filter.color}`} />
              {filter.label}
              <CustomBadge 
                className={`ml-2 text-xs ${
                  selectedContentType === filter.value
                    ? 'bg-white/20 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {filter.count}
              </CustomBadge>
            </Button>
          </motion.div>
        ))}
      </div>

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