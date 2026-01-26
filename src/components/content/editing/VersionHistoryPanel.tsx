import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  History, 
  RotateCcw, 
  Eye,
  Clock,
  ChevronRight,
  GitBranch
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface VersionEntry {
  id: string;
  content: string;
  action: string;
  change_summary?: string;
  timestamp: string;
}

interface VersionHistoryPanelProps {
  contentId: string;
  currentContent: string;
  onRestore: (content: string) => void;
  onPreview?: (content: string) => void;
  className?: string;
}

export const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({
  contentId,
  currentContent,
  onRestore,
  onPreview,
  className
}) => {
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  // Load version history
  useEffect(() => {
    const loadVersions = async () => {
      if (!contentId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('content_activity_log')
          .select('id, content_snapshot, action, change_summary, timestamp')
          .eq('content_id', contentId)
          .order('timestamp', { ascending: false })
          .limit(20);

        if (error) throw error;

        const parsedVersions: VersionEntry[] = (data || [])
          .filter(entry => entry.content_snapshot)
          .map(entry => ({
            id: entry.id,
            content: (entry.content_snapshot as { content?: string })?.content || '',
            action: entry.action,
            change_summary: entry.change_summary || undefined,
            timestamp: entry.timestamp
          }));

        setVersions(parsedVersions);
      } catch (error) {
        console.error('[VersionHistoryPanel] Load error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVersions();
  }, [contentId]);

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'create': 'Created',
      'update': 'Updated',
      'regenerate': 'Regenerated',
      'improve': 'AI Improved',
      'expand': 'Expanded',
      'compress': 'Compressed',
      'tone_change': 'Tone Changed',
      'edit': 'Manual Edit',
      'auto_save': 'Auto-saved'
    };
    return labels[action] || action;
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      'create': 'bg-emerald-500/10 text-emerald-500',
      'regenerate': 'bg-purple-500/10 text-purple-500',
      'improve': 'bg-blue-500/10 text-blue-500',
      'expand': 'bg-amber-500/10 text-amber-500',
      'compress': 'bg-pink-500/10 text-pink-500'
    };
    return colors[action] || 'bg-muted text-muted-foreground';
  };

  const handlePreview = (version: VersionEntry) => {
    setPreviewingId(previewingId === version.id ? null : version.id);
    if (previewingId !== version.id) {
      onPreview?.(version.content);
    }
  };

  const handleRestore = async (version: VersionEntry) => {
    onRestore(version.content);
    
    // Log the restore action
    try {
      await supabase.from('content_activity_log').insert({
        content_id: contentId,
        action: 'restore',
        change_summary: `Restored to version from ${formatDistanceToNow(new Date(version.timestamp))} ago`,
        content_snapshot: { content: currentContent }, // Save current before restore
        content_type: 'content',
        user_id: (await supabase.auth.getUser()).data.user?.id
      });
    } catch (error) {
      console.error('[VersionHistoryPanel] Failed to log restore:', error);
    }
  };

  return (
    <Card className={cn("border-border/50 bg-card/80 backdrop-blur-sm", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Version History</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {versions.length} versions
        </Badge>
      </div>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground text-sm">Loading history...</div>
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No version history yet</p>
            <p className="text-xs mt-1">Changes will appear here</p>
          </div>
        ) : (
          <ScrollArea className="h-72">
            <div className="p-2 space-y-1">
              <AnimatePresence>
                {versions.map((version, index) => (
                  <motion.div
                    key={version.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "relative pl-4 border-l-2",
                      previewingId === version.id ? "border-primary" : "border-border/50"
                    )}
                  >
                    {/* Timeline dot */}
                    <div className={cn(
                      "absolute left-[-5px] top-3 w-2 h-2 rounded-full",
                      previewingId === version.id ? "bg-primary" : "bg-border"
                    )} />
                    
                    <div className={cn(
                      "p-2 rounded-md transition-colors",
                      "hover:bg-muted/50",
                      previewingId === version.id && "bg-muted/80"
                    )}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className={cn("text-xs px-1.5 py-0", getActionColor(version.action))}>
                              {getActionLabel(version.action)}
                            </Badge>
                            {index === 0 && (
                              <Badge variant="outline" className="text-xs px-1.5 py-0">
                                Latest
                              </Badge>
                            )}
                          </div>
                          
                          {version.change_summary && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {version.change_summary}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(version.timestamp))} ago
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handlePreview(version)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {index > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:text-primary"
                              onClick={() => handleRestore(version)}
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Preview expansion */}
                      <AnimatePresence>
                        {previewingId === version.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 p-2 rounded bg-muted/50 text-xs max-h-32 overflow-y-auto">
                              <pre className="whitespace-pre-wrap font-mono text-[10px] leading-relaxed">
                                {version.content.slice(0, 500)}
                                {version.content.length > 500 && '...'}
                              </pre>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-2 h-7 text-xs"
                              onClick={() => handleRestore(version)}
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Restore this version
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
