
import React from 'react';
import { PromptTemplate } from '@/services/userPreferencesService';
import { TemplateCard } from './TemplateCard';
import { EmptyTemplatesState } from './EmptyTemplatesState';
import { getFormatTypeLabel } from './types';

interface TemplateGridProps {
  templates: PromptTemplate[];
  activeTab: string;
  onNewTemplate: () => void;
  onEditTemplate: (template: PromptTemplate) => void;
  onDuplicateTemplate: (template: PromptTemplate) => void;
  onDeleteTemplate: (template: PromptTemplate) => void;
  onPreviewTemplate: (template: PromptTemplate) => void;
}

export const TemplateGrid: React.FC<TemplateGridProps> = ({
  templates,
  activeTab,
  onNewTemplate,
  onEditTemplate,
  onDuplicateTemplate,
  onDeleteTemplate,
  onPreviewTemplate
}) => {
  if (templates.length === 0) {
    return (
      <EmptyTemplatesState 
        activeTab={activeTab} 
        formatTypeLabel={getFormatTypeLabel(activeTab)} 
        onCreateNew={onNewTemplate}
      />
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onEdit={onEditTemplate}
          onDuplicate={onDuplicateTemplate}
          onDelete={onDeleteTemplate}
          onPreview={onPreviewTemplate}
        />
      ))}
    </div>
  );
};
