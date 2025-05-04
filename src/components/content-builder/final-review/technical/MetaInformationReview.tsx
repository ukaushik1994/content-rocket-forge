
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MetaInformationReviewProps {
  metaTitle: string | null;
  metaDescription: string | null;
}

export const MetaInformationReview = ({ metaTitle, metaDescription }: MetaInformationReviewProps) => {
  return (
    <Card className="overflow-hidden shadow-lg">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
          Meta Information Technical Review
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm font-medium">Meta Title</div>
              <div className="bg-card border rounded-md p-3">
                <div className={`text-sm ${metaTitle && metaTitle.length > 60 ? 'text-red-500' : 'text-primary'}`}>
                  {metaTitle || 'No meta title set'}
                </div>
                {metaTitle && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Length: {metaTitle.length}/60 characters
                    {metaTitle.length > 60 && ' (Too long)'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Meta Description</div>
              <div className="bg-card border rounded-md p-3">
                <div className={`text-sm ${metaDescription && metaDescription.length > 160 ? 'text-red-500' : 'text-primary'}`}>
                  {metaDescription || 'No meta description set'}
                </div>
                {metaDescription && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Length: {metaDescription.length}/160 characters
                    {metaDescription.length > 160 && ' (Too long)'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
