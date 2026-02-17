import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EngageButton } from '../shared/EngageButton';
import { EngageDialogHeader } from '../shared/EngageDialogHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { Sparkles, Loader2, Twitter, Linkedin, Instagram, Facebook, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AISocialWriterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (content: string, platform: string) => void;
}

const platforms = [
  { id: 'twitter', label: 'X / Twitter', icon: Twitter, color: 'text-blue-400' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-500' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-400' },
  { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
];

export const AISocialWriterDialog = ({ open, onOpenChange, onInsert }: AISocialWriterDialogProps) => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('engaging');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, any> | null>(null);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('engage-ai-social', {
        body: { use_case: 'generate_posts', topic, tone },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      setResults(data?.result || null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = (platform: string, content: string) => {
    onInsert(content, platform);
    onOpenChange(false);
    toast.success(`${platform} post inserted`);
  };

  const handleCopy = (platform: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2000);
    toast.success('Copied to clipboard');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <EngageDialogHeader
          icon={Sparkles}
          title="AI Post Writer"
          gradientFrom="from-pink-400"
          gradientTo="to-purple-400"
          iconColor="text-pink-400"
        />
        <div className="space-y-4">
          {!results ? (
            <>
              <div>
                <Label>Topic / Brief *</Label>
                <Textarea
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g., Announce our new AI-powered features, share industry insights..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engaging">Engaging</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="inspirational">Inspirational</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="humorous">Humorous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <EngageButton onClick={handleGenerate} disabled={loading || !topic.trim()} className="w-full">
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating for all platforms...</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" /> Generate Posts</>
                )}
              </EngageButton>
            </>
          ) : (
            <>
              <div className="space-y-3">
                {platforms.map(p => {
                  const postData = results[p.id];
                  const content = typeof postData === 'string' ? postData : postData?.content || '';
                  const hashtags = postData?.hashtags || [];
                  if (!content) return null;

                  return (
                    <GlassCard key={p.id} className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p.icon className={`h-4 w-4 ${p.color}`} />
                          <span className="text-sm font-medium text-foreground">{p.label}</span>
                        </div>
                        <div className="flex gap-1">
                          <EngageButton
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleCopy(p.id, content + (hashtags.length ? '\n\n' + hashtags.join(' ') : ''))}
                          >
                            {copiedPlatform === p.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </EngageButton>
                          <EngageButton
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleInsert(p.id, content + (hashtags.length ? '\n\n' + hashtags.join(' ') : ''))}
                          >
                            Use This
                          </EngageButton>
                        </div>
                      </div>
                      <p className="text-xs text-foreground whitespace-pre-wrap">{content}</p>
                      {hashtags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {hashtags.map((tag: string, i: number) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{tag}</span>
                          ))}
                        </div>
                      )}
                    </GlassCard>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <EngageButton variant="outline" size="sm" onClick={() => { setResults(null); }} className="flex-1">
                  Start Over
                </EngageButton>
                <EngageButton variant="outline" size="sm" onClick={handleGenerate} disabled={loading} className="flex-1">
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
