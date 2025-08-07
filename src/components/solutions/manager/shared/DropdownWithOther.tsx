import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DropdownWithOtherProps {
  id?: string;
  label: string;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onValueChange: (value: string) => void;
  customValue?: string;
  onCustomValueChange?: (value: string) => void;
  showCustomInput?: boolean;
  customInputLabel?: string;
  customInputPlaceholder?: string;
  required?: boolean;
}

export const DropdownWithOther: React.FC<DropdownWithOtherProps> = ({
  id,
  label,
  placeholder,
  options,
  value,
  onValueChange,
  customValue,
  onCustomValueChange,
  showCustomInput = true,
  customInputLabel = 'Specify',
  customInputPlaceholder = 'Enter custom value',
  required = false
}) => {
  const showOtherInput = value === 'Other' && showCustomInput;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-background border shadow-lg z-50">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
          <SelectItem value="Other">Other</SelectItem>
        </SelectContent>
      </Select>
      
      {showOtherInput && (
        <div className="space-y-2">
          <Label htmlFor={`${id}-custom`}>{customInputLabel}</Label>
          <Input
            id={`${id}-custom`}
            placeholder={customInputPlaceholder}
            value={customValue || ''}
            onChange={(e) => onCustomValueChange?.(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};