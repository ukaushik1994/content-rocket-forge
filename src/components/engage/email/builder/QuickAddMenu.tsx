import React, { useState, useEffect, useRef } from 'react';
import { BLOCK_DEFINITIONS, BlockType } from './blockDefinitions';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickAddMenuProps {
  open: boolean;
  onClose: () => void;
  onAddBlock: (type: BlockType) => void;
}

export const QuickAddMenu: React.FC<QuickAddMenuProps> = ({ open, onClose, onAddBlock }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = BLOCK_DEFINITIONS.filter(d =>
    d.label.toLowerCase().includes(search.toLowerCase()) ||
    d.type.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      onAddBlock(filtered[selectedIndex].type);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-50" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-1/3 -translate-x-1/2 z-50 w-72 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-2">
              <input
                ref={inputRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search blocks..."
                className="w-full h-9 px-3 text-sm bg-muted/30 rounded-lg border-0 outline-none placeholder:text-muted-foreground/60 text-foreground"
              />
            </div>
            <div className="max-h-56 overflow-y-auto px-1 pb-1">
              {filtered.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No blocks found</p>
              ) : (
                filtered.map((def, i) => (
                  <button
                    key={def.type}
                    onClick={() => { onAddBlock(def.type); onClose(); }}
                    className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                      i === selectedIndex ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-accent/50'
                    }`}
                  >
                    <def.icon className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-medium">{def.label}</span>
                    <span className="text-xs text-muted-foreground ml-auto capitalize">{def.category}</span>
                  </button>
                ))
              )}
            </div>
            <div className="px-3 py-1.5 border-t border-border/40 flex items-center gap-3 text-[10px] text-muted-foreground">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
