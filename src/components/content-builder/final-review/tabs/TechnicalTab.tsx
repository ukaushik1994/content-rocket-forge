
import React from 'react';
import { TechnicalTabContent } from '../TechnicalTabContent';
import { AdvancedSerpIntelligence } from '../../serp/AdvancedSerpIntelligence';
import { DocumentStructure } from '@/contexts/content-builder/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Code, Search } from 'lucide-react';

interface TechnicalTabProps {
  documentStructure: DocumentStructure | null;
  metaTitle: string | null;
  metaDescription: string | null;
  serpData: any;
}

export const TechnicalTab = ({
  documentStructure,
  metaTitle,
  metaDescription,
  serpData
}: TechnicalTabProps) => {
  const handleInsightSelect = (insight: any) => {
    console.log('Selected insight:', insight);
    // Here you could integrate with the content builder to apply the insight
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Technical Analysis */}
      <Tabs defaultValue="technical" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="technical" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Technical Analysis
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            SERP Intelligence
          </TabsTrigger>
        </TabsList>

        <TabsContent value="technical" className="mt-6">
          <TechnicalTabContent
            documentStructure={documentStructure}
            metaTitle={metaTitle}
            metaDescription={metaDescription}
            serpData={serpData}
          />
        </TabsContent>

        <TabsContent value="intelligence" className="mt-6">
          {serpData ? (
            <AdvancedSerpIntelligence
              keyword={serpData.keyword || 'unknown'}
              serpData={serpData}
              onInsightSelect={handleInsightSelect}
              className="w-full"
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  No SERP Data Available
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  SERP intelligence analysis requires keyword analysis data. 
                  Please run a keyword analysis first to see advanced insights.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
