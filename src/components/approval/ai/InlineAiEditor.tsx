import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [toolbarPos, setToolbarPos] = useState<{ left: number; top: number } | null>(null);
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
    if (start !== end) {
      setSelection({ start, end });
      computeToolbarPosition(start, end);
    } else {
      setSelection(null);
      setToolbarPos(null);
    }
  };

  const computeToolbarPosition = (start: number, end: number) => {
    const el = textareaRef.current;
    const container = containerRef.current;
    if (!el || !container) return;

    const containerRect = container.getBoundingClientRect();
    const s = window.getComputedStyle(el);

    const mirror = document.createElement('div');
    mirror.style.position = 'absolute';
    mirror.style.visibility = 'hidden';
    mirror.style.whiteSpace = 'pre-wrap';
    mirror.style.wordWrap = 'break-word';
    mirror.style.overflow = 'auto';
    mirror.style.font = s.font || `${s.fontStyle} ${s.fontVariant} ${s.fontWeight} ${s.fontSize} / ${s.lineHeight} ${s.fontFamily}`;
    mirror.style.letterSpacing = s.letterSpacing;
    mirror.style.lineHeight = s.lineHeight;
    mirror.style.padding = s.padding;
    mirror.style.border = s.border;
    mirror.style.boxSizing = s.boxSizing as any;
    mirror.style.width = el.clientWidth + 'px';
    mirror.style.height = el.clientHeight + 'px';

    const escapeHtml = (str: string) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;');

    const before = escapeHtml(value.slice(0, start));
    const middleRaw = value.slice(start, end);
    const middle = escapeHtml(middleRaw.length ? middleRaw : '\u00a0');
    const after = escapeHtml(value.slice(end));

    mirror.innerHTML = `${before}<span id="__sel_marker__">${middle}</span>${after}`;

    document.body.appendChild(mirror);
    mirror.scrollTop = el.scrollTop;

    const marker = mirror.querySelector('#__sel_marker__') as HTMLSpanElement | null;
    if (marker) {
      const rect = marker.getBoundingClientRect();
      const left = rect.left - containerRect.left + rect.width / 2;
      const top = rect.top - containerRect.top - 8;
      setToolbarPos({ left, top });
    }

    document.body.removeChild(mirror);
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
    <div className="relative h-full" ref={containerRef}>
      {selection && (
        <div
          className="absolute z-10 flex items-center gap-1 bg-white/5 border border-white/10 rounded-md px-2 py-1"
          style={toolbarPos ? { left: toolbarPos.left, top: toolbarPos.top, transform: 'translate(-50%, -100%)' } : { right: 12, top: 12 }}
        >
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
        onScroll={updateSelection}
        placeholder="Write your content here..."
        className="min-h-[60vh] border-0 focus-visible:ring-0 resize-none p-4 flex-1 bg-transparent"
        disabled={disabled}
      />
    </div>
  );
};
