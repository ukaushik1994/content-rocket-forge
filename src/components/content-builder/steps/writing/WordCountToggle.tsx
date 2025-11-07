import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Brain, Edit3, Hash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface WordCountToggleProps {
  mode: 'ai' | 'custom';
  onModeChange: (mode: 'ai' | 'custom') => void;
  aiEstimate: number | null;
  customValue: number;
  onCustomValueChange: (value: number) => void;
}

export const WordCountToggle: React.FC<WordCountToggleProps> = ({
  mode,
  onModeChange,
  aiEstimate,
  customValue,
  onCustomValueChange
}) => {
  return (
    <div className="flex items-center gap-3 bg-background/50 border border-border rounded-lg p-2">
      {/* Toggle Switch */}
      <ToggleGroup 
        type="single" 
        value={mode} 
        onValueChange={(value) => value && onModeChange(value as 'ai' | 'custom')}
        className="bg-muted/30 rounded-md"
      >
        <ToggleGroupItem 
          value="ai" 
          aria-label="AI Decide"
          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          <Brain className="h-4 w-4 mr-1.5" />
          AI Decide
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="custom" 
          aria-label="Custom"
          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          <Edit3 className="h-4 w-4 mr-1.5" />
          Custom
        </ToggleGroupItem>
      </ToggleGroup>
      
      {/* Display/Input Area */}
      <div className="flex items-center gap-2">
        <Hash className="h-4 w-4 text-muted-foreground" />
        {mode === 'ai' ? (
          <Badge variant="secondary" className="h-8 px-3 text-sm font-medium">
            {aiEstimate || 1500} words
            <span className="ml-1.5 text-xs text-muted-foreground">(AI estimate)</span>
          </Badge>
        ) : (
          <Input 
            type="number"
            value={customValue}
            onChange={(e) => onCustomValueChange(parseInt(e.target.value) || 0)}
            className="w-24 h-8 text-sm"
            placeholder="1500"
            min="100"
          />
        )}
      </div>
    </div>
  );
};
