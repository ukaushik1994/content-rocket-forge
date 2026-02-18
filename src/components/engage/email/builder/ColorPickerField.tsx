import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColorPickerFieldProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

const PRESET_COLORS = [
  '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6',
  '#ec4899', '#14b8a6', '#06b6d4', '#6366f1', '#f43f5e', '#0ea5e9',
  '#1e293b', '#1a1a2e', '#0f172a', '#fef3c7', '#fef2f2', '#f0fdf4',
];

export const ColorPickerField: React.FC<ColorPickerFieldProps> = ({ value, onChange, label }) => {
  const [hex, setHex] = useState(value);

  const handleHexChange = (v: string) => {
    setHex(v);
    if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v);
  };

  const handleNativeChange = (v: string) => {
    setHex(v);
    onChange(v);
  };

  return (
    <div className="space-y-1">
      {label && <Label className="text-xs text-muted-foreground">{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 w-full h-8 px-2 rounded-md border border-input bg-background text-xs hover:bg-accent/50 transition-colors">
            <div className="h-4 w-4 rounded-sm border border-border/60 shrink-0" style={{ backgroundColor: value }} />
            <span className="text-muted-foreground font-mono flex-1 text-left">{value}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3 space-y-3" align="start">
          <div className="grid grid-cols-6 gap-1.5">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => { setHex(c); onChange(c); }}
                className={`h-6 w-6 rounded-sm border transition-all hover:scale-110 ${c === value ? 'ring-2 ring-primary ring-offset-1' : 'border-border/40'}`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value}
              onChange={e => handleNativeChange(e.target.value)}
              className="h-7 w-7 rounded cursor-pointer border-0 p-0"
            />
            <Input
              value={hex}
              onChange={e => handleHexChange(e.target.value)}
              className="h-7 text-xs font-mono flex-1"
              placeholder="#000000"
              maxLength={7}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
