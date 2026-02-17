import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { EngageButton } from '../../shared/EngageButton';
import { EngageDialogHeader } from '../../shared/EngageDialogHeader';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIEmailWriterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: (html: string) => void;
  existingHtml?: string;
}

export const AIEmailWriterDialog = ({ open, onOpenChange, onGenerated, existingHtml }: AIEmailWriterDialogProps) => {
  const [mode, setMode] = useState<'generate' | 'improve'>('generate');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professional');
  const [cta, setCta] = useState('');
  const [length, setLength] = useState('medium');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('engage-ai-writer', {
        body: {
          use_case: mode === 'improve' ? 'improve_email' : 'email_body',
          topic,
          tone,
          cta,
          length,
          body_html: existingHtml || '',
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const html = data?.result?.content || data?.result || '';
      if (html) {
        onGenerated(typeof html === 'string' ? html : JSON.stringify(html));
        onOpenChange(false);
        toast.success('Email content generated!');
      } else {
        toast.error('No content generated');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <EngageDialogHeader
          icon={Sparkles}
          title="AI Email Writer"
          gradientFrom="from-violet-400"
          gradientTo="to-purple-400"
          iconColor="text-violet-400"
        />
        <div className="space-y-4">
          {existingHtml && (
            <div className="flex gap-2">
              {(['generate', 'improve'] as const).map(m => (
                <EngageButton
                  key={m}
                  variant={mode === m ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode(m)}
                >
                  {m === 'generate' ? 'Write New' : 'Improve Existing'}
                </EngageButton>
              ))}
            </div>
          )}

          {mode === 'generate' && (
            <>
              <div>
                <Label>Topic / Brief *</Label>
                <Textarea
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g., Welcome new subscribers to our newsletter, announce spring sale..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="inspirational">Inspirational</SelectItem>
                      <SelectItem value="humorous">Humorous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Length</Label>
                  <Select value={length} onValueChange={setLength}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (1-2 paragraphs)</SelectItem>
                      <SelectItem value="medium">Medium (3-4 paragraphs)</SelectItem>
                      <SelectItem value="long">Long (5+ paragraphs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Call to Action (optional)</Label>
                <Input value={cta} onChange={e => setCta(e.target.value)} placeholder="e.g., Shop now, Sign up, Learn more" />
              </div>
            </>
          )}

          {mode === 'improve' && (
            <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
              <p className="text-xs text-muted-foreground mb-1">Current email will be improved</p>
              <div className="text-xs text-foreground max-h-24 overflow-y-auto font-mono">
                {(existingHtml || '').replace(/<[^>]*>/g, '').substring(0, 200)}...
              </div>
              <div className="mt-2">
                <Label>Desired tone adjustment</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">More professional</SelectItem>
                    <SelectItem value="friendly">More friendly</SelectItem>
                    <SelectItem value="concise">More concise</SelectItem>
                    <SelectItem value="persuasive">More persuasive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <EngageButton
            onClick={handleGenerate}
            disabled={loading || (mode === 'generate' && !topic)}
            className="w-full"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> {mode === 'improve' ? 'Improve Email' : 'Generate Email'}</>
            )}
          </EngageButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};
