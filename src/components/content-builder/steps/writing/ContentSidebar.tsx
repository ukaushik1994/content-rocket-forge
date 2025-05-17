
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

interface ContentSidebarProps {
  keyword: string;
  serpData: any;
  onGenerateNew: () => void;
}

export const ContentSidebar: React.FC<ContentSidebarProps> = ({
  keyword,
  serpData,
  onGenerateNew
}) => {
  return (
    <div className="w-80 border-l bg-card overflow-y-auto p-4 hidden lg:block">
      <div className="space-y-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Content Options</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full flex items-center gap-2"
              onClick={onGenerateNew}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Generate New
            </Button>
          </CardContent>
        </Card>

        {/* SERP data summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">SERP Analysis</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {serpData ? (
              <div className="space-y-3">
                <p><strong>Top keywords:</strong> {serpData.keywords?.slice(0, 5).join(', ')}</p>
                <p><strong>Questions:</strong> {serpData.questions?.slice(0, 3).join(', ')}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No SERP data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
