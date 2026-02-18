import React from 'react';
import { EmailBlock, getBlockDef } from './blockDefinitions';
import { GripVertical, Trash2, Copy } from 'lucide-react';

interface BlockRendererProps {
  block: EmailBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  dragHandleProps?: any;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block, isSelected, onSelect, onDelete, onDuplicate, dragHandleProps,
}) => {
  const def = getBlockDef(block.type);
  const p = block.props;

  const renderContent = () => {
    switch (block.type) {
      case 'header':
        return (
          <div style={{ backgroundColor: p.backgroundColor, padding: `${p.paddingY || 32}px 24px`, textAlign: p.alignment as any }}>
            {p.logoUrl && <img src={p.logoUrl} alt="Logo" style={{ maxHeight: 40, marginBottom: 8 }} />}
            <h1 style={{ margin: 0, fontSize: p.fontSize || 28, color: p.textColor, fontFamily: 'Arial, sans-serif' }}>{p.text}</h1>
          </div>
        );
      case 'text':
        return (
          <div style={{ padding: `${p.paddingY || 12}px 24px`, fontSize: p.fontSize || 16, color: p.textColor, textAlign: p.alignment as any, lineHeight: p.lineHeight || 1.6 }}
            dangerouslySetInnerHTML={{ __html: p.content }}
          />
        );
      case 'image':
        return (
          <div style={{ padding: '12px 24px', textAlign: p.alignment as any }}>
            <img src={p.url} alt={p.alt} style={{ width: p.width, maxWidth: '100%', display: 'inline-block' }} />
          </div>
        );
      case 'button':
        return (
          <div style={{ padding: '16px 24px', textAlign: p.alignment as any }}>
            <span style={{
              display: 'inline-block', backgroundColor: p.backgroundColor, color: p.textColor,
              padding: `${p.paddingY || 14}px ${p.paddingX || 32}px`, borderRadius: p.borderRadius || 6,
              fontSize: p.fontSize || 16, fontWeight: 'bold', fontFamily: 'Arial, sans-serif',
            }}>{p.text}</span>
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
    <div
      onClick={onSelect}
      className={`group relative transition-all cursor-pointer ${isSelected ? 'ring-2 ring-primary rounded-sm' : 'hover:ring-1 hover:ring-border rounded-sm'}`}
    >
      {/* Toolbar */}
      <div className={`absolute -top-3 right-2 z-10 flex gap-0.5 bg-card border border-border/60 rounded-md shadow-sm px-1 py-0.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <button {...dragHandleProps} className="p-1 hover:bg-muted/50 rounded cursor-grab" title="Drag">
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="p-1 hover:bg-muted/50 rounded" title="Duplicate">
          <Copy className="h-3 w-3 text-muted-foreground" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 hover:bg-destructive/20 rounded" title="Delete">
          <Trash2 className="h-3 w-3 text-destructive" />
        </button>
      </div>
      {renderContent()}
    </div>
  );
};
