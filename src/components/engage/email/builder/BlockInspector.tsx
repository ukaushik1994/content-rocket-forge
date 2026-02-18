import React from 'react';
import { EmailBlock, getBlockDef } from './blockDefinitions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Trash2, Lock, Unlock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { GlobalStyles } from './htmlExporter';
import { GlobalStylesPanel } from './GlobalStylesPanel';
import { ColorPickerField } from './ColorPickerField';

interface BlockInspectorProps {
  block: EmailBlock | null;
  onUpdate: (id: string, props: Record<string, any>) => void;
  onDelete: (id: string) => void;
  onToggleLock?: (id: string) => void;
  onToggleHidden?: (id: string) => void;
  globalStyles?: GlobalStyles;
  onUpdateGlobalStyles?: (styles: GlobalStyles) => void;
}

const AlignmentSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
    <SelectContent>
      <SelectItem value="left">Left</SelectItem>
      <SelectItem value="center">Center</SelectItem>
      <SelectItem value="right">Right</SelectItem>
    </SelectContent>
  </Select>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    {children}
  </div>
);

// Universal padding controls
const PaddingControls = ({ p, set }: { p: Record<string, any>; set: (key: string, value: any) => void }) => (
  <div className="space-y-2 pt-2 border-t border-border/30">
    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Spacing</p>
    <Field label={`Horizontal Padding: ${p.paddingX ?? 24}px`}>
      <Slider min={0} max={60} step={4} value={[p.paddingX ?? 24]} onValueChange={([v]) => set('paddingX', v)} />
    </Field>
    <Field label={`Vertical Padding: ${p.paddingY ?? 12}px`}>
      <Slider min={0} max={60} step={4} value={[p.paddingY ?? 12]} onValueChange={([v]) => set('paddingY', v)} />
    </Field>
  </div>
);

