
import React from 'react';
import { getFormatByIdOrDefault } from '../formats';
import FormatButton from './FormatButton';

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
    <div className="flex gap-2 overflow-x-auto py-1">
      {generatedFormats.map((formatId) => {
        const format = getFormatByIdOrDefault(formatId);
        return (
          <FormatButton
            key={formatId}
            formatId={formatId}
            name={format.name}
            isActive={activeFormat === formatId}
            onClick={() => setActiveFormat(formatId)}
          />
        );
      })}
    </div>
  );
};

export default FormatSelector;
