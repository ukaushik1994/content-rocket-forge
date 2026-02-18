import { useState, useCallback, useRef } from 'react';
import { EmailBlock, BlockType, createBlock } from './blockDefinitions';
import { exportBlocksToHtml, GlobalStyles, DEFAULT_GLOBAL_STYLES } from './htmlExporter';

const MAX_HISTORY = 50;

export function useEmailBuilder(initialBlocks: EmailBlock[] = []) {
  const [blocks, setBlocks] = useState<EmailBlock[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [globalStyles, setGlobalStyles] = useState<GlobalStyles>(DEFAULT_GLOBAL_STYLES);
  const [justCreatedId, setJustCreatedId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const historyRef = useRef<EmailBlock[][]>([initialBlocks]);
  const historyIndexRef = useRef(0);

  const markDirty = useCallback(() => setIsDirty(true), []);
  const clearDirty = useCallback(() => setIsDirty(false), []);

  const pushHistory = useCallback((next: EmailBlock[]) => {
    const idx = historyIndexRef.current;
    const stack = historyRef.current.slice(0, idx + 1);
    stack.push(next);
    if (stack.length > MAX_HISTORY) stack.shift();
    historyRef.current = stack;
    historyIndexRef.current = stack.length - 1;
    markDirty();
  }, [markDirty]);

  const clearJustCreated = useCallback(() => {
    setTimeout(() => setJustCreatedId(null), 400);
  }, []);

  const addBlock = useCallback((type: BlockType, index?: number) => {
    setBlocks(prev => {
      const insertAt = index !== undefined ? index : prev.length;
      const block = createBlock(type, insertAt);
      const next = [...prev];
      next.splice(insertAt, 0, block);
      const reordered = next.map((b, i) => ({ ...b, order: i }));
      pushHistory(reordered);
      setSelectedBlockId(block.id);
      setJustCreatedId(block.id);
      clearJustCreated();
      return reordered;
    });
  }, [pushHistory, clearJustCreated]);

  const removeBlock = useCallback((id: string) => {
    setBlocks(prev => {
      const block = prev.find(b => b.id === id);
      if (block?.locked) return prev;
      const next = prev.filter(b => b.id !== id).map((b, i) => ({ ...b, order: i }));
      pushHistory(next);
      if (selectedBlockId === id) setSelectedBlockId(null);
      return next;
    });
  }, [pushHistory, selectedBlockId]);

  const updateBlockProps = useCallback((id: string, props: Record<string, any>) => {
    setBlocks(prev => {
      const next = prev.map(b => b.id === id ? { ...b, props: { ...b.props, ...props } } : b);
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const duplicateBlock = useCallback((id: string) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx === -1) return prev;
      const source = prev[idx];
      const clone = createBlock(source.type, idx + 1);
      clone.props = { ...source.props };
      clone.locked = false;
      clone.hidden = source.hidden;
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      const reordered = next.map((b, i) => ({ ...b, order: i }));
      pushHistory(reordered);
      setSelectedBlockId(clone.id);
      setJustCreatedId(clone.id);
      clearJustCreated();
      return reordered;
    });
  }, [pushHistory, clearJustCreated]);

  const moveBlock = useCallback((fromIndex: number, toIndex: number) => {
    setBlocks(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      const reordered = next.map((b, i) => ({ ...b, order: i }));
      pushHistory(reordered);
      return reordered;
    });
  }, [pushHistory]);

  const moveBlockUp = useCallback((id: string) => {
    setBlocks(prev => {
      const block = prev.find(b => b.id === id);
      if (block?.locked) return prev;
      const idx = prev.findIndex(b => b.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      const reordered = next.map((b, i) => ({ ...b, order: i }));
      pushHistory(reordered);
      return reordered;
    });
  }, [pushHistory]);

  const moveBlockDown = useCallback((id: string) => {
    setBlocks(prev => {
      const block = prev.find(b => b.id === id);
      if (block?.locked) return prev;
      const idx = prev.findIndex(b => b.id === id);
      if (idx === -1 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      const reordered = next.map((b, i) => ({ ...b, order: i }));
      pushHistory(reordered);
      return reordered;
    });
  }, [pushHistory]);

  const toggleLock = useCallback((id: string) => {
    setBlocks(prev => {
      const next = prev.map(b => b.id === id ? { ...b, locked: !b.locked } : b);
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const toggleHidden = useCallback((id: string) => {
    setBlocks(prev => {
      const next = prev.map(b => b.id === id ? { ...b, hidden: !b.hidden } : b);
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const reorderBlocks = useCallback((newBlocks: EmailBlock[]) => {
    const reordered = newBlocks.map((b, i) => ({ ...b, order: i }));
    pushHistory(reordered);
    setBlocks(reordered);
  }, [pushHistory]);

  const undo = useCallback(() => {
    const idx = historyIndexRef.current;
    if (idx > 0) {
      historyIndexRef.current = idx - 1;
      setBlocks(historyRef.current[idx - 1]);
    }
  }, []);

  const redo = useCallback(() => {
    const idx = historyIndexRef.current;
    if (idx < historyRef.current.length - 1) {
      historyIndexRef.current = idx + 1;
      setBlocks(historyRef.current[idx + 1]);
    }
  }, []);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  const selectedBlock = blocks.find(b => b.id === selectedBlockId) || null;

  const exportHtml = useCallback(() => exportBlocksToHtml(blocks, globalStyles), [blocks, globalStyles]);

  const getBlocksJson = useCallback(() => JSON.parse(JSON.stringify(blocks)), [blocks]);

  const loadBlocks = useCallback((newBlocks: EmailBlock[]) => {
    setBlocks(newBlocks);
    historyRef.current = [newBlocks];
    historyIndexRef.current = 0;
    setSelectedBlockId(null);
    setIsDirty(false);
  }, []);

  return {
    blocks,
    selectedBlock,
    selectedBlockId,
    setSelectedBlockId,
    addBlock,
    removeBlock,
    updateBlockProps,
    duplicateBlock,
    moveBlock,
    moveBlockUp,
    moveBlockDown,
    toggleLock,
    toggleHidden,
    reorderBlocks,
    undo,
    redo,
    canUndo,
    canRedo,
    exportHtml,
    getBlocksJson,
    loadBlocks,
    globalStyles,
    setGlobalStyles,
    justCreatedId,
    isDirty,
    clearDirty,
  };
}