// Gradient controls
const GradientControls = ({ p, set }: { p: Record<string, any>; set: (key: string, value: any) => void }) => (
  <div className="space-y-2 pt-2 border-t border-border/30">
    <div className="flex items-center justify-between">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Gradient</p>
      <Switch checked={p.gradientEnabled || false} onCheckedChange={v => set('gradientEnabled', v)} />
    </div>
    {p.gradientEnabled && (
      <>
        <ColorPickerField label="End Color" value={p.gradientEndColor || '#8b5cf6'} onChange={v => set('gradientEndColor', v)} />
        <Field label="Direction">
          <Select value={p.gradientDirection || '135deg'} onValueChange={v => set('gradientDirection', v)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0deg">Top → Bottom</SelectItem>
              <SelectItem value="90deg">Left → Right</SelectItem>
              <SelectItem value="135deg">Diagonal ↘</SelectItem>
              <SelectItem value="180deg">Bottom → Top</SelectItem>
              <SelectItem value="270deg">Right → Left</SelectItem>
              <SelectItem value="315deg">Diagonal ↗</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </>
    )}
  </div>
);

// Border controls
const BorderControls = ({ p, set }: { p: Record<string, any>; set: (key: string, value: any) => void }) => (
  <div className="space-y-2 pt-2 border-t border-border/30">
    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Border</p>
    <Field label={`Width: ${p.borderWidth || 0}px`}>
      <Slider min={0} max={8} step={1} value={[p.borderWidth || 0]} onValueChange={([v]) => set('borderWidth', v)} />
    </Field>
    {(p.borderWidth || 0) > 0 && (
      <>
        <ColorPickerField label="Border Color" value={p.borderColor || '#e2e8f0'} onChange={v => set('borderColor', v)} />
        <Field label="Style">
          <Select value={p.borderStyle || 'solid'} onValueChange={v => set('borderStyle', v)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid</SelectItem>
              <SelectItem value="dashed">Dashed</SelectItem>
              <SelectItem value="dotted">Dotted</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label={`Border Radius: ${p.borderRadius || 0}px`}>
          <Slider min={0} max={24} step={1} value={[p.borderRadius || 0]} onValueChange={([v]) => set('borderRadius', v)} />
        </Field>
      </>
    )}
  </div>
);

export const BlockInspector: React.FC<BlockInspectorProps> = ({ block, onUpdate, onDelete, onToggleLock, onToggleHidden, globalStyles, onUpdateGlobalStyles }) => {
  if (!block) {
    return (
      <div className="w-64 shrink-0 border-l border-border/50 bg-card/80 overflow-y-auto p-4">
        {globalStyles && onUpdateGlobalStyles ? (
          <GlobalStylesPanel styles={globalStyles} onChange={onUpdateGlobalStyles} />
        ) : (
          <p className="text-xs text-muted-foreground text-center">Select a block to edit its properties</p>
        )}
      </div>
    );
  }

  const def = getBlockDef(block.type);
  const p = block.props;
  const set = (key: string, value: any) => onUpdate(block.id, { [key]: value });

  // Which block types support which extra controls
  const hasPadding = ['header', 'text', 'image', 'button', 'columns', 'social', 'footer', 'video', 'divider'].includes(block.type);
  const hasGradient = ['header', 'button'].includes(block.type);
  const hasBorder = ['text', 'image', 'columns', 'video'].includes(block.type);

  const renderFields = () => {
    switch (block.type) {
      case 'header':
        return (
          <>
            <Field label="Heading Text"><Input className="h-8 text-xs" value={p.text} onChange={e => set('text', e.target.value)} /></Field>
            <Field label="Logo URL"><Input className="h-8 text-xs" value={p.logoUrl} onChange={e => set('logoUrl', e.target.value)} placeholder="https://..." /></Field>
            <Field label="Alignment"><AlignmentSelect value={p.alignment} onChange={v => set('alignment', v)} /></Field>
            <Field label="Font Size"><Slider min={16} max={48} step={1} value={[p.fontSize || 28]} onValueChange={([v]) => set('fontSize', v)} /></Field>
            <ColorPickerField label="Background Color" value={p.backgroundColor} onChange={v => set('backgroundColor', v)} />
            <ColorPickerField label="Text Color" value={p.textColor} onChange={v => set('textColor', v)} />
          </>
        );
      case 'text':
        return (
          <>
            <Field label="Content (HTML)"><Textarea className="text-xs min-h-[100px]" value={p.content} onChange={e => set('content', e.target.value)} /></Field>
            <Field label="Alignment"><AlignmentSelect value={p.alignment} onChange={v => set('alignment', v)} /></Field>
            <Field label="Font Size"><Slider min={10} max={24} step={1} value={[p.fontSize || 16]} onValueChange={([v]) => set('fontSize', v)} /></Field>
            <ColorPickerField label="Text Color" value={p.textColor} onChange={v => set('textColor', v)} />
            <Field label="Line Height"><Slider min={1} max={2.5} step={0.1} value={[p.lineHeight || 1.6]} onValueChange={([v]) => set('lineHeight', v)} /></Field>
          </>
        );
      case 'image':
        return (
          <>
            <Field label="Image URL"><Input className="h-8 text-xs" value={p.url} onChange={e => set('url', e.target.value)} placeholder="https://..." /></Field>
            <Field label="Alt Text"><Input className="h-8 text-xs" value={p.alt} onChange={e => set('alt', e.target.value)} /></Field>
            <Field label="Link URL"><Input className="h-8 text-xs" value={p.linkUrl} onChange={e => set('linkUrl', e.target.value)} placeholder="Optional" /></Field>
            <Field label="Width"><Input className="h-8 text-xs" value={p.width} onChange={e => set('width', e.target.value)} placeholder="100% or 300px" /></Field>
            <Field label="Alignment"><AlignmentSelect value={p.alignment} onChange={v => set('alignment', v)} /></Field>
          </>
        );
      case 'button':
        return (
          <>
            <Field label="Button Text"><Input className="h-8 text-xs" value={p.text} onChange={e => set('text', e.target.value)} /></Field>
            <Field label="URL"><Input className="h-8 text-xs" value={p.url} onChange={e => set('url', e.target.value)} /></Field>
            <Field label="Alignment"><AlignmentSelect value={p.alignment} onChange={v => set('alignment', v)} /></Field>
            <ColorPickerField label="Button Color" value={p.backgroundColor} onChange={v => set('backgroundColor', v)} />
            <ColorPickerField label="Text Color" value={p.textColor} onChange={v => set('textColor', v)} />
            <Field label="Border Radius"><Slider min={0} max={24} step={1} value={[p.borderRadius || 6]} onValueChange={([v]) => set('borderRadius', v)} /></Field>
            <Field label="Font Size"><Slider min={12} max={24} step={1} value={[p.fontSize || 16]} onValueChange={([v]) => set('fontSize', v)} /></Field>
          </>
        );
      case 'divider':
        return (
          <>
            <ColorPickerField label="Color" value={p.color} onChange={v => set('color', v)} />
            <Field label="Thickness"><Slider min={1} max={6} step={1} value={[p.thickness || 1]} onValueChange={([v]) => set('thickness', v)} /></Field>
            <Field label="Vertical Margin"><Slider min={4} max={48} step={4} value={[p.marginY || 20]} onValueChange={([v]) => set('marginY', v)} /></Field>
          </>
        );
      case 'spacer':
        return (
          <Field label={`Height: ${p.height || 32}px`}>
            <Slider min={8} max={120} step={4} value={[p.height || 32]} onValueChange={([v]) => set('height', v)} />
          </Field>
        );
      case 'columns':
        return (
          <>
            <Field label="Columns">
              <Select value={String(p.columnCount || 2)} onValueChange={v => {
                const count = parseInt(v);
                const cols = [...(p.columns || [])];
                while (cols.length < count) cols.push({ content: '<p>New column</p>' });
                set('columnCount', count);
                onUpdate(block.id, { columnCount: count, columns: cols });
              }}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {(p.columns || []).slice(0, p.columnCount || 2).map((col: any, i: number) => (
              <Field key={i} label={`Column ${i + 1} (HTML)`}>
                <Textarea className="text-xs min-h-[60px]" value={col.content} onChange={e => {
                  const cols = [...(p.columns || [])];
                  cols[i] = { ...cols[i], content: e.target.value };
                  set('columns', cols);
                }} />
              </Field>
            ))}
          </>
        );
      case 'social':
        return (
          <>
            <Field label="Alignment"><AlignmentSelect value={p.alignment} onChange={v => set('alignment', v)} /></Field>
            <Field label="Icon Style">
              <Select value={p.iconStyle || 'filled'} onValueChange={v => set('iconStyle', v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="filled">Circle</SelectItem>
                  <SelectItem value="rounded">Rounded</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {(p.platforms || []).map((pl: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <Switch checked={pl.enabled} onCheckedChange={v => {
                  const platforms = [...p.platforms];
                  platforms[i] = { ...platforms[i], enabled: v };
                  set('platforms', platforms);
                }} />
                <span className="text-xs flex-1">{pl.name}</span>
                <Input className="h-7 text-xs w-24" value={pl.url} onChange={e => {
                  const platforms = [...p.platforms];
                  platforms[i] = { ...platforms[i], url: e.target.value };
                  set('platforms', platforms);
                }} placeholder="URL" />
              </div>
            ))}
          </>
        );
      case 'footer':
        return (
          <>
            <Field label="Company Name"><Input className="h-8 text-xs" value={p.companyName} onChange={e => set('companyName', e.target.value)} /></Field>
            <Field label="Address"><Textarea className="text-xs min-h-[60px]" value={p.address} onChange={e => set('address', e.target.value)} /></Field>
            <Field label="Unsubscribe Text"><Input className="h-8 text-xs" value={p.unsubscribeText} onChange={e => set('unsubscribeText', e.target.value)} /></Field>
            <ColorPickerField label="Text Color" value={p.textColor} onChange={v => set('textColor', v)} />
          </>
        );
      case 'video':
        return (
          <>
            <Field label="Thumbnail URL"><Input className="h-8 text-xs" value={p.thumbnailUrl} onChange={e => set('thumbnailUrl', e.target.value)} /></Field>
            <Field label="Video URL"><Input className="h-8 text-xs" value={p.videoUrl} onChange={e => set('videoUrl', e.target.value)} /></Field>
            <Field label="Alt Text"><Input className="h-8 text-xs" value={p.alt} onChange={e => set('alt', e.target.value)} /></Field>
            <Field label="Alignment"><AlignmentSelect value={p.alignment} onChange={v => set('alignment', v)} /></Field>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-64 shrink-0 border-l border-border/50 bg-card/80 overflow-y-auto">
      <div className="p-3 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <def.icon className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{def.label}</span>
        </div>
        <div className="flex items-center gap-0.5">
          {onToggleLock && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onToggleLock(block.id)} title={block.locked ? 'Unlock' : 'Lock'}>
              {block.locked ? <Lock className="h-3.5 w-3.5 text-amber-500" /> : <Unlock className="h-3.5 w-3.5 text-muted-foreground" />}
            </Button>
          )}
          {onToggleHidden && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onToggleHidden(block.id)} title={block.hidden ? 'Show' : 'Hide'}>
              {block.hidden ? <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> : <Eye className="h-3.5 w-3.5 text-muted-foreground" />}
            </Button>
          )}
          {!block.locked && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(block.id)}>
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          )}
        </div>
      </div>
      <div className="p-3 space-y-3">
        {renderFields()}
        {hasPadding && <PaddingControls p={p} set={set} />}
        {hasGradient && <GradientControls p={p} set={set} />}
        {hasBorder && <BorderControls p={p} set={set} />}
      </div>
    </div>
  );
};
