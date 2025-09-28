
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PenLine, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';

interface AIInstructionsInputProps {
  customInstructions: string;
  setCustomInstructions: (value: string) => void;
  onSave: () => void;
}

export function AIInstructionsInput({ 
  customInstructions, 
  setCustomInstructions,
  onSave
}: AIInstructionsInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium">
        <PenLine className="h-3.5 w-3.5 text-neon-purple" /> 
        Additional Instructions (Optional)
      </div>
      
      <Textarea
        value={customInstructions}
        onChange={(e) => setCustomInstructions(e.target.value)}
        placeholder="Include specific topics, tone preferences, or structure requirements..."
        className="min-h-[60px] bg-white/5 border-white/10 focus:border-neon-purple/50 text-sm"
      />
      
      <div className="flex justify-end">
        <Button 
          size="sm"
          variant="outline" 
          onClick={onSave}
          className="text-xs border-neon-purple/30 hover:bg-neon-purple/20 h-7 px-2"
        >
          <CheckCheck className="h-3 w-3 mr-1" />
          Save
        </Button>
      </div>
    </div>
  );
}
