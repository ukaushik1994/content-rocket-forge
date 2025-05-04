
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
import { FileText, CheckCircle, Wand, History, ThumbsUp, AlertCircle } from 'lucide-react';
import { ApprovalMetadata } from './ApprovalMetadata';
import { useApproval } from './context/ApprovalContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';

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
      toast.success('Content saved successfully', {
        icon: <ThumbsUp className="h-4 w-4 text-green-500" />
      });
    } catch (error) {
      toast.error('Failed to save content', {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await publishContent(content.id);
      toast.success('Content approved and published successfully', {
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      });
    } catch (error) {
      toast.error('Failed to approve content', {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      });
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
        toast.success('Content improved with AI assistance', {
          icon: <Wand className="h-4 w-4 text-neon-purple" />
        });
      }
    } catch (error) {
      toast.error('Failed to improve content');
      console.error(error);
    }
  };
  
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <div>
          <h2 className="text-xl font-semibold text-white/90">{content.title}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge 
              variant="outline" 
              className="border-white/20 bg-white/5 text-white/70"
            >
              {content.status}
            </Badge>
            {content.keywords?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {content.keywords.map((keyword, i) => (
                  <Badge key={i} variant="secondary" className="text-xs bg-neon-purple/20 text-neon-purple border border-neon-purple/30">
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 mt-3 md:mt-0">
          <Button 
            variant="outline" 
            onClick={handleSave} 
            disabled={isSubmitting}
            className="bg-white/5 border-white/10 hover:bg-white/10 text-white/80"
          >
            <History className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button 
            onClick={handleApprove} 
            disabled={isSubmitting}
            className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple shadow-md shadow-neon-purple/20"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve & Publish
          </Button>
        </div>
      </div>
      
      {/* SEO Metadata Section */}
      <ApprovalMetadata content={content} />
      
      <Card className="relative border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-2 border-b border-white/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-white/80">Content Editor</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleImproveContent}
              disabled={isImproving}
              className="flex items-center gap-1 text-white/70 hover:text-white hover:bg-white/10"
            >
              <Wand className="h-4 w-4 text-neon-purple" />
              {isImproving ? 'Improving...' : 'Improve with AI'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mx-4 my-2 bg-gray-900/60">
              <TabsTrigger value="edit" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple">Edit</TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="edit" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="min-h-[400px]">
                <ContentEditor
                  content={editedContent}
                  onContentChange={handleContentChange}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="min-h-[400px] p-6 prose prose-slate dark:prose-invert prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg max-w-none text-white/90">
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
        
        <CardFooter className="border-t border-white/10 p-4">
          <div className="w-full space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2 text-white/80">Approval Notes</h4>
              <Textarea 
                placeholder="Add any notes, feedback, or comments about this content..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="min-h-[100px] bg-gray-800/30 border-white/10 focus-visible:ring-neon-purple/50"
              />
            </div>
            
            <Alert className="border-amber-600/30 bg-amber-600/10">
              <FileText className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-200">
                Review and update the content before approving. Once approved, the content will be published and visible to all users.
              </AlertDescription>
            </Alert>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
