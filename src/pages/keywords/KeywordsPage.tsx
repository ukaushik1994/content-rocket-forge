import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { PageContainer } from '@/components/ui/PageContainer';
import { PageBreadcrumb } from '@/components/shared/PageBreadcrumb';
import { UnifiedEmptyState } from '@/components/ui/UnifiedEmptyState';
import { KeywordsHero } from '@/components/keywords/KeywordsHero';
import { KeywordsFilters } from '@/components/keywords/KeywordsFilters';
import { KeywordListItem } from '@/components/keywords/KeywordListItem';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { keywordLibraryService } from '@/services/keywordLibraryService';
import { Database } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const PAGE_SIZE = 20;

const KeywordsPage = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('usage_count');
  const [searchQuery, setSearchQuery] = useState('');
  const [keywords, setKeywords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const canonicalUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/keywords` 
    : '/keywords';

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

  useEffect(() => {
    loadKeywords();
  }, []);

  const loadKeywords = async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const result = await keywordLibraryService.getKeywords({}, 1, PAGE_SIZE);
      setKeywords(result.keywords);
      setHasMore(result.keywords.length === PAGE_SIZE);
      setPage(1);
    } catch (error) {
      console.error('Error loading keywords:', error);
      setLoadError(true);
      toast.error('Failed to load keywords');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreKeywords = async () => {
    try {
      const nextPage = page + 1;
      const result = await keywordLibraryService.getKeywords({}, nextPage, PAGE_SIZE);
      setKeywords(prev => [...prev, ...result.keywords]);
      setHasMore(result.keywords.length === PAGE_SIZE);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more keywords:', error);
    }
  };

  const handleBackfillKeywords = async () => {
    try {
      setLoading(true);
      const toastId = toast.loading('Syncing all keywords...');
      
      const { data: proposalData, error: proposalError } = await supabase.functions.invoke('backfill-proposal-keywords');
      if (proposalError) throw new Error(`Proposals: ${proposalError.message}`);
      
      const { data: contentData, error: contentError } = await supabase.functions.invoke('sync-content-keywords');
      if (contentError) throw new Error(`Content: ${contentError.message}`);
      
      const totalSaved = (proposalData?.stats?.keywords_saved || 0) + (contentData?.stats?.keywords_saved || 0);
      
      toast.success(`All keywords synced! ${totalSaved} keywords saved.`, { id: toastId });
      await loadKeywords();
    } catch (error) {
      console.error('Backfill error:', error);
      toast.error(`Failed to sync: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedKeywords = useMemo(() => {
    let filtered = keywords.filter(keyword => {
      const matchesSearch = searchQuery === '' || 
        keyword.keyword.toLowerCase().includes(searchQuery.toLowerCase());
      
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
      return (b.usage_count || 0) - (a.usage_count || 0);
    });

    return filtered;
  }, [keywords, searchQuery, statusFilter, sortBy]);

  return (
    <PageContainer className="relative overflow-hidden">
      <Helmet>
        <title>Keywords | Creaiter</title>
        <meta name="description" content="Manage your keyword library with comprehensive metrics, track keyword usage across content, and identify cannibalization issues." />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      
      <AnimatedBackground intensity="medium" />
      
      <div className="pt-16">
        <div className="px-6">
          <PageBreadcrumb section="Tools" page="Keywords" />
        </div>
        <KeywordsHero
          keywordStats={keywordStats}
          onQuickFilter={setStatusFilter}
          activeFilter={statusFilter}
        />

        <div className="relative z-10 px-6 pb-12">
          <KeywordsFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onRefresh={loadKeywords}
            onBackfillKeywords={handleBackfillKeywords}
          />

          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </Card>
                ))}
              </div>
            ) : loadError ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Database className="h-10 w-10 text-destructive/40 mb-3" />
                <h3 className="text-lg font-medium text-foreground/80 mb-1">Failed to load keywords</h3>
                <p className="text-sm text-muted-foreground mb-4">Something went wrong. Please try again.</p>
                <Button variant="outline" size="sm" onClick={loadKeywords}>
                  Retry
                </Button>
              </div>
            ) : filteredAndSortedKeywords.length === 0 ? (
              <UnifiedEmptyState
                icon={Database}
                title={searchQuery || statusFilter !== 'all' ? 'No keywords found' : 'No keywords in your content yet'}
                description={searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Start creating content and adding keywords to build your repository'}
                actionLabel={!(searchQuery || statusFilter !== 'all') ? 'Sync Keywords' : undefined}
                onAction={!(searchQuery || statusFilter !== 'all') ? handleBackfillKeywords : undefined}
              />
            ) : (
              <motion.div
                className="space-y-3"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05 }
                  }
                }}
                initial="hidden"
                animate="show"
              >
                {filteredAndSortedKeywords.map((keyword) => (
                  <KeywordListItem key={keyword.id} keyword={keyword} />
                ))}
              </motion.div>
            )}
            {hasMore && !loading && filteredAndSortedKeywords.length > 0 && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={loadMoreKeywords}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-6 py-2.5 rounded-lg border border-border/50 hover:border-border bg-card/50 hover:bg-card"
                >
                  Load more ({keywords.length} loaded)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default KeywordsPage;
