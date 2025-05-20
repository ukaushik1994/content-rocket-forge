
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { getFormatByIdOrDefault, getFormatIconComponent } from '../formats';
import FormatButton from './FormatButton';
import { ChevronDown } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface FormatSelectorProps {
  generatedFormats: string[];
  activeFormat: string | null;
  setActiveFormat: (format: string) => void;
}

const FormatSelector: React.FC<FormatSelectorProps> = memo(({ 
  generatedFormats, 
  activeFormat, 
  setActiveFormat 
}) => {
  // If we have a current active format, get its details
  const activeFormatDetails = activeFormat ? getFormatByIdOrDefault(activeFormat) : null;
  
  // For larger screens, we can display multiple buttons
  if (generatedFormats.length <= 3) {
    return (
      <div className="flex gap-1 overflow-x-auto py-1 custom-scrollbar">
        {generatedFormats.map((formatId, index) => {
          const format = getFormatByIdOrDefault(formatId);
          return (
            <motion.div
              key={formatId}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <FormatButton
                formatId={formatId}
                name={format.name}
                isActive={activeFormat === formatId}
                onClick={() => setActiveFormat(formatId)}
              />
            </motion.div>
          );
        })}
      </div>
    );
  }
  
  // For many formats or smaller screens, use a dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={activeFormat ? 
            "bg-gradient-to-r from-neon-purple/30 to-neon-blue/30 border-white/10 hover:border-white/20" : 
            "glass-button"
          }
        >
          {activeFormatDetails ? (
            <>
              {React.createElement(getFormatIconComponent(activeFormat), { className: "h-4 w-4 mr-1" })}
              <span className="max-w-[100px] truncate">{activeFormatDetails.name}</span>
            </>
          ) : (
            <span>Select Format</span>
          )}
          <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-black/80 backdrop-blur-xl border-white/10 text-white">
        <DropdownMenuLabel>Select Format</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        {generatedFormats.map((formatId) => {
          const format = getFormatByIdOrDefault(formatId);
          const IconComponent = getFormatIconComponent(formatId);
          return (
            <DropdownMenuItem
              key={formatId}
              className={`flex items-center gap-2 cursor-pointer ${
                activeFormat === formatId ? "bg-white/10" : "hover:bg-white/5"
              }`}
              onClick={() => setActiveFormat(formatId)}
            >
              <IconComponent className="h-4 w-4" />
              <span>{format.name}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

FormatSelector.displayName = 'FormatSelector';

export default FormatSelector;
