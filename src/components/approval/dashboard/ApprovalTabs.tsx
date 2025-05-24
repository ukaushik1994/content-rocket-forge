
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, User, MessageSquare } from 'lucide-react';

interface ApprovalTabsProps {
  selectedContent: ContentItemType;
}

export const ApprovalTabs: React.FC<ApprovalTabsProps> = ({ selectedContent }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Tabs defaultValue="content" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="metadata">Metadata</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      
      <TabsContent value="content" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Content Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm">
                {selectedContent.content || 'No content available'}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="metadata" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Content Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Author</label>
                <p className="text-sm">{selectedContent.metadata?.author || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Word Count</label>
                <p className="text-sm">{selectedContent.content?.split(' ').length || 0} words</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm">{formatDate(selectedContent.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm">{formatDate(selectedContent.updated_at)}</p>
              </div>
            </div>
            
            {selectedContent.keywords && selectedContent.keywords.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Keywords</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedContent.keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="history" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Review History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Content submitted for review</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(selectedContent.created_at)}
                  </p>
                </div>
                <Badge variant="outline">Initial</Badge>
              </div>
              
              {selectedContent.approval_status !== 'draft' && (
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Status updated to {selectedContent.approval_status}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(selectedContent.updated_at)}
                    </p>
                  </div>
                  <Badge variant="secondary">Updated</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
