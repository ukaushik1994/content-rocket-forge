import React, { useState, useMemo, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { KeywordsHero } from '@/components/keywords/KeywordsHero';
import { KeywordsFilters } from '@/components/keywords/KeywordsFilters';
import { KeywordCard } from '@/components/keywords/KeywordCard';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { keywordLibraryService } from '@/services/keywordLibraryService';
import { Database } from 'lucide-react';
import { toast } from 'sonner';

const KeywordsPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('usage_count');
  const [searchQuery, setSearchQuery] = useState('');
  const [keywords, setKeywords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const canonicalUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/keywords` 
    : '/keywords';

  // Calculate statistics
  const keywordStats = useMemo(() => {
    const total = keywords.length;
    const inPublished = keywords.filter(k => 
      k.content_pieces?.some((p: any) => p.status === 'published')
    ).length;
    const inDraft = keywords.filter(k => 
      k.content_pieces?.some((p: any) => p.status === 'draft')
    ).length;
    const cannibalization = keywords.filter(k => 
      k.content_pieces?.filter((p: any) => p.status === 'published').length > 1
    ).length;
    
    return { total, inPublished, inDraft, cannibalization };
  }, [keywords]);

  // Load keywords
  useEffect(() => {
    loadKeywords();
  }, []);

  const loadKeywords = async () => {
    try {
      setLoading(true);
      const result = await keywordLibraryService.getKeywords({}, 1, 100);
      setKeywords(result.keywords);
    } catch (error) {
      console.error('Error loading keywords:', error);
      toast.error('Failed to load keywords');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort keywords
  const filteredAndSortedKeywords = useMemo(() => {
    let filtered = keywords.filter(keyword => {
      // Apply search filter
      const matchesSearch = searchQuery === '' || 
        keyword.keyword.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Apply status filter
      let matchesStatus = true;
      if (statusFilter === 'published') {
        matchesStatus = keyword.content_pieces?.some((p: any) => p.status === 'published');
      } else if (statusFilter === 'draft') {
        matchesStatus = keyword.content_pieces?.some((p: any) => p.status === 'draft');
      } else if (statusFilter === 'cannibalization') {
        matchesStatus = keyword.content_pieces?.filter((p: any) => p.status === 'published').length > 1;
      }
      
      return matchesSearch && matchesStatus;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.keyword.localeCompare(b.keyword);
      }
      if (sortBy === 'recently_added') {
        return new Date(b.first_used || 0).getTime() - new Date(a.first_used || 0).getTime();
      }
      if (sortBy === 'cannibalization') {
        const aCannibal = a.content_pieces?.filter((p: any) => p.status === 'published').length || 0;
        const bCannibal = b.content_pieces?.filter((p: any) => p.status === 'published').length || 0;
        return bCannibal - aCannibal;
      }
      // Default: usage_count
      return (b.usage_count || 0) - (a.usage_count || 0);
    });

    return filtered;
  }, [keywords, searchQuery, statusFilter, sortBy]);

  return (
    <div className="min-h-screen w-full bg-background relative overflow-hidden">
      <Helmet>
        <title>Keywords — Keyword Repository & Management</title>
        <meta name="description" content="Manage your keyword library with comprehensive metrics, track keyword usage across content, and identify cannibalization issues." />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      
      <Navbar />
      
      {/* Animated Background */}
      <AnimatedBackground intensity="medium" />
      
      {/* Spacing for fixed navbar */}
      <div className="pt-16">
        {/* Hero Section */}
        <KeywordsHero
        keywordStats={keywordStats}
        onQuickFilter={setStatusFilter}
        activeFilter={statusFilter}
      />

      {/* Content Management Section */}
      <div className="relative z-10 px-6 pb-12">
        {/* Filters */}
        <KeywordsFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onRefresh={loadKeywords}
        />

        {/* Keywords Grid/List */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            // Loading State
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </Card>
              ))}
            </div>
          ) : filteredAndSortedKeywords.length === 0 ? (
            // Empty State
            <motion.div
              className="text-center py-24"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="max-w-md mx-auto bg-background/60 backdrop-blur-xl border-border/50">
                <div className="p-12">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Database className="h-8 w-8 text-primary/50" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    {searchQuery || statusFilter !== 'all' ? 'No keywords found' : 'No keywords in your content yet'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filters' 
                      : 'Start creating content and adding keywords to build your repository'}
                  </p>
                </div>
              </Card>
            </motion.div>
          ) : (
            // Keywords Grid/List
            <motion.div
              className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
              }
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {filteredAndSortedKeywords.map((keyword, index) => (
                <motion.div
                  key={keyword.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <KeywordCard keyword={keyword} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default KeywordsPage;