
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';

interface AIGenerateButtonProps {
  isGenerating: boolean;
  onGenerate: () => void;
  disabled: boolean;
  totalSelectedItems: number;
  mainKeyword: string | null;
}

export function AIGenerateButton({
  isGenerating,
  onGenerate,
  disabled,
  totalSelectedItems,
  mainKeyword
}: AIGenerateButtonProps) {
  return (
    <div className="pt-2">
      <Button 
        onClick={onGenerate}
        disabled={disabled || isGenerating}
        className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
        size="default"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Outline {totalSelectedItems > 0 ? `(${totalSelectedItems} items)` : ''}
          </>
        )}
      </Button>
      
      {totalSelectedItems === 0 && mainKeyword && (
        <p className="text-xs text-amber-400 mt-2 text-center">
          No items selected. We'll generate a standard outline based on your keyword.
        </p>
      )}
      
      {!mainKeyword && (
        <p className="text-xs text-amber-400 mt-2 text-center">
          Please set a main keyword before generating an outline
        </p>
      )}
    </div>
  );
}
