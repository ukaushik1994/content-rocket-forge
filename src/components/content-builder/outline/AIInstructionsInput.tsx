
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
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <PenLine className="h-4 w-4 text-neon-purple" /> 
        Additional Instructions (Optional)
      </div>
      
      <Textarea
        value={customInstructions}
        onChange={(e) => setCustomInstructions(e.target.value)}
        placeholder="Include specific topics, tone preferences, or structure requirements..."
        className="min-h-[100px] bg-white/5 border-white/10 focus:border-neon-purple/50"
      />
      
      <div className="flex justify-end">
        <Button 
          size="sm"
          variant="outline" 
          onClick={onSave}
          className="text-xs border-neon-purple/30 hover:bg-neon-purple/20"
        >
          <CheckCheck className="h-3.5 w-3.5 mr-1" />
          Save Instructions
        </Button>
      </div>
    </div>
  );
}
