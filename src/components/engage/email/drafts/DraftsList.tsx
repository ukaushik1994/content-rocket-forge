import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export const DraftsList = () => {
  const { currentWorkspaceId } = useWorkspace();

  const { data: drafts = [], isLoading } = useQuery({
    queryKey: ['draft-campaigns', currentWorkspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*, email_templates(name)')
        .eq('workspace_id', currentWorkspaceId!)
        .eq('status', 'draft')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{drafts.length} drafts</p>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
      ) : drafts.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <FileText className="h-8 w-8 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">No drafts</p>
        </div>
      ) : (
        <div className="space-y-2">
          {drafts.map((d: any, i: number) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <GlassCard className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{d.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {d.email_templates?.name && (
                        <Badge variant="secondary" className="text-[10px] h-4">Template: {d.email_templates.name}</Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        Updated {format(new Date(d.updated_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">Draft</Badge>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
