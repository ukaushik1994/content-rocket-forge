import React from 'react';
import { GlobalStyles } from './htmlExporter';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette } from 'lucide-react';
import { ColorPickerField } from './ColorPickerField';

interface GlobalStylesPanelProps {
  styles: GlobalStyles;
  onChange: (styles: GlobalStyles) => void;
}

const FONT_OPTIONS = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, Arial, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: "'Trebuchet MS', sans-serif", label: 'Trebuchet MS' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: "'Times New Roman', serif", label: 'Times New Roman' },
  { value: "'Courier New', monospace", label: 'Courier New' },
  { value: 'Tahoma, sans-serif', label: 'Tahoma' },
];

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    {children}
  </div>
);

export const GlobalStylesPanel: React.FC<GlobalStylesPanelProps> = ({ styles, onChange }) => {
  const set = (key: keyof GlobalStyles, value: any) => onChange({ ...styles, [key]: value });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border/40">
        <Palette className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Email Styles</span>
      </div>
      <ColorPickerField label="Email Background" value={styles.bgColor} onChange={v => set('bgColor', v)} />
      <ColorPickerField label="Content Background" value={styles.contentBgColor} onChange={v => set('contentBgColor', v)} />
      <Field label={`Content Width: ${styles.contentWidth}px`}>
        <Slider min={400} max={800} step={10} value={[styles.contentWidth]} onValueChange={([v]) => set('contentWidth', v)} />
      </Field>
      <Field label="Default Font">
        <Select value={styles.fontFamily} onValueChange={v => set('fontFamily', v)}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {FONT_OPTIONS.map(f => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
};
