import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toolbarPos, setToolbarPos] = useState<{ left: number; top: number; placement: 'above' | 'below' } | null>(null);
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

  const computeToolbarPosition = useCallback((startIndex?: number, endIndex?: number) => {
    const ta = textareaRef.current;
    const container = containerRef.current;
    if (!ta || !container) return;

    const start = typeof startIndex === 'number' ? startIndex : (selection?.start ?? null);
    const end = typeof endIndex === 'number' ? endIndex : (selection?.end ?? null);
    if (start === null || end === null || start === end) {
      setToolbarPos(null);
      return;
    }

    const getCaretOffset = (index: number) => {
      const taStyle = window.getComputedStyle(ta);
      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.visibility = 'hidden';
      div.style.whiteSpace = 'pre-wrap';
      div.style.wordWrap = 'break-word';
      div.style.overflowWrap = 'break-word';
      div.style.boxSizing = taStyle.boxSizing;
      div.style.width = `${ta.clientWidth}px`;
      div.style.fontFamily = taStyle.fontFamily;
      div.style.fontSize = taStyle.fontSize;
      div.style.lineHeight = taStyle.lineHeight;
      div.style.letterSpacing = taStyle.letterSpacing;
      div.style.padding = taStyle.padding;
      div.style.border = taStyle.border;

      const textBefore = ta.value.substring(0, index);
      div.textContent = textBefore;

      const span = document.createElement('span');
      span.textContent = '\u200b';
      div.appendChild(span);

      document.body.appendChild(div);
      const caretLeft = span.offsetLeft;
      const caretTop = span.offsetTop;
      document.body.removeChild(div);

      return {
        left: caretLeft - ta.scrollLeft,
        top: caretTop - ta.scrollTop,
      };
    };

    const startOffset = getCaretOffset(start);
    const endOffset = getCaretOffset(end);
    if (!startOffset || !endOffset) return;

    const taRect = ta.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    let anchorLeft = startOffset.left;
    // If on same line, center between start and end
    if (Math.abs(endOffset.top - startOffset.top) < 5) {
      anchorLeft = (startOffset.left + endOffset.left) / 2;
    }

    const baseLeft = taRect.left - containerRect.left;
    const baseTop = taRect.top - containerRect.top;

    let left = baseLeft + anchorLeft;
    const top = baseTop + startOffset.top;

    // Clamp within container
    const padding = 8;
    const containerWidth = containerRect.width;
    left = Math.max(padding, Math.min(left, containerWidth - padding));

    // Decide placement
    const placement: 'above' | 'below' = top > 48 ? 'above' : 'below';

    setToolbarPos({ left, top, placement });
  }, [selection]);

  const handleScroll = () => {
    if (selection) {
      computeToolbarPosition();
    }
  };

  const replaceSelection = (newText: string) => {
    if (!selection) return;
    const before = value.slice(0, selection.start);
    const after = value.slice(selection.end);
    onChange(before + newText + after);
  };

  useEffect(() => {
    const onResize = () => {
      if (selection) computeToolbarPosition();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [selection, computeToolbarPosition]);

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
    <div ref={containerRef} className="relative h-full">
      {selection && toolbarPos && (
        <div
          className="absolute z-10 flex items-center gap-1 bg-white/5 border border-white/10 rounded-md px-2 py-1 backdrop-blur-sm"
          style={{
            left: toolbarPos.left,
            top: toolbarPos.top,
            transform:
              toolbarPos.placement === 'above'
                ? 'translate(-50%, calc(-100% - 8px))'
                : 'translate(-50%, 8px)'
          }}
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
        onScroll={handleScroll}
        placeholder="Write your content here..."
        className="min-h-[60vh] border-0 focus-visible:ring-0 resize-none p-4 flex-1 bg-transparent"
        disabled={disabled}
      />
    </div>
  );
};
