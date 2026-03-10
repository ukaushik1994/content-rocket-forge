import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Key, Users, Megaphone, MessageCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlobalSearchResultsProps {
  searchTerm: string;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  title: string;
  category: 'content' | 'keywords' | 'contacts' | 'campaigns';
  route: string;
}

const categoryConfig = {
  content: { icon: FileText, label: 'Content', route: '/repository', color: 'text-blue-400' },
  keywords: { icon: Key, label: 'Keywords', route: '/keywords', color: 'text-amber-400' },
  contacts: { icon: Users, label: 'Contacts', route: '/engage/contacts', color: 'text-emerald-400' },
  campaigns: { icon: Megaphone, label: 'Campaigns', route: '/campaigns', color: 'text-purple-400' },
};

export const GlobalSearchResults: React.FC<GlobalSearchResultsProps> = ({ searchTerm, onClose }) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || searchTerm.length < 2) { setResults([]); return; }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const term = `%${searchTerm}%`;
        const [content, keywords, contacts, campaigns] = await Promise.all([
          supabase.from('content_items').select('id, title').eq('user_id', user.id).ilike('title', term).limit(5),
          supabase.from('keyword_library' as any).select('id, keyword').eq('user_id', user.id).ilike('keyword', term).limit(5),
          supabase.from('engage_contacts').select('id, first_name, last_name, email').or(`first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term}`).limit(5),
          supabase.from('campaigns').select('id, name').eq('user_id', user.id).ilike('name', term).limit(5),
        ]);

        const keywordsData = keywords.data as any[] || [];
        const mapped: SearchResult[] = [
          ...(content.data || []).map((i: any) => ({ id: i.id, title: i.title || 'Untitled', category: 'content' as const, route: '/repository' })),
          ...keywordsData.map((i: any) => ({ id: i.id, title: i.keyword, category: 'keywords' as const, route: '/keywords' })),
          ...(contacts.data || []).map(i => ({ id: i.id, title: `${i.first_name || ''} ${i.last_name || ''}`.trim() || i.email || 'Unknown', category: 'contacts' as const, route: '/engage/contacts' })),
          ...(campaigns.data || []).map(i => ({ id: i.id, title: i.name, category: 'campaigns' as const, route: '/campaigns' })),
        ];
        setResults(mapped);
      } catch (e) {
        console.error('Global search error:', e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, user]);

  if (searchTerm.length < 2) return null;

  const grouped = Object.entries(categoryConfig).map(([key, config]) => ({
    key,
    config,
    items: results.filter(r => r.category === key),
  })).filter(g => g.items.length > 0);

  return (
    <div className="mx-1 mb-2 rounded-lg border border-border/20 bg-background/95 backdrop-blur-xl overflow-hidden shadow-xl">
      {loading ? (
        <div className="flex items-center justify-center py-4 gap-2 text-muted-foreground text-xs">
          <Loader2 className="h-3 w-3 animate-spin" /> Searching...
        </div>
      ) : grouped.length === 0 ? (
        <div className="py-4 text-center text-xs text-muted-foreground">No results found</div>
      ) : (
        grouped.map(({ key, config, items }) => (
          <div key={key}>
            <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 bg-accent/20">
              {config.label}
            </div>
            {items.map(item => {
              const Icon = config.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { navigate(item.route); onClose(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-accent/40 transition-colors text-left"
                >
                  <Icon className={cn('h-3.5 w-3.5 flex-shrink-0', config.color)} />
                  <span className="truncate">{item.title}</span>
                </button>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
};
