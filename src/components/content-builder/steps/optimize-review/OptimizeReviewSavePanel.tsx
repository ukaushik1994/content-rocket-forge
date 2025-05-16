
import React from 'react';
import { SaveAndExportPanel } from '../../final-review/SaveAndExportPanel';

interface OptimizeReviewSavePanelProps {
  completionPercentage: number;
  onSave: () => Promise<void | string | null>;
  onPublish: () => Promise<void | string | null>;
  isSaving: boolean;
  isSavedToDraft: boolean;
}

export const OptimizeReviewSavePanel: React.FC<OptimizeReviewSavePanelProps> = ({
  completionPercentage,
  onSave,
  onPublish,
  isSaving,
  isSavedToDraft
}) => {
  return (
    <SaveAndExportPanel 
      completionPercentage={completionPercentage}
      onSave={onSave}
      onPublish={onPublish}
      isSaving={isSaving}
      isSavedToDraft={isSavedToDraft}
    />
  );
};
