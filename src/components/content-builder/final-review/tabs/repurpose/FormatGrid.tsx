
import React from 'react';
import { Button } from '@/components/ui/button';
import FormatOption from './FormatOption';
import { contentFormats } from '@/components/content-repurposing/formats';
import { getPromptTemplatesByType } from '@/services/userPreferencesService';

interface FormatGridProps {
  selectedContentTypes: string[];
  availableTemplates: Record<string, any[]>;
  onToggle: (formatId: string) => void;
  onSelectAll: () => void;
}

export const FormatGrid: React.FC<FormatGridProps> = ({
  selectedContentTypes,
  availableTemplates,
  onToggle,
  onSelectAll,
}) => {
  // Get template info for a specific format
  const getTemplateInfo = (formatId: string) => {
    // Check for custom templates first
    const customTemplates = getPromptTemplatesByType(formatId);
    if (customTemplates.length > 0) {
      return `${customTemplates.length} custom template${customTemplates.length > 1 ? 's' : ''} available`;
    }
    
    // Fallback to availableTemplates prop for backwards compatibility
    const templates = availableTemplates[formatId] || [];
    if (templates.length > 0) {
      return `${templates.length} template${templates.length > 1 ? 's' : ''} available`;
    }
    
    return 'Default template will be used';
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={onSelectAll}>
          {selectedContentTypes.length === contentFormats.length ? 'Deselect All' : 'Select All'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {contentFormats.map(format => (
          <FormatOption
            key={format.id}
            format={format}
            isSelected={selectedContentTypes.includes(format.id)}
            onToggle={() => onToggle(format.id)}
            templateInfo={getTemplateInfo(format.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default FormatGrid;
