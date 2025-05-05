
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SerpContentGenerator } from '@/components/content/SerpContentGenerator';

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
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Content Templates</CardTitle>
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
