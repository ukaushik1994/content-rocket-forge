import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, PenLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OutlineSection } from '@/contexts/content-builder/types/outline-types';

interface WizardStepWordCountProps {
  outline: OutlineSection[];
  researchSelections: {
    faqs: string[];
    contentGaps: string[];
    relatedKeywords: string[];
    serpHeadings: string[];
  };
  wordCount: number | null;
  wordCountMode: 'ai' | 'custom';
  onWordCountChange: (count: number | null) => void;
  onModeChange: (mode: 'ai' | 'custom') => void;
}

export const WizardStepWordCount: React.FC<WizardStepWordCountProps> = ({
  outline,
  researchSelections,
  wordCount,
  wordCountMode,
  onWordCountChange,
  onModeChange,
}) => {
  // Calculate AI-recommended word count
  const aiEstimate = React.useMemo(() => {
    const sectionCount = outline.length;
    const totalSelected = Object.values(researchSelections).flat().length;
    const baseWords = 300; // per section
    const researchBonus = totalSelected * 50;
    return Math.round((sectionCount * baseWords + researchBonus) / 100) * 100;
  }, [outline, researchSelections]);

  useEffect(() => {
    if (wordCountMode === 'ai') {
      onWordCountChange(aiEstimate);
    }
  }, [wordCountMode, aiEstimate]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-foreground">Target Word Count</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Choose how long your content should be</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onModeChange('ai')}
          className={cn(
            "flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all cursor-pointer",
            wordCountMode === 'ai'
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border/30 hover:border-border/50 bg-muted/20"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            wordCountMode === 'ai' ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
          )}>
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Let AI Decide</p>
            <p className="text-xs text-muted-foreground mt-0.5">Recommended</p>
          </div>
          {wordCountMode === 'ai' && (
            <Badge variant="secondary" className="text-xs">
              ~{aiEstimate.toLocaleString()} words
            </Badge>
          )}
        </button>

        <button
          onClick={() => onModeChange('custom')}
          className={cn(
            "flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all cursor-pointer",
            wordCountMode === 'custom'
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border/30 hover:border-border/50 bg-muted/20"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            wordCountMode === 'custom' ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
          )}>
            <PenLine className="w-5 h-5" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Custom</p>
            <p className="text-xs text-muted-foreground mt-0.5">Set your own</p>
          </div>
        </button>
      </div>

      {wordCountMode === 'custom' && (
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Word count target</label>
          <Input
            type="number"
            min={200}
            max={10000}
            step={100}
            value={wordCount || ''}
            onChange={(e) => onWordCountChange(parseInt(e.target.value) || null)}
            placeholder="e.g. 1500"
            className="text-sm"
          />
          <p className="text-[10px] text-muted-foreground">AI recommended: ~{aiEstimate.toLocaleString()} words based on your outline</p>
        </div>
      )}
    </div>
  );
};
