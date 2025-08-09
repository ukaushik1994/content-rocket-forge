import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sparkles, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApproval } from '@/components/approval/context/ApprovalContext';
import { ContentItemType } from '@/contexts/content/types';
import { toast } from 'sonner';

interface TitleSidebarTileProps {
  content: ContentItemType;
  value: string;
  onChange: (value: string) => void;
  mainKeyword?: string;
}

export const TitleSidebarTile: React.FC<TitleSidebarTileProps> = ({ content, value, onChange, mainKeyword }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { generateTitleSuggestions } = useApproval();

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const list = await generateTitleSuggestions(content);
      setSuggestions(list);
    } catch (e) {
      toast.error('Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  };

  const keywordIncluded = mainKeyword ? value.toLowerCase().includes(mainKeyword.toLowerCase()) : null;

  return (
    <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Title</div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="AI title suggestions">
                <Sparkles className="h-4 w-4 text-neon-purple" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Suggestions</div>
                <Button size="icon" variant="ghost" onClick={fetchSuggestions} aria-label="Refresh suggestions">
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {loading ? (
                  <div className="text-xs text-muted-foreground">Generating...</div>
                ) : suggestions.length === 0 ? (
                  <div className="text-xs text-muted-foreground">Click refresh to generate ideas</div>
                ) : (
                  suggestions.slice(0, 8).map((s, i) => (
                    <button
                      key={i}
                      className="block w-full text-left text-sm p-2 rounded-md hover:bg-accent"
                      onClick={() => {
                        const prev = value;
                        onChange(s);
                        setOpen(false);
                        toast.success('Title applied', {
                          action: { label: 'Undo', onClick: () => onChange(prev) },
                          duration: 5000
                        });
                      }}
                    >
                      {s}
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-xs text-white/70">({value.length}/60)</label>
          {mainKeyword && (
            <div className={`text-[10px] ${keywordIncluded ? 'text-green-400' : 'text-amber-400'}`}>
              {keywordIncluded ? (
                <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Keyword included</span>
              ) : (
                <span className="inline-flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Add keyword</span>
              )}
            </div>
          )}
        </div>

        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={60}
          className="bg-white/5 border-white/10"
          placeholder="Content title..."
        />
      </CardContent>
    </Card>
  );
};
