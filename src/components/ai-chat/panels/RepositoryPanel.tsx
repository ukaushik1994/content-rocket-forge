import React, { useState, useEffect, useMemo } from 'react';
import { PanelShell } from './PanelShell';
import { ContentProvider, useContent } from '@/contexts/content';
import { ContentItemType } from '@/contexts/content/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, Search, ArrowLeft, ExternalLink, 
  Database, BookOpen, Mail, Share2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const typeIcon: Record<string, React.ElementType> = {
  blog: BookOpen,
  article: FileText,
  email: Mail,
  social_post: Share2,
};

const statusColor: Record<string, string> = {
  published: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20',
  draft: 'bg-muted text-muted-foreground border-border/30',
  archived: 'bg-amber-500/15 text-amber-500 border-amber-500/20',
};

const RepositoryPanelInner: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { contentItems, loading } = useContent();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<ContentItemType | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return contentItems.slice(0, 20);
    const q = search.toLowerCase();
    return contentItems.filter(c => 
      c.title?.toLowerCase().includes(q) || 
      c.content_type?.toLowerCase().includes(q) ||
      c.keywords?.some(k => k.toLowerCase().includes(q))
    ).slice(0, 20);
  }, [contentItems, search]);

  // Reader view for selected item
  if (selectedItem) {
    return (
      <PanelShell isOpen={isOpen} onClose={onClose} title="Repository" icon={<FileText className="h-4 w-4" />}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setSelectedItem(null)} className="text-muted-foreground">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { onClose(); navigate('/repository'); }}
              className="text-xs"
            >
              Open Repository <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn('text-[10px]', statusColor[selectedItem.status])}>
                {selectedItem.status}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {selectedItem.content_type}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold text-foreground leading-tight">{selectedItem.title}</h3>
            {selectedItem.meta_description && (
              <p className="text-sm text-muted-foreground">{selectedItem.meta_description}</p>
            )}
          </div>

          <div className="border-t border-border/10 pt-4">
            <div 
              className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: selectedItem.content || '<p class="text-muted-foreground">No content body available.</p>' }}
            />
          </div>
        </div>
      </PanelShell>
    );
  }

  return (
    <PanelShell isOpen={isOpen} onClose={onClose} title="Repository" icon={<FileText className="h-4 w-4" />}>
      <div className="space-y-4">
        {/* Top bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-9 pl-8 text-sm bg-muted/30 border-border/20"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { onClose(); navigate('/repository'); }}
            className="text-xs shrink-0"
          >
            Open Page <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Database className="h-8 w-8 mb-3 opacity-40" />
            <p className="text-sm">No content found</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map(item => {
              const Icon = typeIcon[item.content_type] || FileText;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={cn(
                    "w-full text-left px-3 py-3 rounded-lg",
                    "hover:bg-muted/40 transition-colors",
                    "border border-transparent hover:border-border/20",
                    "group"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-md bg-muted/30">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', statusColor[item.status])}>
                          {item.status}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </PanelShell>
  );
};

export const RepositoryPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = (props) => (
  <ContentProvider>
    <RepositoryPanelInner {...props} />
  </ContentProvider>
);
