
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Check, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SaveStatusBarProps {
  activeFormat: string | null;
  savedFormats: string[];
  totalFormats: number;
  onSaveAll: () => void;
  isSavingAll?: boolean;
}

export const SaveStatusBar: React.FC<SaveStatusBarProps> = ({
  activeFormat,
  savedFormats,
  totalFormats,
  onSaveAll,
  isSavingAll = false
}) => {
  const isCurrentFormatSaved = activeFormat ? savedFormats.includes(activeFormat) : false;
  const allSaved = totalFormats > 0 && savedFormats.length === totalFormats;
  
  return (
    <div className="flex items-center justify-between py-2 px-4 bg-slate-900/50 border-t border-white/10">
      <div className="flex items-center gap-2">
        {isCurrentFormatSaved ? (
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/40 flex items-center gap-1">
            <Check className="h-3 w-3" />
            Saved
          </Badge>
        ) : activeFormat ? (
          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/40 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Unsaved
          </Badge>
        ) : null}
        
        <span className="text-xs text-white/60">
          {savedFormats.length} of {totalFormats} format{totalFormats !== 1 ? 's' : ''} saved
        </span>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "text-xs",
          allSaved 
            ? "bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/40" 
            : "bg-white/5 hover:bg-white/10 border-white/10"
        )}
        onClick={onSaveAll}
        disabled={totalFormats === 0 || isSavingAll}
      >
        {isSavingAll ? (
          <>
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Saving All...
          </>
        ) : allSaved ? (
          <>
            <Check className="mr-1 h-3 w-3" />
            All Saved
          </>
        ) : (
          <>
            <Save className="mr-1 h-3 w-3" />
            Save All Formats
          </>
        )}
      </Button>
    </div>
  );
};
