import React from 'react';
import { EmailBlock, getBlockDef } from './blockDefinitions';
import { Lock, EyeOff, ChevronUp, ChevronDown, Layers } from 'lucide-react';
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
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-primary/70" />
          <p className="text-[11px] font-semibold text-foreground/80 uppercase tracking-wider">Layers</p>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">
          {blocks.length}
        </span>
      </div>

      {/* Layer list */}
      <div className="space-y-0.5 max-h-[240px] overflow-y-auto scrollbar-thin pr-0.5">
        {blocks.map((block, idx) => {
          const def = getBlockDef(block.type);
          const Icon = def.icon;
          const isSelected = block.id === selectedBlockId;
          return (
            <motion.button
              key={block.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.025 }}
              onClick={() => onSelectBlock(block.id)}
              className={`flex items-center gap-2 w-full px-2 py-2 rounded-lg text-left text-[11px] transition-all group relative ${
                isSelected
                  ? 'bg-primary/10 border border-primary/25 shadow-[0_0_12px_hsl(var(--primary)/0.08)]'
                  : 'hover:bg-muted/50 border border-transparent'
              }`}
            >
              {/* Index number */}
              <span className={`text-[9px] font-mono w-3.5 text-center shrink-0 ${
                isSelected ? 'text-primary font-bold' : 'text-muted-foreground/50'
              }`}>
                {idx + 1}
              </span>

              {/* Icon with background */}
              <div className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${
                isSelected 
                  ? 'bg-primary/15' 
                  : 'bg-muted/40'
              }`}>
                <Icon className={`h-3 w-3 ${isSelected ? 'text-primary' : 'text-muted-foreground/70'}`} />
              </div>

              {/* Label */}
              <span className={`flex-1 truncate font-medium ${
                isSelected ? 'text-primary' : 'text-foreground/70'
              }`}>{def.label}</span>

              {/* Status indicators */}
              <div className="flex items-center gap-1 shrink-0">
                {block.locked && (
                  <div className="h-4 w-4 rounded flex items-center justify-center bg-amber-500/10">
                    <Lock className="h-2.5 w-2.5 text-amber-500" />
                  </div>
                )}
                {block.hidden && (
                  <div className="h-4 w-4 rounded flex items-center justify-center bg-muted/50">
                    <EyeOff className="h-2.5 w-2.5 text-muted-foreground/60" />
                  </div>
                )}
              </div>

              {/* Move arrows on hover */}
              <div className="flex flex-col gap-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {idx > 0 && (
                  <button onClick={(e) => { e.stopPropagation(); onMoveUp(block.id); }} className="p-0.5 hover:bg-primary/10 rounded transition-colors">
                    <ChevronUp className="h-2.5 w-2.5 text-muted-foreground" />
                  </button>
                )}
                {idx < blocks.length - 1 && (
                  <button onClick={(e) => { e.stopPropagation(); onMoveDown(block.id); }} className="p-0.5 hover:bg-primary/10 rounded transition-colors">
                    <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
                  </button>
                )}
              </div>

              {/* Selected left accent */}
              {isSelected && (
                <motion.div 
                  layoutId="layer-accent"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-primary"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
