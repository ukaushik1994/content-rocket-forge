import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EmailBlock, BlockType } from './blockDefinitions';
import { BlockRenderer } from './BlockRenderer';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface BuilderCanvasProps {
  blocks: EmailBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onMoveBlockUp: (id: string) => void;
  onMoveBlockDown: (id: string) => void;
  onInlineEdit: (id: string, props: Record<string, any>) => void;
  onToggleLock: (id: string) => void;
  onToggleHidden: (id: string) => void;
  previewWidth: number;
  overIndex: number | null;
  totalBlocks: number;
  justCreatedId?: string | null;
  onInsertBlockAt?: (index: number) => void;
  onSaveAsReusable?: (block: EmailBlock) => void;
  zoom?: number;
}

function SortableBlock({ block, isSelected, isFirst, isLast, onSelect, onDelete, onDuplicate, onMoveUp, onMoveDown, onInlineEdit, onToggleLock, onToggleHidden, onSaveAsReusable, justCreated }: {
  block: EmailBlock; isSelected: boolean; isFirst: boolean; isLast: boolean;
  onSelect: () => void; onDelete: () => void; onDuplicate: () => void;
  onMoveUp: () => void; onMoveDown: () => void;
  onInlineEdit: (props: Record<string, any>) => void;
  onToggleLock: () => void; onToggleHidden: () => void;
  onSaveAsReusable?: (block: EmailBlock) => void;
  justCreated: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: block.id,
    disabled: block.locked,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <BlockRenderer
        block={block}
        isSelected={isSelected}
        isFirst={isFirst}
        isLast={isLast}
        onSelect={onSelect}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onInlineEdit={onInlineEdit}
        onToggleLock={onToggleLock}
        onToggleHidden={onToggleHidden}
        onSaveAsReusable={onSaveAsReusable}
        dragHandleProps={listeners}
        justCreated={justCreated}
      />
    </div>
  );
}

// Between-block insert button
function InsertButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="relative h-0 group/insert z-[3]">
      <div className="absolute inset-x-4 top-0 flex items-center justify-center -translate-y-1/2">
        <div className="flex-1 h-px bg-transparent group-hover/insert:bg-primary/30 transition-colors" />
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="h-5 w-5 rounded-full bg-primary/80 text-primary-foreground flex items-center justify-center opacity-0 group-hover/insert:opacity-100 transition-all hover:bg-primary hover:scale-110 shadow-sm"
        >
          <Plus className="h-3 w-3" />
        </button>
        <div className="flex-1 h-px bg-transparent group-hover/insert:bg-primary/30 transition-colors" />
      </div>
    </div>
  );
}

export const BuilderCanvas: React.FC<BuilderCanvasProps> = ({
  blocks, selectedBlockId, onSelectBlock, onDeleteBlock, onDuplicateBlock,
  onMoveBlockUp, onMoveBlockDown, onInlineEdit, onToggleLock, onToggleHidden,
  previewWidth, overIndex, totalBlocks, justCreatedId, onInsertBlockAt, onSaveAsReusable, zoom = 1,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'builder-canvas' });

  return (
    <div 
      className="flex-1 overflow-y-auto p-6"
      style={{
        backgroundColor: 'hsl(var(--muted) / 0.15)',
        backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground) / 0.06) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
      onClick={() => onSelectBlock('')}
    >
      <div
        ref={setNodeRef}
        className={`mx-auto bg-white shadow-lg rounded-sm min-h-[400px] transition-all ${isOver ? 'ring-2 ring-primary/50' : ''}`}
        style={{
          maxWidth: previewWidth,
          width: '100%',
          transform: zoom !== 1 ? `scale(${zoom})` : undefined,
          transformOrigin: 'top center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {blocks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Plus className="h-7 w-7 text-primary/60" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">Drag blocks here or click them in the sidebar</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Press / for quick add</p>
          </motion.div>
        ) : (
          <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-0">
              {/* Insert button before first block */}
              {onInsertBlockAt && <InsertButton onClick={() => onInsertBlockAt(0)} />}
              {blocks.map((block, idx) => (
                <React.Fragment key={block.id}>
                  {overIndex === idx && (
                    <div className="h-0.5 bg-primary mx-4 rounded-full shadow-[0_0_8px_hsl(var(--primary)/0.5)] transition-all" />
                  )}
                  <SortableBlock
                    block={block}
                    isSelected={block.id === selectedBlockId}
                    isFirst={idx === 0}
                    isLast={idx === blocks.length - 1}
                    onSelect={() => onSelectBlock(block.id)}
                    onDelete={() => onDeleteBlock(block.id)}
                    onDuplicate={() => onDuplicateBlock(block.id)}
                    onMoveUp={() => onMoveBlockUp(block.id)}
                    onMoveDown={() => onMoveBlockDown(block.id)}
                    onInlineEdit={(props) => onInlineEdit(block.id, props)}
                    onToggleLock={() => onToggleLock(block.id)}
                    onToggleHidden={() => onToggleHidden(block.id)}
                    onSaveAsReusable={onSaveAsReusable}
                    justCreated={block.id === justCreatedId}
                  />
                  {/* Insert button between blocks */}
                  {onInsertBlockAt && <InsertButton onClick={() => onInsertBlockAt(idx + 1)} />}
                </React.Fragment>
              ))}
              {overIndex !== null && overIndex >= blocks.length && (
                <div className="h-0.5 bg-primary mx-4 rounded-full shadow-[0_0_8px_hsl(var(--primary)/0.5)] transition-all" />
              )}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
};
