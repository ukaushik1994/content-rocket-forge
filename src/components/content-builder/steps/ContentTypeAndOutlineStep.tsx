
import React, { useEffect } from 'react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentTypeStep } from './ContentTypeStep';
import { ContentOutlineSection } from '../outline/ContentOutlineSection';
import { ContentBriefQuestions } from './ContentBriefQuestions';
import { Separator } from '@/components/ui/separator';
import { Settings } from 'lucide-react';

export const ContentTypeAndOutlineStep = () => {
  const { state, dispatch } = useContentBuilder();
  const { outline, contentType } = state;
  
  useEffect(() => {
    // Mark as complete if we have content type selected and outline with at least 3 sections
    if (contentType && outline.length >= 3) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 1 });
    }
  }, [contentType, outline, dispatch]);

  return (
    <div className="space-y-8">
      {/* Content Type Selection Section */}
      <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/10 border border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-400" />
            Content Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ContentTypeStep />
        </CardContent>
      </Card>

      <Separator className="bg-white/10" />

      {/* Content Brief Questionnaire */}
      <ContentBriefQuestions />

      <Separator className="bg-white/10" />

      {/* Unified Outline Section */}
      <ContentOutlineSection />
    </div>
  );
};
