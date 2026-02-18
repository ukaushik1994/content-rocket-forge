import React, { useRef, useState, useEffect } from 'react';
import { EmailBlock, getBlockDef } from './blockDefinitions';
import { GripVertical, Trash2, Copy, ChevronUp, ChevronDown, Lock, Unlock, Eye, EyeOff, ImagePlus } from 'lucide-react';
import { motion } from 'framer-motion';

interface BlockRendererProps {
  block: EmailBlock;
  isSelected: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onInlineEdit?: (props: Record<string, any>) => void;
  onToggleLock?: () => void;
  onToggleHidden?: () => void;
  dragHandleProps?: any;
  justCreated?: boolean;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block, isSelected, isFirst, isLast, onSelect, onDelete, onDuplicate,
  onMoveUp, onMoveDown, onInlineEdit, onToggleLock, onToggleHidden,
  dragHandleProps, justCreated,
}) => {
  const def = getBlockDef(block.type);
  const p = block.props;
  const [isEditing, setIsEditing] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);
  const isLocked = block.locked;
  const isHidden = block.hidden;

  // Populate innerHTML when entering edit mode for text blocks
  useEffect(() => {
    if (isSelected && editRef.current && block.type === 'text') {
      editRef.current.innerHTML = p.content || '';
    }
  }, [isSelected, block.type]);

  useEffect(() => {
    if (isSelected && editRef.current && block.type === 'header') {
      editRef.current.textContent = p.text || '';
    }
  }, [isSelected, block.type]);

  const handleInlineBlur = (key: string) => {
    if (editRef.current && onInlineEdit) {
      const newVal = key === 'content' ? editRef.current.innerHTML : editRef.current.innerText;
      onInlineEdit({ [key]: newVal });
      setIsEditing(false);
    }
  };

  const handleInlineKeyDown = (e: React.KeyboardEvent, key: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleInlineBlur(key);
      editRef.current?.blur();
    }
  };

  const isDefaultImage = !p.url || p.url === '';

  const renderContent = () => {
    switch (block.type) {
      case 'header':
        return (
          <div style={{ backgroundColor: p.backgroundColor, padding: `${p.paddingY || 32}px 24px`, textAlign: p.alignment as any }}>
            {p.logoUrl && <img src={p.logoUrl} alt="Logo" style={{ maxHeight: 40, marginBottom: 8 }} />}
            <h1
              ref={isSelected && !isLocked ? editRef : undefined}
              contentEditable={isSelected && !isLocked}
              suppressContentEditableWarning
              onFocus={() => setIsEditing(true)}
              onBlur={() => handleInlineBlur('text')}
              onKeyDown={(e) => handleInlineKeyDown(e, 'text')}
              style={{
                margin: 0, fontSize: p.fontSize || 28, color: p.textColor,
                fontFamily: 'Arial, sans-serif', outline: 'none',
                cursor: isSelected && !isLocked ? 'text' : 'pointer',
              }}
            >
              {p.text}
            </h1>
          </div>
        );
      case 'text':
        return (
          <div
            ref={isSelected && !isLocked ? editRef : undefined}
            contentEditable={isSelected && !isLocked}
            suppressContentEditableWarning
            onFocus={() => setIsEditing(true)}
            onBlur={() => handleInlineBlur('content')}
            style={{
              padding: `${p.paddingY || 12}px 24px`, fontSize: p.fontSize || 16,
              color: p.textColor, textAlign: p.alignment as any,
              lineHeight: p.lineHeight || 1.6, outline: 'none',
              cursor: isSelected && !isLocked ? 'text' : 'pointer',
            }}
            dangerouslySetInnerHTML={!isSelected ? { __html: p.content } : undefined}
          />
        );
      case 'image':
        if (isDefaultImage) {
          return (
            <div style={{ padding: '12px 24px', textAlign: p.alignment as any }}>
              <div className="flex flex-col items-center justify-center gap-2 py-10 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
                <ImagePlus className="h-8 w-8 text-muted-foreground/40" />
                <span className="text-xs text-muted-foreground/60">Add image URL in inspector</span>
              </div>
            </div>
          );
        }
        return (
          <div style={{ padding: '12px 24px', textAlign: p.alignment as any }}>
            <img src={p.url} alt={p.alt} style={{ width: p.width, maxWidth: '100%', display: 'inline-block' }} />
          </div>
        );
      case 'button':
        return (
          <div style={{ padding: '16px 24px', textAlign: p.alignment as any }}>
            <span
              className="transition-all hover:brightness-110"
              style={{
                display: 'inline-block', backgroundColor: p.backgroundColor, color: p.textColor,
                padding: `${p.paddingY || 14}px ${p.paddingX || 32}px`, borderRadius: p.borderRadius || 6,
                fontSize: p.fontSize || 16, fontWeight: 'bold', fontFamily: 'Arial, sans-serif',
                cursor: 'pointer',
              }}
            >{p.text}</span>
          </div>
        );
      case 'divider':
        return (
          <div style={{ padding: `${p.marginY || 20}px 24px` }}>
            <hr style={{ border: 'none', borderTop: `${p.thickness || 1}px solid ${p.color}`, margin: 0 }} />
          </div>
        );
      case 'spacer':
        return <div style={{ height: p.height || 32 }} className="flex items-center justify-center"><span className="text-[10px] text-muted-foreground">{p.height}px</span></div>;
      case 'columns': {
        const cols = p.columns || [];
        const count = p.columnCount || 2;
        return (
          <div style={{ padding: '12px 24px', display: 'flex', gap: p.gap || 16 }}>
            {cols.slice(0, count).map((col: any, i: number) => (
              <div key={i} style={{ flex: 1, fontSize: 14, color: '#333' }} dangerouslySetInnerHTML={{ __html: col.content || '' }} />
            ))}
          </div>
        );
      }
      case 'social': {
        const enabled = (p.platforms || []).filter((pl: any) => pl.enabled);
        return (
          <div style={{ padding: '16px 24px', textAlign: p.alignment as any }}>
            {enabled.map((pl: any, i: number) => (
              <span key={i} style={{ display: 'inline-block', margin: '0 6px', color: '#3b82f6', fontSize: 14 }}>{pl.name}</span>
            ))}
          </div>
        );
      }
      case 'footer':
        return (
          <div style={{ padding: 24, textAlign: 'center', fontSize: p.fontSize || 12, color: p.textColor, lineHeight: 1.5 }}>
            <p style={{ margin: '0 0 4px' }}>{p.companyName}</p>
            <p style={{ margin: '0 0 4px' }}>{p.address}</p>
            <p style={{ margin: 0 }}><span style={{ textDecoration: 'underline' }}>{p.unsubscribeText}</span></p>
          </div>
        );
      case 'video':
        return (
          <div style={{ padding: '12px 24px', textAlign: p.alignment as any }}>
            <img src={p.thumbnailUrl} alt={p.alt} style={{ maxWidth: '100%', display: 'inline-block' }} />
          </div>
        );
      default:
        return <div className="p-4 text-muted-foreground text-xs">Unknown block</div>;
    }
  };

  return (
    <motion.div
      onClick={onSelect}
      initial={justCreated ? { scale: 0.95, opacity: 0.5 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className={`group relative transition-all cursor-pointer ${
        isLocked ? 'cursor-default' : ''
      } ${isSelected ? 'ring-2 ring-primary rounded-sm' : 'hover:ring-1 hover:ring-border rounded-sm'}`}
    >
      {/* Hidden overlay */}
      {isHidden && (
        <div className="absolute inset-0 z-[5] bg-muted/40 backdrop-blur-[1px] flex items-center justify-center rounded-sm pointer-events-none">
          <span className="text-xs font-medium text-muted-foreground bg-background/80 px-2 py-1 rounded">Hidden</span>
        </div>
      )}

      {/* Locked badge */}
      {isLocked && (
        <div className="absolute top-1 left-1 z-[6]">
          <Lock className="h-3 w-3 text-amber-500" />
        </div>
      )}

      {/* Toolbar */}
      <div className={`absolute -top-3 right-2 z-10 flex gap-0.5 bg-card border border-border/60 rounded-md shadow-sm px-1 py-0.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        {/* Lock/Unlock */}
        {onToggleLock && (
          <button onClick={(e) => { e.stopPropagation(); onToggleLock(); }} className="p-1 hover:bg-muted/50 rounded" title={isLocked ? 'Unlock' : 'Lock'}>
            {isLocked ? <Lock className="h-3 w-3 text-amber-500" /> : <Unlock className="h-3 w-3 text-muted-foreground" />}
          </button>
        )}
        {/* Visibility */}
        {onToggleHidden && (
          <button onClick={(e) => { e.stopPropagation(); onToggleHidden(); }} className="p-1 hover:bg-muted/50 rounded" title={isHidden ? 'Show' : 'Hide'}>
            {isHidden ? <EyeOff className="h-3 w-3 text-muted-foreground" /> : <Eye className="h-3 w-3 text-muted-foreground" />}
          </button>
        )}
        {!isLocked && onMoveUp && !isFirst && (
          <button onClick={(e) => { e.stopPropagation(); onMoveUp(); }} className="p-1 hover:bg-muted/50 rounded" title="Move up">
            <ChevronUp className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
        {!isLocked && onMoveDown && !isLast && (
          <button onClick={(e) => { e.stopPropagation(); onMoveDown(); }} className="p-1 hover:bg-muted/50 rounded" title="Move down">
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
        {!isLocked && (
          <button {...(isEditing ? {} : dragHandleProps)} className="p-1 hover:bg-muted/50 rounded cursor-grab" title="Drag">
            <GripVertical className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
        <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="p-1 hover:bg-muted/50 rounded" title="Duplicate">
          <Copy className="h-3 w-3 text-muted-foreground" />
        </button>
        {!isLocked && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 hover:bg-destructive/20 rounded" title="Delete">
            <Trash2 className="h-3 w-3 text-destructive" />
          </button>
        )}
      </div>
      {renderContent()}
    </motion.div>
  );
};
