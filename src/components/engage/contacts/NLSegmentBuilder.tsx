import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { EngageButton } from '../shared/EngageButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Rule } from '@/components/engage/shared/RuleBuilder';

interface NLSegmentBuilderProps {
  onRulesGenerated: (rules: Rule[], matchType: 'all' | 'any') => void;
}

export const NLSegmentBuilder = ({ onRulesGenerated }: NLSegmentBuilderProps) => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('engage-ai-segments', {
        body: { description },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const definition = data?.definition;
      if (definition?.rules?.length) {
        onRulesGenerated(definition.rules, definition.match || 'all');
        toast.success(`Generated ${definition.rules.length} rule(s)`);
        setDescription('');
      } else {
        toast.error('No rules could be generated. Try being more specific.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate rules');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-violet-400" />
        <span className="text-xs font-medium text-foreground">Describe your segment in plain English</span>
      </div>
      <Textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder='e.g., "Active users who have the VIP tag and signed up in the last 30 days"'
        rows={2}
        className="text-sm bg-background/50"
      />
      <EngageButton
        size="sm"
        onClick={handleGenerate}
        disabled={loading || !description.trim()}
        className="w-full"
      >
        {loading ? (
          <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Analyzing...</>
        ) : (
          <><Sparkles className="h-3.5 w-3.5 mr-1" /> Generate Rules <ArrowRight className="h-3.5 w-3.5 ml-1" /></>
        )}
      </EngageButton>
    </GlassCard>
  );
};
