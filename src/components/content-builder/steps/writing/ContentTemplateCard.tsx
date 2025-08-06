
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SerpContentGenerator } from '@/components/content/SerpContentGenerator';
import { TemplateStatus } from '@/components/ui/template-indicator';
import { useTemplateInitialization } from '@/hooks/useTemplateInitialization';

interface ContentTemplateCardProps {
  serpData: any;
  onGenerateContent: (template: string) => void;
  mainKeyword: string;
}

export const ContentTemplateCard: React.FC<ContentTemplateCardProps> = ({
  serpData,
  onGenerateContent,
  mainKeyword
}) => {
  const templateStatus = useTemplateInitialization();
  
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Content Templates</CardTitle>
          <TemplateStatus 
            templateCount={templateStatus.templateCount}
            isLoading={templateStatus.isLoading}
            error={templateStatus.error}
            className="text-xs"
          />
        </div>
      </CardHeader>
      <CardContent>
        <SerpContentGenerator 
          serpData={serpData}
          onGenerateContent={onGenerateContent}
          mainKeyword={mainKeyword}
        />
      </CardContent>
    </Card>
  );
};
