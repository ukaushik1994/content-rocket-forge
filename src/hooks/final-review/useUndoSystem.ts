import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UndoEntry {
  id: string;
  timestamp: Date;
  beforeContent: string;
  afterContent: string;
  description: string;
  suggestionId?: string;
}

export const useUndoSystem = () => {
  const [undoHistory, setUndoHistory] = useState<UndoEntry[]>([]);
  const [currentPosition, setCurrentPosition] = useState(0);

  const addUndoEntry = useCallback((
    beforeContent: string,
    afterContent: string,
    description: string,
    suggestionId?: string
  ) => {
    const entry: UndoEntry = {
      id: `undo-${Date.now()}`,
      timestamp: new Date(),
      beforeContent,
      afterContent,
      description,
      suggestionId
    };

    setUndoHistory(prev => {
      // Remove any entries after current position (for linear undo)
      const newHistory = prev.slice(0, currentPosition);
      return [...newHistory, entry];
    });
    
    setCurrentPosition(prev => prev + 1);
  }, [currentPosition]);

  const undo = useCallback((updateContentCallback: (content: string) => void) => {
    if (currentPosition === 0) {
      toast.error('Nothing to undo');
      return false;
    }

    const entry = undoHistory[currentPosition - 1];
    if (!entry) {
      toast.error('Undo entry not found');
      return false;
    }

    updateContentCallback(entry.beforeContent);
    setCurrentPosition(prev => prev - 1);
    
    toast.success(`Undid: ${entry.description}`);
    return true;
  }, [undoHistory, currentPosition]);

  const redo = useCallback((updateContentCallback: (content: string) => void) => {
    if (currentPosition >= undoHistory.length) {
      toast.error('Nothing to redo');
      return false;
    }

    const entry = undoHistory[currentPosition];
    if (!entry) {
      toast.error('Redo entry not found');
      return false;
    }

    updateContentCallback(entry.afterContent);
    setCurrentPosition(prev => prev + 1);
    
    toast.success(`Redid: ${entry.description}`);
    return true;
  }, [undoHistory, currentPosition]);

  const canUndo = currentPosition > 0;
  const canRedo = currentPosition < undoHistory.length;

  const clearHistory = useCallback(() => {
    setUndoHistory([]);
    setCurrentPosition(0);
    toast.info('Undo history cleared');
  }, []);

  return {
    addUndoEntry,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    historyLength: undoHistory.length,
    currentPosition
  };
};

export default useUndoSystem;