
import React from 'react';
import { getFormatByIdOrDefault } from '../formats';
import FormatButton from './FormatButton';
import { motion } from 'framer-motion';

interface FormatSelectorProps {
  generatedFormats: string[];
  activeFormat: string | null;
  setActiveFormat: (format: string) => void;
}

const FormatSelector: React.FC<FormatSelectorProps> = ({ 
  generatedFormats, 
  activeFormat, 
  setActiveFormat 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-2 overflow-x-auto py-1 scrollbar-none"
    >
      {generatedFormats.map((formatId, index) => {
        const format = getFormatByIdOrDefault(formatId);
        return (
          <motion.div
            key={formatId}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
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
    </motion.div>
  );
};

export default FormatSelector;
