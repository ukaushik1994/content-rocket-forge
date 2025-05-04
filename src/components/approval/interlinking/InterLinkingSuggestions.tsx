
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApproval } from '../context/ApprovalContext';
import { InterLinkingItem } from './InterLinkingItem';
import { FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface InterLinkingSuggestionsProps {
  content: ContentItemType;
}

export const InterLinkingSuggestions: React.FC<InterLinkingSuggestionsProps> = ({ content }) => {
  const { interLinkingSuggestions } = useApproval();
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Interlinking Opportunities</h2>
        <p className="text-muted-foreground">
          Connect your content with other published articles to improve SEO and user navigation.
        </p>
      </div>
      
      {interLinkingSuggestions.length > 0 ? (
        <div className="grid gap-4">
          {interLinkingSuggestions.map((suggestion, index) => (
            <InterLinkingItem 
              key={index} 
              suggestion={suggestion}
              sourceContent={content}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Interlinking Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                No interlinking opportunities found. This could be because there are no published articles with matching keywords or topics.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
