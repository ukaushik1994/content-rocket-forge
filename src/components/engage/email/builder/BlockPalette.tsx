import React from 'react';
import { BLOCK_DEFINITIONS, BlockType } from './blockDefinitions';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';

interface BlockPaletteProps {
  onAddBlock: (type: BlockType) => void;
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
      className={`flex items-center gap-2.5 w-full p-2.5 rounded-lg text-left text-sm transition-all
        bg-muted/30 hover:bg-muted/50 border border-border/30 hover:border-border/60
        ${isDragging ? 'opacity-50 scale-95' : ''}`}
    >
      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <span className="text-foreground font-medium text-xs">{label}</span>
    </button>
  );
}

const CATEGORIES = [
  { key: 'content', label: 'Content' },
  { key: 'layout', label: 'Layout' },
  { key: 'social', label: 'Social & Footer' },
] as const;

export const BlockPalette: React.FC<BlockPaletteProps> = ({ onAddBlock }) => {
  return (
    <div className="w-56 shrink-0 border-r border-border/50 bg-card/80 overflow-y-auto p-3 space-y-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Blocks</p>
      {CATEGORIES.map((cat) => {
        const items = BLOCK_DEFINITIONS.filter(d => d.category === cat.key);
        if (!items.length) return null;
        return (
          <div key={cat.key} className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider px-1">{cat.label}</p>
            {items.map((def, i) => (
              <motion.div
                key={def.type}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
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
        );
      })}
    </div>
  );
};
