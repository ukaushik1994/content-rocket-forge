import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { CustomBadge } from '@/components/ui/custom-badge';
import { Calendar, X, FileText, BookOpen, Mail, Globe, MessageSquare, Edit } from 'lucide-react';
import { ContentType } from '@/contexts/content/types';
import { motion } from 'framer-motion';

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

interface AdvancedFilters {
  contentType?: ContentType | 'all';
  dateRange?: {
    from: string;
    to: string;
  };
  tags?: string[];
  seoScoreRange?: [number, number];
  wordCountRange?: [number, number];
  keywords?: string;
}

interface AdvancedFiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFiltersApply: (filters: AdvancedFilters) => void;
  contentStats: ContentStats;
}

export const AdvancedFiltersModal: React.FC<AdvancedFiltersModalProps> = ({
  open,
  onOpenChange,
  onFiltersApply,
  contentStats
}) => {
  const [filters, setFilters] = useState<AdvancedFilters>({});
  const [currentTag, setCurrentTag] = useState('');

  const handleAddTag = () => {
    if (currentTag.trim() && !filters.tags?.includes(currentTag.trim())) {
      setFilters(prev => ({
        ...prev,
        tags: [...(prev.tags || []), currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag)
    }));
  };

  const handleApplyFilters = () => {
    onFiltersApply(filters);
    onOpenChange(false);
  };

  const handleClearFilters = () => {
    setFilters({});
    onFiltersApply({});
  };

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] glass-panel bg-background/95 backdrop-blur-lg border-white/10">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Advanced Filters</DialogTitle>
        </DialogHeader>

        <motion.div 
          className="space-y-6 py-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Content Type Filter */}
          <div className="space-y-2">
            <Label>Content Type</Label>
            <div className="flex flex-wrap gap-2">
              {contentTypeFilters.map((filter, index) => (
                <motion.div
                  key={filter.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Button
                    variant={filters.contentType === filter.value ? "default" : "outline"}
                    onClick={() => setFilters(prev => ({ ...prev, contentType: filter.value as ContentType | 'all' }))}
                    className={`glass-button transition-all duration-300 ${
                      filters.contentType === filter.value 
                        ? 'bg-gradient-to-r from-primary to-neon-blue text-white border-white/20 shadow-lg' 
                        : 'bg-background/40 backdrop-blur-sm border-white/10 hover:border-white/20'
                    }`}
                    size="sm"
                  >
                    <filter.icon className={`mr-2 h-4 w-4 ${filter.color}`} />
                    {filter.label}
                    <CustomBadge 
                      className={`ml-2 text-xs ${
                        filters.contentType === filter.value
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
          </div>
          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-sm text-muted-foreground">From</Label>
                <Input
                  type="date"
                  value={filters.dateRange?.from || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, from: e.target.value, to: prev.dateRange?.to || '' }
                  }))}
                  className="glass-input bg-background/40 backdrop-blur-sm border-white/10"
                />
              </div>
              <div className="flex-1">
                <Label className="text-sm text-muted-foreground">To</Label>
                <Input
                  type="date"
                  value={filters.dateRange?.to || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, to: e.target.value, from: prev.dateRange?.from || '' }
                  }))}
                  className="glass-input bg-background/40 backdrop-blur-sm border-white/10"
                />
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <Label>Keywords</Label>
            <Input
              placeholder="Search for specific keywords..."
              value={filters.keywords || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, keywords: e.target.value }))}
              className="glass-input bg-background/40 backdrop-blur-sm border-white/10"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="flex-1 glass-input bg-background/40 backdrop-blur-sm border-white/10"
              />
              <Button variant="outline" onClick={handleAddTag} size="sm">
                Add
              </Button>
            </div>
            {filters.tags && filters.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {filters.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-primary/20 text-primary">
                    {tag}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* SEO Score Range */}
          <div className="space-y-2">
            <Label>SEO Score Range</Label>
            <div className="px-2">
              <Slider
                value={filters.seoScoreRange || [0, 100]}
                onValueChange={(value) => setFilters(prev => ({ ...prev, seoScoreRange: value as [number, number] }))}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>{filters.seoScoreRange?.[0] || 0}</span>
                <span>{filters.seoScoreRange?.[1] || 100}</span>
              </div>
            </div>
          </div>

          {/* Word Count Range */}
          <div className="space-y-2">
            <Label>Word Count Range</Label>
            <div className="px-2">
              <Slider
                value={filters.wordCountRange || [0, 5000]}
                onValueChange={(value) => setFilters(prev => ({ ...prev, wordCountRange: value as [number, number] }))}
                max={5000}
                min={0}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>{filters.wordCountRange?.[0] || 0} words</span>
                <span>{filters.wordCountRange?.[1] || 5000} words</span>
              </div>
            </div>
          </div>
        </motion.div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClearFilters}>
            Clear All
          </Button>
          <Button onClick={handleApplyFilters} className="bg-gradient-to-r from-primary to-neon-blue">
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};