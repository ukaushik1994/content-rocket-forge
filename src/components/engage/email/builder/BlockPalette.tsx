import React from 'react';
import { BLOCK_DEFINITIONS, BlockType, EmailBlock, getBlockDef } from './blockDefinitions';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { X, Bookmark } from 'lucide-react';

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
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl text-center transition-all duration-200
        bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-primary/40
        hover:shadow-[0_0_20px_hsl(var(--primary)/0.1)] backdrop-blur-sm
        ${isDragging ? 'opacity-40 scale-90' : ''}`}
    >
      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="h-4.5 w-4.5 text-primary/80" />
      </div>
      <span className="text-[11px] text-foreground/70 font-medium leading-tight">{label}</span>
    </button>
  );
}

const CATEGORIES = [
  { key: 'content', label: 'Content' },
  { key: 'layout', label: 'Layout' },
  { key: 'social', label: 'Social & Footer' },
] as const;

export const BlockPalette: React.FC<BlockPaletteProps> = ({ onAddBlock, savedBlocks = [], onInsertSavedBlock, onRemoveSavedBlock }) => {
  return (
    <div className="p-4 space-y-5">
      {CATEGORIES.map((cat) => {
        const items = BLOCK_DEFINITIONS.filter(d => d.category === cat.key);
        if (!items.length) return null;
        return (
          <div key={cat.key} className="space-y-2">
            <div className="flex items-center gap-2 px-0.5">
              <p className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-widest">{cat.label}</p>
              <div className="flex-1 h-px bg-border/30" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {items.map((def, i) => (
                <motion.div
                  key={def.type}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <DraggablePaletteItem
                    type={def.type}
                    label={def.label}
                    icon={def.icon}
                    onAdd={() => onAddBlock(def.type)}
                  />
                </motion.div>
              ))}
            </div>
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
