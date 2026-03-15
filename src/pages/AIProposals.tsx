import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageBreadcrumb } from '@/components/shared/PageBreadcrumb';
import { EnhancedAIProposalCard } from '@/components/research/content-strategy/components/EnhancedAIProposalCard';
import { ProposalStatusFilter } from '@/components/research/content-strategy/ProposalStatusFilter';
import { type ProposalStatus } from '@/services/proposalStatusService';
import { Sparkles, Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const AIProposals = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedStatuses, setSelectedStatuses] = useState<ProposalStatus[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['ai-proposals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('ai_strategy_proposals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const statusCounts = useMemo(() => {
    const counts: Record<ProposalStatus, number> = {
      available: 0, scheduled: 0, in_progress: 0, completed: 0, archived: 0,
    };
    proposals.forEach((p: any) => {
      const s = (p.status || 'available') as ProposalStatus;
      if (s in counts) counts[s]++;
    });
    return counts;
  }, [proposals]);

  const filtered = useMemo(() => {
    let result = proposals;
    if (selectedStatuses.length > 0) {
      result = result.filter((p: any) => selectedStatuses.includes((p.status || 'available') as ProposalStatus));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p: any) =>
        p.title?.toLowerCase().includes(q) ||
        p.primary_keyword?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [proposals, selectedStatuses, searchQuery]);

  const handleStatusToggle = (status: ProposalStatus) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
      <PageBreadcrumb section="Library" page="AI Proposals" sectionPath="/repository" />

      {/* Hero header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Proposals</h1>
            <p className="text-sm text-muted-foreground">
              {proposals.length} proposal{proposals.length !== 1 ? 's' : ''} generated
            </p>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search proposals by title, keyword, or description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/60 backdrop-blur-sm border-border/50"
          />
        </div>
        <ProposalStatusFilter
          statusCounts={statusCounts}
          selectedStatuses={selectedStatuses}
          onStatusToggle={handleStatusToggle}
          onClearFilters={() => setSelectedStatuses([])}
        />
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium mb-1">No proposals found</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {proposals.length === 0
              ? 'Generate your first proposals from Content Strategy or AI Chat.'
              : 'Try adjusting your filters or search query.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((proposal: any, index: number) => (
            <motion.div
              key={proposal.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <EnhancedAIProposalCard
                proposal={proposal}
                showActions={true}
                onViewDetails={() => navigate('/ai-chat')}
                onScheduleToCalendar={() => navigate('/research/content-strategy')}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIProposals;
