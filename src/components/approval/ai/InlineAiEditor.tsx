import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Wand2, Sparkles, MoveHorizontal, FileText, RotateCcw, Loader2 } from 'lucide-react';
import AIServiceController from '@/services/aiService/AIServiceController';

interface InlineAiEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  onAiApplied?: (prevValue: string) => void;
  disabled?: boolean;
}

export const InlineAiEditor: React.FC<InlineAiEditorProps> = ({ value, onChange, onAiApplied, disabled }) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedText = useMemo(() => {
    if (!selection) return '';
    return value.slice(selection.start, selection.end);
  }, [selection, value]);

  const updateSelection = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    if (start !== end) setSelection({ start, end }); else setSelection(null);
  };

  const replaceSelection = (newText: string) => {
    if (!selection) return;
    const before = value.slice(0, selection.start);
    const after = value.slice(selection.end);
    onChange(before + newText + after);
  };

  const runInlineAi = useCallback(async (action: 'rephrase' | 'shorten' | 'expand' | 'fix') => {
    if (!selection || !selectedText) return;
    setIsProcessing(true);
    try {
      onAiApplied?.(value);
      const system = 'You edit only the provided text. Follow the action strictly and keep meaning. Output plain text without quotes.';
      const instructionMap = {
        rephrase: 'Rephrase to improve clarity and flow while preserving meaning.',
        shorten: 'Shorten to be more concise while preserving key information.',
        expand: 'Expand by adding helpful detail while staying on-topic and accurate.',
        fix: 'Fix grammar and punctuation; keep style consistent.'
      } as const;
      const user = `Action: ${action}\nText:\n${selectedText}`;
      const result = await AIServiceController.generate('content_generation', system, user, { maxTokens: 400, temperature: 0.2 });
      const improved = (result && (result.content || result)) as string;
      if (improved && improved.trim()) {
        replaceSelection(improved.trim());
      }
    } finally {
      setIsProcessing(false);
    }
  }, [selection, selectedText, onAiApplied, value]);

  return (
    <div className="relative h-full">
      {selection && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 bg-white/5 border border-white/10 rounded-md px-2 py-1">
          <span className="text-[11px] text-white/70 mr-1">AI Assist:</span>
          <Button size="sm" variant="ghost" disabled={isProcessing || disabled} onClick={() => runInlineAi('rephrase')}>
            <Sparkles className="h-3 w-3 mr-1 text-neon-purple" /> Rephrase
          </Button>
          <Button size="sm" variant="ghost" disabled={isProcessing || disabled} onClick={() => runInlineAi('shorten')}>
            <MoveHorizontal className="h-3 w-3 mr-1" /> Shorten
          </Button>
          <Button size="sm" variant="ghost" disabled={isProcessing || disabled} onClick={() => runInlineAi('expand')}>
            <Wand2 className="h-3 w-3 mr-1" /> Expand
          </Button>
          <Button size="sm" variant="ghost" disabled={isProcessing || disabled} onClick={() => runInlineAi('fix')}>
            <FileText className="h-3 w-3 mr-1" /> Fix
          </Button>
          {isProcessing && <Loader2 className="h-3 w-3 ml-1 animate-spin" />}
        </div>
      )}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={updateSelection}
        onClick={updateSelection}
        onKeyUp={updateSelection}
        placeholder="Write your content here..."
        className="min-h-[60vh] border-0 focus-visible:ring-0 resize-none p-4 flex-1 bg-transparent"
        disabled={disabled}
      />
    </div>
  );
};
