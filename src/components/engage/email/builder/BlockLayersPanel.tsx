import React from 'react';
import { EmailBlock, getBlockDef } from './blockDefinitions';
import { Lock, EyeOff, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface BlockLayersPanelProps {
  blocks: EmailBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

export const BlockLayersPanel: React.FC<BlockLayersPanelProps> = ({
  blocks, selectedBlockId, onSelectBlock, onMoveUp, onMoveDown,
}) => {
  if (blocks.length === 0) return null;

  return (
    <div className="border-t border-border/40 mt-2 pt-2">
      <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider px-1 mb-1.5">Layers</p>
      <div className="space-y-0.5 max-h-[200px] overflow-y-auto">
        {blocks.map((block, idx) => {
          const def = getBlockDef(block.type);
          const Icon = def.icon;
          const isSelected = block.id === selectedBlockId;
          return (
            <motion.button
              key={block.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.02 }}
              onClick={() => onSelectBlock(block.id)}
              className={`flex items-center gap-1.5 w-full px-2 py-1.5 rounded text-left text-[11px] transition-all group ${
                isSelected
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'hover:bg-muted/40 text-muted-foreground'
              }`}
            >
              <Icon className="h-3 w-3 shrink-0" />
              <span className="flex-1 truncate font-medium">{def.label}</span>
              {block.locked && <Lock className="h-2.5 w-2.5 text-amber-500 shrink-0" />}
              {block.hidden && <EyeOff className="h-2.5 w-2.5 text-muted-foreground/60 shrink-0" />}
              <div className="flex gap-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {idx > 0 && (
                  <button onClick={(e) => { e.stopPropagation(); onMoveUp(block.id); }} className="p-0.5 hover:bg-muted rounded">
                    <ChevronUp className="h-2.5 w-2.5" />
                  </button>
                )}
                {idx < blocks.length - 1 && (
                  <button onClick={(e) => { e.stopPropagation(); onMoveDown(block.id); }} className="p-0.5 hover:bg-muted rounded">
                    <ChevronDown className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
