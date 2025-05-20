
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { getFormatByIdOrDefault } from '../formats';
import FormatButton from './FormatButton';

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
  return (
    <div className="flex gap-1 overflow-x-auto py-1 custom-scrollbar max-w-[300px]">
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
});

FormatSelector.displayName = 'FormatSelector';

export default FormatSelector;
