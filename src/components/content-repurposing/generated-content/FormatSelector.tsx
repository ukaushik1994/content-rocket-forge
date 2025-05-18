
import React from 'react';
import { contentFormats } from '@/components/content-builder/final-review/tabs/RepurposeTab';
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
        const format = contentFormats.find(f => f.id === formatId);
        return (
          <FormatButton
            key={formatId}
            formatId={formatId}
            name={format?.name || formatId}
            isActive={activeFormat === formatId}
            onClick={() => setActiveFormat(formatId)}
          />
        );
      })}
    </div>
  );
};

export default FormatSelector;
