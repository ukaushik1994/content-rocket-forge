import React, { useState } from 'react';
import { BLOCK_DEFINITIONS, BlockType, EmailBlock, getBlockDef } from './blockDefinitions';
import { useDraggable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bookmark, ChevronDown } from 'lucide-react';

export interface SavedBlock {
  name: string;
  block: EmailBlock;
}

interface BlockPaletteProps {
  onAddBlock: (type: BlockType) => void;
  savedBlocks?: SavedBlock[];
  onInsertSavedBlock?: (block: EmailBlock) => void;
  onRemoveSavedBlock?: (index: number) => void;
}

function DraggablePaletteItem({ type, label, icon: Icon, onAdd }: { type: BlockType; label: string; icon: any; onAdd: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type, fromPalette: true },
  });

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onAdd}
      className={`flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl text-center transition-all duration-200
        bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-primary/40
        hover:shadow-[0_0_20px_hsl(var(--primary)/0.1)] backdrop-blur-sm
        ${isDragging ? 'opacity-40 scale-90' : ''}`}
    >
      <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-3.5 w-3.5 text-primary/80" />
      </div>
      <span className="text-[10px] text-foreground/70 font-medium leading-tight">{label}</span>
    </button>
  );
}

const CATEGORIES = [
  { key: 'content', label: 'Content' },
  { key: 'layout', label: 'Layout' },
  { key: 'social', label: 'Social & Footer' },
] as const;

export const BlockPalette: React.FC<BlockPaletteProps> = ({ onAddBlock, savedBlocks = [], onInsertSavedBlock, onRemoveSavedBlock }) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCategory = (key: string) => {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-3 space-y-2">
      {CATEGORIES.map((cat) => {
        const items = BLOCK_DEFINITIONS.filter(d => d.category === cat.key);
        if (!items.length) return null;
        const isCollapsed = collapsed[cat.key];
        return (
          <div key={cat.key} className="space-y-1.5">
            <button
              onClick={() => toggleCategory(cat.key)}
              className="flex items-center gap-2 px-0.5 w-full group"
            >
              <ChevronDown className={`h-3 w-3 text-muted-foreground/50 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
              <p className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-widest">{cat.label}</p>
              <div className="flex-1 h-px bg-border/30" />
            </button>
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-1.5">
                    {items.map((def) => (
                      <DraggablePaletteItem
                        key={def.type}
                        type={def.type}
                        label={def.label}
                        icon={def.icon}
                        onAdd={() => onAddBlock(def.type)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Saved Blocks */}
      {savedBlocks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-0.5">
            <Bookmark className="h-3 w-3 text-primary/50" />
            <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">Saved</p>
            <div className="flex-1 h-px bg-border/30" />
          </div>
          <div className="space-y-1">
            {savedBlocks.map((sb, i) => {
              const def = getBlockDef(sb.block.type);
              const Icon = def.icon;
              return (
                <div key={i} className="flex items-center gap-1.5">
                  <button
                    onClick={() => onInsertSavedBlock?.(sb.block)}
                    className="flex items-center gap-2 flex-1 p-2 rounded-lg text-left text-[11px] bg-primary/5 hover:bg-primary/10 border border-primary/10 hover:border-primary/25 transition-all"
                  >
                    <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-3 w-3 text-primary/70" />
                    </div>
                    <span className="text-foreground/70 font-medium truncate">{sb.name}</span>
                  </button>
                  <button
                    onClick={() => onRemoveSavedBlock?.(i)}
                    className="p-1 hover:bg-destructive/10 rounded shrink-0 transition-colors"
                    title="Remove saved block"
                  >
                    <X className="h-3 w-3 text-muted-foreground/50 hover:text-destructive" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};