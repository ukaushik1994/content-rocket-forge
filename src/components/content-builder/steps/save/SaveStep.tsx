
import React, { useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card, CardContent } from '@/components/ui/card';
import { useSaveStep } from './useSaveStep';
import { ContentDetailsCard } from './ContentDetailsCard';
import { ContentSummaryCard } from './ContentSummaryCard';
import { SaveActions } from './SaveActions';
import { SaveAlreadyExistsAlert } from './SaveAlreadyExistsAlert';
import { SaveStepOptimizationsAlert } from './SaveStepOptimizationsAlert';

export const SaveStep = () => {
  const { state, dispatch } = useContentBuilder();
  const { 
    isSaving, 
    contentTitle, 
    setContentTitle,
    contentNote,
    setContentNote,
    handleSave,
    handlePublish,
    needsOptimization,
    contentExists,
    contentId
  } = useSaveStep();

  // Mark this step as visited when mounted
  useEffect(() => {
    dispatch({ type: 'MARK_STEP_VISITED', payload: 6 });
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Save & Export Content</h2>
      
      {needsOptimization && (
        <SaveStepOptimizationsAlert />
      )}
      
      {contentExists && contentId && (
        <SaveAlreadyExistsAlert contentId={contentId} />
      )}
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Content details section */}
        <ContentDetailsCard
          contentTitle={contentTitle}
          setContentTitle={setContentTitle}
          contentNote={contentNote}
          setContentNote={setContentNote}
        />
        
        {/* Content summary section */}
        <ContentSummaryCard />
      </div>
      
      {/* Save/export actions */}
      <Card>
        <CardContent className="pt-6">
          <SaveActions 
            onSave={handleSave} 
            onPublish={handlePublish} 
            isSaving={isSaving} 
          />
        </CardContent>
      </Card>
    </div>
  );
};
