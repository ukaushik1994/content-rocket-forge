
import React, { useState } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useContent } from '@/contexts/content';
import { ContentEditor } from '@/components/content/ContentEditor';
import { Textarea } from '@/components/ui/textarea';
import { FileText, CheckCircle, Wand, History } from 'lucide-react';
import { ApprovalMetadata } from './ApprovalMetadata';
import { useApproval } from './context/ApprovalContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ContentApprovalEditorProps {
  content: ContentItemType;
}

export const ContentApprovalEditor: React.FC<ContentApprovalEditorProps> = ({ content }) => {
  const [editedContent, setEditedContent] = useState(content.content);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [activeTab, setActiveTab] = useState('edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateContentItem, publishContent } = useContent();
  const { improveContentWithAI, isImproving } = useApproval();
  
  const handleContentChange = (newContent: string) => {
    setEditedContent(newContent);
  };
  
  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await updateContentItem(content.id, { content: editedContent });
      toast.success('Content saved successfully');
    } catch (error) {
      toast.error('Failed to save content');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await publishContent(content.id);
      toast.success('Content approved and published successfully');
    } catch (error) {
      toast.error('Failed to approve content');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleImproveContent = async () => {
    try {
      if (!content) return;
      
      const improvedContent = await improveContentWithAI(content);
      if (improvedContent) {
        setEditedContent(improvedContent);
        toast.success('Content improved with AI assistance');
      }
    } catch (error) {
      toast.error('Failed to improve content');
      console.error(error);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">{content.title}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{content.status}</Badge>
            {content.keywords?.length > 0 && (
              <div className="flex gap-1">
                {content.keywords.map((keyword, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleSave} 
            disabled={isSubmitting}
          >
            Save Draft
          </Button>
          <Button 
            onClick={handleApprove} 
            disabled={isSubmitting}
            className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve & Publish
          </Button>
        </div>
      </div>
      
      {/* SEO Metadata Section */}
      <ApprovalMetadata content={content} />
      
      <Card className="relative">
        <CardHeader className="pb-2 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Content Editor</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleImproveContent}
              disabled={isImproving}
              className="flex items-center gap-1"
            >
              <Wand className="h-4 w-4" />
              {isImproving ? 'Improving...' : 'Improve with AI'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mx-4 my-2">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="edit" className="mt-0">
              <div className="min-h-[400px]">
                <ContentEditor
                  content={editedContent}
                  onContentChange={handleContentChange}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="mt-0">
              <div className="min-h-[400px] p-6 prose prose-slate dark:prose-invert prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg max-w-none">
                {editedContent.split('\n\n').map((paragraph, idx) => (
                  paragraph.startsWith('# ') ? (
                    <h1 key={idx}>{paragraph.substring(2)}</h1>
                  ) : paragraph.startsWith('## ') ? (
                    <h2 key={idx}>{paragraph.substring(3)}</h2>
                  ) : paragraph.startsWith('### ') ? (
                    <h3 key={idx}>{paragraph.substring(4)}</h3>
                  ) : paragraph ? (
                    <p key={idx}>{paragraph}</p>
                  ) : <br key={idx} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="border-t p-4">
          <div className="w-full space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Approval Notes</h4>
              <Textarea 
                placeholder="Add any notes, feedback, or comments about this content..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Review and update the content before approving. Once approved, the content will be published and visible to all users.
              </AlertDescription>
            </Alert>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
