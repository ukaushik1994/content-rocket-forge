import React, { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverEvent, DragOverlay } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Undo2, Redo2, Monitor, Smartphone, Save, Eye, Paintbrush, X, FileText, Mail, Code } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEmailBuilder } from './useEmailBuilder';
import { BlockPalette } from './BlockPalette';
import { BuilderCanvas } from './BuilderCanvas';
import { BlockInspector } from './BlockInspector';
import { EmailBuilderPreview } from './EmailBuilderPreview';
import { StarterTemplatesPanel } from './StarterTemplatesPanel';
import { BlockRenderer } from './BlockRenderer';
import { EmailBlock, BlockType, getBlockDef, createBlock } from './blockDefinitions';

interface EmailBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialHtml?: string;
  initialBlocks?: EmailBlock[];
  onSave: (html: string, blocks: EmailBlock[], meta: { name: string; subject: string }) => void;
  templateName?: string;
  templateSubject?: string;
}

export const EmailBuilderDialog: React.FC<EmailBuilderDialogProps> = ({
  open, onOpenChange, initialBlocks, onSave, templateName, templateSubject,
}) => {
  const [mode, setMode] = useState<'visual' | 'code' | 'preview'>('visual');
  const [previewWidth, setPreviewWidth] = useState(600);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [name, setName] = useState(templateName || '');
  const [subject, setSubject] = useState(templateSubject || '');
  const [showStarters, setShowStarters] = useState(false);
  const [codeHtml, setCodeHtml] = useState('');

  const builder = useEmailBuilder(initialBlocks || []);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Show starter templates when opening with no blocks
  useEffect(() => {
    if (open && (!initialBlocks || initialBlocks.length === 0) && builder.blocks.length === 0) {
      setShowStarters(true);
    }
  }, [open]);

  // Sync name/subject from props
  useEffect(() => {
    if (open) {
      setName(templateName || '');
      setSubject(templateSubject || '');
    }
  }, [open, templateName, templateSubject]);

  // Sync code HTML when switching to code mode
  useEffect(() => {
    if (mode === 'code') {
      setCodeHtml(builder.exportHtml());
    }
  }, [mode]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    if (over && over.id !== 'builder-canvas') {
      const idx = builder.blocks.findIndex(b => b.id === over.id);
      setOverIndex(idx >= 0 ? idx : null);
    } else if (over?.id === 'builder-canvas') {
      setOverIndex(builder.blocks.length);
    } else {
      setOverIndex(null);
    }
  }, [builder.blocks]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    setOverIndex(null);
    if (!over) return;

    const data = active.data.current;
    if (data?.fromPalette) {
      // Insert at hovered position instead of always at end
      let insertAt = builder.blocks.length;
      if (over.id !== 'builder-canvas') {
        const idx = builder.blocks.findIndex(b => b.id === over.id);
        if (idx >= 0) insertAt = idx;
      }
      builder.addBlock(data.type as BlockType, insertAt);
      return;
    }
    if (active.id !== over.id) {
      const oldIndex = builder.blocks.findIndex(b => b.id === active.id);
      const newIndex = builder.blocks.findIndex(b => b.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newBlocks = arrayMove(builder.blocks, oldIndex, newIndex);
        builder.reorderBlocks(newBlocks);
      }
    }
  }, [builder]);

  const handleSave = useCallback(() => {
    const html = builder.exportHtml();
    const blocks = builder.getBlocksJson();
    onSave(html, blocks, { name: name || 'Untitled Template', subject: subject || 'Email Subject' });
  }, [builder, onSave, name, subject]);

  const handleSelectStarter = useCallback((blocks: EmailBlock[], starterName: string) => {
    builder.loadBlocks(blocks);
    if (!name) setName(starterName);
    setShowStarters(false);
  }, [builder, name]);

  // Get active block for drag overlay
  const activeBlock = activeDragId
    ? builder.blocks.find(b => b.id === activeDragId) ||
      // If from palette, create a temporary preview block
      (activeDragId.startsWith('palette-') ? (() => {
        const type = activeDragId.replace('palette-', '') as BlockType;
        return createBlock(type, 0);
      })() : null)
    : null;

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); builder.undo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) { e.preventDefault(); builder.redo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); handleSave(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, builder, handleSave]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] p-0 rounded-none border-0 gap-0 [&>button]:hidden">
        <div className="flex flex-col h-full">
          {/* Top Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-card/95 backdrop-blur-xl shrink-0">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button onClick={() => onOpenChange(false)} className="p-1.5 hover:bg-muted/50 rounded-md transition-colors shrink-0">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className="h-5 w-px bg-border/50 shrink-0" />
              {/* Editable Name & Subject */}
              <div className="flex items-center gap-2 flex-1 min-w-0 max-w-md">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Template name..."
                    className="h-7 text-sm font-medium border-0 bg-transparent px-1 focus-visible:ring-1 focus-visible:ring-primary/30"
                  />
                </div>
                <div className="h-4 w-px bg-border/30 shrink-0" />
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <Input
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Subject line..."
                    className="h-7 text-sm border-0 bg-transparent px-1 focus-visible:ring-1 focus-visible:ring-primary/30"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Mode Toggle - 3 modes */}
              <div className="flex items-center bg-muted/30 rounded-lg p-0.5 mr-2">
                <button
                  onClick={() => setMode('visual')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'visual' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Paintbrush className="h-3.5 w-3.5" /> Build
                </button>
                <button
                  onClick={() => setMode('code')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'code' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Code className="h-3.5 w-3.5" /> Code
                </button>
                <button
                  onClick={() => setMode('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'preview' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Eye className="h-3.5 w-3.5" /> Preview
                </button>
              </div>

              {/* Undo/Redo */}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={builder.undo} disabled={!builder.canUndo} title="Undo (⌘Z)">
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={builder.redo} disabled={!builder.canRedo} title="Redo (⌘⇧Z)">
                <Redo2 className="h-4 w-4" />
              </Button>

              <div className="h-5 w-px bg-border/50 mx-1" />

              {/* Device Preview */}
              {mode === 'visual' && (
                <>
                  <Button variant={previewWidth === 600 ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setPreviewWidth(600)} title="Desktop">
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button variant={previewWidth === 320 ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setPreviewWidth(320)} title="Mobile">
                    <Smartphone className="h-4 w-4" />
                  </Button>
                  <div className="h-5 w-px bg-border/50 mx-1" />
                </>
              )}

              {/* Save */}
              <Button size="sm" className="h-8 text-xs gap-1.5" onClick={handleSave}>
                <Save className="h-3.5 w-3.5" /> Save
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {showStarters && builder.blocks.length === 0 ? (
              <StarterTemplatesPanel
                onSelect={handleSelectStarter}
                onSkip={() => setShowStarters(false)}
              />
            ) : mode === 'visual' ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
                <BlockPalette onAddBlock={(type) => builder.addBlock(type)} />
                <BuilderCanvas
                  blocks={builder.blocks}
                  selectedBlockId={builder.selectedBlockId}
                  onSelectBlock={(id) => builder.setSelectedBlockId(id || null)}
                  onDeleteBlock={builder.removeBlock}
                  onDuplicateBlock={builder.duplicateBlock}
                  onMoveBlockUp={builder.moveBlockUp}
                  onMoveBlockDown={builder.moveBlockDown}
                  onInlineEdit={(id, props) => builder.updateBlockProps(id, props)}
                  previewWidth={previewWidth}
                  overIndex={overIndex}
                  totalBlocks={builder.blocks.length}
                />
                <BlockInspector
                  block={builder.selectedBlock}
                  onUpdate={builder.updateBlockProps}
                  onDelete={builder.removeBlock}
                  globalStyles={builder.globalStyles}
                  onUpdateGlobalStyles={builder.setGlobalStyles}
                />
                {/* Drag Overlay */}
                <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
                  {activeBlock ? (
                    <div className="opacity-80 shadow-2xl rounded-md scale-95 pointer-events-none max-w-[400px]">
                      <BlockRenderer
                        block={activeBlock}
                        isSelected={false}
                        onSelect={() => {}}
                        onDelete={() => {}}
                        onDuplicate={() => {}}
                      />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            ) : mode === 'code' ? (
              <div className="flex-1 flex flex-col overflow-hidden p-4">
                <p className="text-xs text-muted-foreground mb-2">Edit the generated HTML directly. Changes here are view-only and won't modify visual blocks.</p>
                <Textarea
                  value={codeHtml}
                  onChange={e => setCodeHtml(e.target.value)}
                  className="flex-1 font-mono text-xs resize-none"
                  placeholder="HTML will appear here..."
                />
              </div>
            ) : (
              <EmailBuilderPreview html={builder.exportHtml()} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
