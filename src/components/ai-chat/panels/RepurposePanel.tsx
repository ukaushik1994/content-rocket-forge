import React, { useState, useCallback } from 'react';
import { PanelShell } from './PanelShell';
import { Repeat2, Loader2, CheckCircle2, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { ContentProvider, useContent } from '@/contexts/content';
import { ContentItemType } from '@/contexts/content/types';
import { contentFormats, ContentFormat } from '@/components/content-repurposing/formats';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { SafeMarkdown } from '@/components/ui/SafeMarkdown';

interface RepurposePanelInnerProps {
  isOpen: boolean;
  onClose: () => void;
  contentId?: string | null;
}

const RepurposePanelInner: React.FC<RepurposePanelInnerProps> = ({ isOpen, onClose, contentId }) => {
  const { contentItems } = useContent();
  const { user } = useAuth();
  const [selectedContent, setSelectedContent] = useState<ContentItemType | null>(null);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContents, setGeneratedContents] = useState<Record<string, string>>({});
  const [activeFormat, setActiveFormat] = useState<string | null>(null);

  // Auto-select content if contentId provided
  React.useEffect(() => {
    if (contentId && contentItems.length > 0) {
      const found = contentItems.find(c => c.id === contentId);
      if (found) setSelectedContent(found);
    }
  }, [contentId, contentItems]);

  const toggleFormat = (formatId: string) => {
    setSelectedFormats(prev =>
      prev.includes(formatId) ? prev.filter(f => f !== formatId) : [...prev, formatId]
    );
  };

  const handleGenerate = useCallback(async () => {
    if (!selectedContent || selectedFormats.length === 0 || !user) return;
    setIsGenerating(true);

    try {
      const sourceContent = selectedContent.content || '';
      const results: Record<string, string> = {};

      for (const formatId of selectedFormats) {
        const format = contentFormats.find(f => f.id === formatId);
        if (!format) continue;

        const { data, error } = await supabase.functions.invoke('enhanced-ai-chat', {
          body: {
            message: `Repurpose the following content into a ${format.name}. Keep the core message but adapt the format, tone, and length appropriately for ${format.name}.\n\nSource content:\n${sourceContent.substring(0, 3000)}`,
            conversationId: null,
            skipSave: true,
          },
        });

        if (error) throw error;
        results[formatId] = data?.message || data?.content || 'Generation failed';
      }

      setGeneratedContents(results);
      setActiveFormat(selectedFormats[0]);
      toast.success(`Generated ${selectedFormats.length} format${selectedFormats.length > 1 ? 's' : ''}`);
    } catch (err) {
      console.error('Repurpose error:', err);
      toast.error('Failed to generate repurposed content');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedContent, selectedFormats, user]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const downloadAsText = (text: string, formatName: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedContent?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'content'}_${formatName.toLowerCase().replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded');
  };

  // Step 1: Content selection
  if (!selectedContent) {
    return (
      <PanelShell isOpen={isOpen} onClose={onClose} title="Repurpose Content" icon={<Repeat2 className="h-4 w-4" />}>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Select content to repurpose:</p>
          {contentItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No content available. Create content first.</p>
          ) : (
            <div className="space-y-2">
              {contentItems.slice(0, 20).map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedContent(item)}
                  className="w-full text-left p-3 rounded-lg border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-colors"
                >
                  <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {item.content?.substring(0, 120)}...
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </PanelShell>
    );
  }

  // Step 3: Show generated results
  if (Object.keys(generatedContents).length > 0 && activeFormat) {
    const activeContent = generatedContents[activeFormat] || '';
    const activeFormatInfo = contentFormats.find(f => f.id === activeFormat);

    return (
      <PanelShell isOpen={isOpen} onClose={onClose} title="Repurposed Content" icon={<CheckCircle2 className="h-4 w-4" />}>
        <div className="space-y-4">
          {/* Format tabs */}
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(generatedContents).map(fId => {
              const fmt = contentFormats.find(f => f.id === fId);
              return (
                <button
                  key={fId}
                  onClick={() => setActiveFormat(fId)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border',
                    fId === activeFormat
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'border-border/30 text-muted-foreground hover:border-primary/20'
                  )}
                >
                  {fmt && <fmt.icon className="w-3 h-3" />}
                  {fmt?.name || fId}
                </button>
              );
            })}
          </div>

          {/* Content display */}
          <Card className="border-border/20">
            <CardContent className="p-4">
              <div className="prose prose-sm max-w-none text-foreground text-sm">
                <SafeMarkdown content={activeContent} />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => copyToClipboard(activeContent)}>
              <Copy className="w-3 h-3 mr-1.5" /> Copy
            </Button>
            <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => downloadAsText(activeContent, activeFormatInfo?.name || 'content')}>
              <Download className="w-3 h-3 mr-1.5" /> Download
            </Button>
          </div>

          {/* Start over */}
          <Button size="sm" variant="ghost" className="w-full text-xs" onClick={() => {
            setGeneratedContents({});
            setActiveFormat(null);
            setSelectedFormats([]);
            setSelectedContent(null);
          }}>
            Repurpose another
          </Button>
        </div>
      </PanelShell>
    );
  }

  // Step 2: Format selection + generate
  return (
    <PanelShell isOpen={isOpen} onClose={onClose} title="Repurpose Content" icon={<Repeat2 className="h-4 w-4" />}>
      <div className="space-y-4">
        {/* Source content info */}
        <div className="p-3 rounded-lg border border-border/20 bg-muted/20">
          <p className="text-xs font-medium text-foreground truncate">{selectedContent.title}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {selectedContent.content?.split(/\s+/).length || 0} words
          </p>
          <button onClick={() => setSelectedContent(null)} className="text-[10px] text-primary hover:underline mt-1">
            Change source
          </button>
        </div>

        {/* Format grid */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-foreground">Select formats</p>
            <button
              onClick={() => setSelectedFormats(
                selectedFormats.length === contentFormats.length ? [] : contentFormats.map(f => f.id)
              )}
              className="text-[10px] text-primary hover:underline"
            >
              {selectedFormats.length === contentFormats.length ? 'Deselect all' : 'Select all'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {contentFormats.map(format => (
              <button
                key={format.id}
                onClick={() => toggleFormat(format.id)}
                className={cn(
                  'flex items-center gap-2 p-2.5 rounded-lg border text-left transition-colors',
                  selectedFormats.includes(format.id)
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border/30 hover:border-primary/20'
                )}
              >
                <format.icon className={cn(
                  'w-4 h-4 flex-shrink-0',
                  selectedFormats.includes(format.id) ? 'text-primary' : 'text-muted-foreground'
                )} />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{format.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <Button
          onClick={handleGenerate}
          disabled={selectedFormats.length === 0 || isGenerating}
          className="w-full"
          size="sm"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              Generating {selectedFormats.length} format{selectedFormats.length > 1 ? 's' : ''}...
            </>
          ) : (
            <>
              <Repeat2 className="w-3.5 h-3.5 mr-1.5" />
              Generate {selectedFormats.length} format{selectedFormats.length > 1 ? 's' : ''}
            </>
          )}
        </Button>
      </div>
    </PanelShell>
  );
};

export const RepurposePanel: React.FC<{ isOpen: boolean; onClose: () => void; contentId?: string | null }> = (props) => (
  <ContentProvider>
    <RepurposePanelInner {...props} />
  </ContentProvider>
);
