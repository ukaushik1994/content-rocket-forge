import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { EngageButton } from '../../shared/EngageButton';
import { EngageDialogHeader } from '../../shared/EngageDialogHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { Sparkles, Loader2, Check, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface AISubjectLineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (subject: string) => void;
  subject?: string;
  bodyHtml?: string;
}

const confidenceColors: Record<string, string> = {
  high: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  low: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export const AISubjectLineDialog = ({ open, onOpenChange, onSelect, subject, bodyHtml }: AISubjectLineDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ subject: string; confidence: string; reason: string }>>([]);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('engage-ai-writer', {
        body: {
          use_case: 'subject_lines',
          subject: subject || '',
          body_html: bodyHtml || '',
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const result = data?.result;
      if (Array.isArray(result)) {
        setSuggestions(result);
      } else if (result?.content) {
        toast.error('Could not parse suggestions');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (s: string) => {
    onSelect(s);
    onOpenChange(false);
    toast.success('Subject line applied');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <EngageDialogHeader
          icon={BarChart3}
          title="AI Subject Lines"
          gradientFrom="from-cyan-400"
          gradientTo="to-blue-400"
          iconColor="text-cyan-400"
        />
        <div className="space-y-4">
          {suggestions.length === 0 ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-sm text-muted-foreground">
                AI will generate 5 subject line variations with predicted engagement levels
              </p>
              <EngageButton onClick={generate} disabled={loading} className="mx-auto">
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" /> Generate Subject Lines</>
                )}
              </EngageButton>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {suggestions.map((s, i) => (
                  <GlassCard
                    key={i}
                    className="p-3 cursor-pointer hover:border-primary/30 hover:scale-[1.01] transition-all duration-200"
                    onClick={() => handleSelect(s.subject)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{s.subject}</p>
                        <p className="text-xs text-muted-foreground mt-1">{s.reason}</p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] shrink-0 ${confidenceColors[s.confidence] || ''}`}>
                        {s.confidence}
                      </Badge>
                    </div>
                  </GlassCard>
                ))}
              </div>
              <div className="flex gap-2">
                <EngageButton variant="outline" size="sm" onClick={generate} disabled={loading} className="flex-1">
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Regenerate'}
                </EngageButton>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
