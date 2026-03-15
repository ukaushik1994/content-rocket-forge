import React, { useRef, useState, useEffect, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { EmailBlock, getBlockDef } from './blockDefinitions';
import { GripVertical, Trash2, Copy, ChevronUp, ChevronDown, Lock, Unlock, Eye, EyeOff, ImagePlus, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { InlineTextToolbar } from './InlineTextToolbar';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

// Social media icon colors & letters
const SOCIAL_ICON_MAP: Record<string, { letter: string; color: string }> = {
  Twitter: { letter: '𝕏', color: '#000000' },
  LinkedIn: { letter: 'in', color: '#0077B5' },
  Facebook: { letter: 'f', color: '#1877F2' },
  Instagram: { letter: '📷', color: '#E4405F' },
  YouTube: { letter: '▶', color: '#FF0000' },
  TikTok: { letter: '♪', color: '#000000' },
  Pinterest: { letter: 'P', color: '#E60023' },
};

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
  onSaveAsReusable?: (block: EmailBlock) => void;
  dragHandleProps?: any;
  justCreated?: boolean;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block, isSelected, isFirst, isLast, onSelect, onDelete, onDuplicate,
  onMoveUp, onMoveDown, onInlineEdit, onToggleLock, onToggleHidden,
  onSaveAsReusable, dragHandleProps, justCreated,
}) => {
  const def = getBlockDef(block.type);
  const p = block.props;
  const [isEditing, setIsEditing] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);
  const isLocked = block.locked;
  const isHidden = block.hidden;
  const [spacerDragging, setSpacerDragging] = useState(false);
  const spacerStartRef = useRef<{ y: number; height: number }>({ y: 0, height: 0 });

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
    if (e.key === 'Enter' && !e.shiftKey && block.type === 'header') {
      e.preventDefault();
      handleInlineBlur(key);
      editRef.current?.blur();
    }
  };

  // Spacer drag-to-resize
  const handleSpacerMouseDown = useCallback((e: React.MouseEvent) => {
    if (isLocked) return;
    e.preventDefault();
    e.stopPropagation();
    setSpacerDragging(true);
    spacerStartRef.current = { y: e.clientY, height: p.height || 32 };

    const handleMove = (ev: MouseEvent) => {
      const delta = ev.clientY - spacerStartRef.current.y;
      const newHeight = Math.max(8, Math.min(200, spacerStartRef.current.height + delta));
      onInlineEdit?.({ height: Math.round(newHeight / 4) * 4 });
    };

    const handleUp = () => {
      setSpacerDragging(false);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, [isLocked, p.height, onInlineEdit]);

  const isDefaultImage = !p.url || p.url === '';

  // Gradient background helper
  const getGradientBg = (bgColor: string) => {
    if (p.gradientEnabled && p.gradientEndColor) {
      return `linear-gradient(${p.gradientDirection || '135deg'}, ${bgColor}, ${p.gradientEndColor})`;
    }
    return undefined;
  };

  // Border style helper
  const getBorderStyle = () => {
    if (p.borderWidth && p.borderWidth > 0) {
      return {
        border: `${p.borderWidth}px ${p.borderStyle || 'solid'} ${p.borderColor || '#e2e8f0'}`,
        borderRadius: p.borderRadius ? `${p.borderRadius}px` : undefined,
      };
    }
    return {};
  };

  const renderContent = () => {
    const blockPadding = `${p.paddingY ?? 12}px ${p.paddingX ?? 24}px`;

    switch (block.type) {
      case 'header': {
        const bg = getGradientBg(p.backgroundColor);
        return (
          <div style={{
            backgroundColor: bg ? undefined : p.backgroundColor,
            backgroundImage: bg,
            padding: `${p.paddingY || 32}px ${p.paddingX ?? 24}px`,
            textAlign: p.alignment as any,
            ...getBorderStyle(),
          }}>
            {p.logoUrl && <img src={p.logoUrl} alt="Logo" style={{ maxHeight: 40, marginBottom: 8 }} />}
            {isSelected && !isLocked && <InlineTextToolbar visible={isEditing} />}
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
      }
      case 'text':
        return (
          <div>
            {isSelected && !isLocked && <div className="px-6 pt-1"><InlineTextToolbar visible={isEditing} /></div>}
            <div
              ref={isSelected && !isLocked ? editRef : undefined}
              contentEditable={isSelected && !isLocked}
              suppressContentEditableWarning
              onFocus={() => setIsEditing(true)}
              onBlur={() => handleInlineBlur('content')}
              style={{
                padding: blockPadding, fontSize: p.fontSize || 16,
                color: p.textColor, textAlign: p.alignment as any,
                lineHeight: p.lineHeight || 1.6, outline: 'none',
                cursor: isSelected && !isLocked ? 'text' : 'pointer',
                ...getBorderStyle(),
              }}
              dangerouslySetInnerHTML={!isSelected ? { __html: DOMPurify.sanitize(p.content || '') } : undefined}
            />
          </div>
        );
      case 'image':
        if (isDefaultImage) {
          return (
            <div style={{ padding: blockPadding, textAlign: p.alignment as any }}>
              <div className="flex flex-col items-center justify-center gap-2 py-10 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10" style={getBorderStyle()}>
                <ImagePlus className="h-8 w-8 text-muted-foreground/40" />
                <span className="text-xs text-muted-foreground/60">Add image URL in inspector</span>
              </div>
            </div>
          );
        }
        return (
          <div style={{ padding: blockPadding, textAlign: p.alignment as any }}>
            <img src={p.url} alt={p.alt} style={{ width: p.width, maxWidth: '100%', display: 'inline-block', ...getBorderStyle() }} />
          </div>
        );
      case 'button': {
        const btnBg = getGradientBg(p.backgroundColor);
        return (
          <div style={{ padding: blockPadding, textAlign: p.alignment as any }}>
            <span
              className="transition-all hover:brightness-110 hover:shadow-md"
              style={{
                display: 'inline-block',
                backgroundColor: btnBg ? undefined : p.backgroundColor,
                backgroundImage: btnBg,
                color: p.textColor,
                padding: `${p.paddingY || 14}px ${p.paddingX || 32}px`,
                borderRadius: p.borderRadius || 6,
                fontSize: p.fontSize || 16, fontWeight: 'bold', fontFamily: 'Arial, sans-serif',
                cursor: 'pointer',
              }}
            >{p.text}</span>
          </div>
        );
      }
      case 'divider':
        return (
          <div style={{ padding: `${p.marginY || 20}px ${p.paddingX ?? 24}px` }}>
            <hr style={{ border: 'none', borderTop: `${p.thickness || 1}px solid ${p.color}`, margin: 0 }} />
          </div>
        );
      case 'spacer':
        return (
          <div
            style={{ height: p.height || 32, position: 'relative' }}
            className="flex items-center justify-center"
          >
            <span className="text-[10px] text-muted-foreground">{p.height || 32}px</span>
            {/* Resize handle */}
            {isSelected && !isLocked && (
              <div
                onMouseDown={handleSpacerMouseDown}
                className={`absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize flex justify-center items-center hover:bg-primary/10 transition-colors ${spacerDragging ? 'bg-primary/20' : ''}`}
              >
                <div className="w-8 h-0.5 bg-primary/40 rounded-full" />
              </div>
            )}
          </div>
        );
      case 'columns': {
        const cols = p.columns || [];
        const count = p.columnCount || 2;
        return (
          <div style={{ padding: blockPadding, display: 'flex', gap: p.gap || 16, ...getBorderStyle() }}>
            {cols.slice(0, count).map((col: any, i: number) => (
              <div key={i} style={{ flex: 1, fontSize: 14, color: '#333' }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(col.content || '') }} />
            ))}
          </div>
        );
      }
      case 'social': {
        const enabled = (p.platforms || []).filter((pl: any) => pl.enabled);
        return (
          <div style={{ padding: blockPadding, textAlign: p.alignment as any }}>
            <div style={{ display: 'inline-flex', gap: 10, alignItems: 'center' }}>
              {enabled.map((pl: any, i: number) => {
                const icon = SOCIAL_ICON_MAP[pl.name] || { letter: pl.name[0], color: '#6b7280' };
                return (
                  <div
                    key={i}
                    style={{
                      width: 36, height: 36, borderRadius: p.iconStyle === 'rounded' ? 8 : '50%',
                      backgroundColor: icon.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 14, fontWeight: 'bold', fontFamily: 'Arial, sans-serif',
                      cursor: 'pointer', transition: 'transform 0.15s',
                    }}
                    className="hover:scale-110"
                    title={pl.name}
                  >
                    {icon.letter}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
      case 'footer':
        return (
          <div style={{ padding: `${p.paddingY ?? 24}px ${p.paddingX ?? 24}px`, textAlign: 'center', fontSize: p.fontSize || 12, color: p.textColor, lineHeight: 1.5 }}>
            <p style={{ margin: '0 0 4px' }}>{p.companyName}</p>
            <p style={{ margin: '0 0 4px' }}>{p.address}</p>
            <p style={{ margin: 0 }}><span style={{ textDecoration: 'underline' }}>{p.unsubscribeText}</span></p>
          </div>
        );
      case 'video':
        return (
          <div style={{ padding: blockPadding, textAlign: p.alignment as any }}>
            <img src={p.thumbnailUrl} alt={p.alt} style={{ maxWidth: '100%', display: 'inline-block', ...getBorderStyle() }} />
          </div>
        );
      default:
        return <div className="p-4 text-muted-foreground text-xs">Unknown block</div>;
    }
  };

  return (
    <motion.div
      onClick={onSelect}
      initial={justCreated ? { scale: 0.95, opacity: 0.5, boxShadow: '0 0 0 3px hsl(var(--primary) / 0.3)' } : false}
      animate={{ scale: 1, opacity: 1, boxShadow: '0 0 0 0px transparent' }}
      transition={{ duration: 0.35 }}
      className={`group relative transition-all cursor-pointer ${
        isLocked ? 'cursor-default' : ''
      } ${isSelected
        ? 'ring-2 ring-primary rounded-sm'
        : 'hover:ring-1 hover:ring-border hover:shadow-sm hover:-translate-y-[0.5px] rounded-sm'
      }`}
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
        {onToggleLock && (
          <button onClick={(e) => { e.stopPropagation(); onToggleLock(); }} className="p-1 hover:bg-muted/50 rounded" title={isLocked ? 'Unlock' : 'Lock'}>
            {isLocked ? <Lock className="h-3 w-3 text-amber-500" /> : <Unlock className="h-3 w-3 text-muted-foreground" />}
          </button>
        )}
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
        {onSaveAsReusable && (
          <button onClick={(e) => { e.stopPropagation(); onSaveAsReusable(block); }} className="p-1 hover:bg-muted/50 rounded" title="Save as reusable">
            <Bookmark className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
        {!isLocked && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 hover:bg-destructive/20 rounded" title="Delete">
            <Trash2 className="h-3 w-3 text-destructive" />
          </button>
        )}
      </div>

      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div>{renderContent()}</div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem onClick={onDuplicate}>
            <Copy className="h-3.5 w-3.5 mr-2" /> Duplicate
          </ContextMenuItem>
          {!isLocked && onMoveUp && !isFirst && (
            <ContextMenuItem onClick={onMoveUp}>
              <ChevronUp className="h-3.5 w-3.5 mr-2" /> Move Up
            </ContextMenuItem>
          )}
          {!isLocked && onMoveDown && !isLast && (
            <ContextMenuItem onClick={onMoveDown}>
              <ChevronDown className="h-3.5 w-3.5 mr-2" /> Move Down
            </ContextMenuItem>
          )}
          <ContextMenuSeparator />
          {onToggleLock && (
            <ContextMenuItem onClick={onToggleLock}>
              {isLocked ? <Unlock className="h-3.5 w-3.5 mr-2" /> : <Lock className="h-3.5 w-3.5 mr-2" />}
              {isLocked ? 'Unlock' : 'Lock'}
            </ContextMenuItem>
          )}
          {onToggleHidden && (
            <ContextMenuItem onClick={onToggleHidden}>
              {isHidden ? <Eye className="h-3.5 w-3.5 mr-2" /> : <EyeOff className="h-3.5 w-3.5 mr-2" />}
              {isHidden ? 'Show' : 'Hide'}
            </ContextMenuItem>
          )}
          {onSaveAsReusable && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => onSaveAsReusable(block)}>
                <Bookmark className="h-3.5 w-3.5 mr-2" /> Save as Reusable
              </ContextMenuItem>
            </>
          )}
          {!isLocked && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
    </motion.div>
  );
};
