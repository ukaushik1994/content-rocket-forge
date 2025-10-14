import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Type, Minimize2, Maximize2, CheckSquare, RotateCcw, Loader2 } from 'lucide-react';
import AIServiceController from '@/services/aiService/AIServiceController';

interface InlineAiEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  onAiApplied?: (prevValue: string) => void;
  disabled?: boolean;
  className?: string;
}

export const InlineAiEditor: React.FC<InlineAiEditorProps> = ({ value, onChange, onAiApplied, disabled, className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toolbarPos, setToolbarPos] = useState<{ left: number; top: number; placement: 'above' | 'below' } | null>(null);
  const [userInstruction, setUserInstruction] = useState('');
  const selectedText = useMemo(() => {
    if (!selection) return '';
    return value.slice(selection.start, selection.end);
  }, [selection, value]);

  const [lastEdit, setLastEdit] = useState<{ start: number; prevText: string; newText: string } | null>(null);

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
    if (Math.abs(endOffset.top - startOffset.top) < 5) {
      anchorLeft = (startOffset.left + endOffset.left) / 2;
    }

    const baseLeft = taRect.left - containerRect.left;
    const baseTop = taRect.top - containerRect.top;

    // Toolbar dimensions (fallbacks if not yet mounted)
    const tb = toolbarRef.current;
    const tbWidth = tb?.offsetWidth ?? 220;
    const tbHeight = tb?.offsetHeight ?? 40;

    // Compute centered position then clamp by toolbar width
    let centerX = baseLeft + anchorLeft;
    const padding = 8;
    const containerWidth = containerRect.width;
    const minCenter = padding + tbWidth / 2;
    const maxCenter = containerWidth - padding - tbWidth / 2;
    centerX = Math.max(minCenter, Math.min(centerX, maxCenter));

    const anchorY = baseTop + startOffset.top;
    const containerHeight = containerRect.height;

    // Decide placement based on available vertical space
    const canPlaceAbove = anchorY - tbHeight - padding >= padding;
    const canPlaceBelow = anchorY + tbHeight + padding <= containerHeight - padding;
    const placement: 'above' | 'below' = canPlaceAbove ? 'above' : canPlaceBelow ? 'below' : (anchorY > containerHeight / 2 ? 'above' : 'below');

    setToolbarPos({ left: centerX, top: anchorY, placement });
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

  useEffect(() => {
    if (selection) computeToolbarPosition();
  }, [userInstruction, selection, computeToolbarPosition]);

  const runInlineAi = useCallback(async (action: 'rephrase' | 'shorten' | 'expand' | 'fix') => {
    if (!selection || !selectedText) return;
    setIsProcessing(true);
    try {
      onAiApplied?.(value);
      const system = 'You edit only the provided text. Follow the action strictly and keep meaning. Output plain text without quotes.';
      const instructionText = userInstruction.trim() ? `\nSpecific instructions: ${userInstruction.trim()}` : '';
      const user = `Action: ${action}${instructionText}\nText:\n${selectedText}`;
      
      // Save user instructions for future prompt enhancement
      if (userInstruction && userInstruction.trim()) {
        const { saveUserInstruction } = await import('@/services/userInstructionsService');
        await saveUserInstruction(
          userInstruction,
          'inline_editing',
          undefined, // Format type not applicable for inline editing
          undefined, // No specific content ID for inline editing
          undefined // No session ID for inline editing
        );
      }
      
      const result = await AIServiceController.generate('content_generation', system, user, { maxTokens: 400, temperature: 0.2 });
      const improved = (result && (result.content || result)) as string;
      if (improved && improved.trim()) {
        const newText = improved.trim();
        // record last edit for revert
        setLastEdit({ start: selection.start, prevText: selectedText, newText });
        const before = value.slice(0, selection.start);
        const after = value.slice(selection.end);
        const nextValue = before + newText + after;
        onChange(nextValue);
        // update selection to new text range
        const newEnd = selection.start + newText.length;
        setSelection({ start: selection.start, end: newEnd });
      }
    } finally {
      setIsProcessing(false);
    }
  }, [selection, selectedText, onAiApplied, value, userInstruction, onChange]);

  const revertLastEdit = useCallback(() => {
    if (!lastEdit) return;
    const { start, prevText, newText } = lastEdit;
    const currentSlice = value.slice(start, start + newText.length);
    if (currentSlice !== newText) {
      setLastEdit(null);
      return;
    }
    const before = value.slice(0, start);
    const after = value.slice(start + newText.length);
    const nextValue = before + prevText + after;
    onChange(nextValue);
    setSelection({ start, end: start + prevText.length });
    setLastEdit(null);
  }, [lastEdit, value, onChange]);


  return (
    <div ref={containerRef} className={`relative h-full flex flex-col ${className || ''}`}>
      {selection && toolbarPos && (
        <div
          ref={toolbarRef}
          className="absolute z-10 flex flex-wrap items-center gap-1 glass-card rounded-lg px-2 py-1 max-w-[92vw] shadow-xl ring-1 ring-white/10 animate-enter"
          style={{
            left: toolbarPos.left,
            top: toolbarPos.top,
            transform:
              toolbarPos.placement === 'above'
                ? 'translate(-50%, calc(-100% - 8px))'
                : 'translate(-50%, 8px)'
          }}
        >
          <Input
            value={userInstruction}
            onChange={(e) => setUserInstruction(e.target.value)}
            placeholder="Add instruction (optional)"
            aria-label="Custom AI instruction"
            className="h-8 w-44 text-xs"
            disabled={isProcessing || disabled}
          />
          <Button size="sm" variant="ghost" disabled={isProcessing || disabled} onClick={() => runInlineAi('rephrase')} aria-label="Rephrase text">
            <Type className="h-3 w-3 text-primary" />
          </Button>
          <Button size="sm" variant="ghost" disabled={isProcessing || disabled} onClick={() => runInlineAi('shorten')} aria-label="Shorten text">
            <Minimize2 className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" disabled={isProcessing || disabled} onClick={() => runInlineAi('expand')} aria-label="Expand text">
            <Maximize2 className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" disabled={isProcessing || disabled} onClick={() => runInlineAi('fix')} aria-label="Fix text">
            <CheckSquare className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" disabled={!lastEdit || isProcessing || disabled} onClick={revertLastEdit} aria-label="Revert last change">
            <RotateCcw className="h-3 w-3" />
          </Button>
          {isProcessing && <Loader2 className="h-3 w-3 ml-1 animate-spin" />}
        </div>
      )}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onSelect={updateSelection}
          onClick={updateSelection}
          onKeyUp={updateSelection}
          onScroll={handleScroll}
          placeholder="Write your content here..."
          className="w-full h-full min-h-full border-0 focus-visible:ring-0 resize-none p-4 bg-transparent"
          disabled={disabled}
        />
      </div>
    </div>
  );
};
