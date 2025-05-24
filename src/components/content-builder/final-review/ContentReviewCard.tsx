
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContentEditor } from '@/components/content/ContentEditor';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Eye, Edit, FileText, Save, Wand } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EnhancedAutoOptimizeDialog } from './optimization/EnhancedAutoOptimizeDialog';

interface ContentReviewCardProps {
  content: string;
}

export const ContentReviewCard: React.FC<ContentReviewCardProps> = ({ content }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [activeTab, setActiveTab] = useState('preview');
  const { setContent } = useContentBuilder();
  const [isAutoOptimizeDialogOpen, setIsAutoOptimizeDialogOpen] = useState(false);

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    setEditedContent(newContent);
  };

  // Save changes
  const handleSave = () => {
    setContent(editedContent);
    setIsEditing(false);
    toast.success("Content updated successfully");
  };

  // Handle mode toggle
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedContent(content);
    }
  };
  
  // Format markdown headings for display
  const formatContentForDisplay = (text: string) => {
    return text
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-3 mt-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mb-2 mt-4">$2</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mb-2 mt-3">$1</h3>')
      .replace(/^#### (.*$)/gm, '<h4 class="text-md font-bold mb-1 mt-2">$1</h4>')
      .split('\n\n')
      .map(paragraph => paragraph ? `<p class="mb-3">${paragraph}</p>` : '')
      .join('');
  };

  // Handle content update from auto-optimize dialog
  const handleContentUpdate = (newContent: string) => {
    setEditedContent(newContent);
    setContent(newContent);
    toast.success("Content optimized and updated successfully");
  };

  return (
    <>
      <Card className="h-full shadow-xl bg-gradient-to-br from-background to-purple-950/5 border border-purple-500/20">
        <CardHeader className="pb-2 border-b border-purple-500/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Content Review
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAutoOptimizeDialogOpen(true)}
                className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple text-white border-0"
              >
                <Wand className="h-4 w-4 mr-1" />
                AI Optimize
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleEditMode}
                className="bg-white/5 border-white/10 hover:bg-white/10 text-white/80"
              >
                {isEditing ? <Eye className="h-4 w-4 mr-1" /> : <Edit className="h-4 w-4 mr-1" />}
                {isEditing ? 'Preview' : 'Edit'}
              </Button>
              {isEditing && (
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 h-[600px]">
          {isEditing ? (
            <ContentEditor
              content={editedContent}
              onContentChange={handleContentChange}
            />
          ) : (
            <ScrollArea className="h-full p-6">
              <div 
                className="prose prose-slate dark:prose-invert prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg max-w-none text-white/90"
                dangerouslySetInnerHTML={{ __html: formatContentForDisplay(editedContent) }}
              />
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <EnhancedAutoOptimizeDialog
        isOpen={isAutoOptimizeDialogOpen}
        onClose={() => setIsAutoOptimizeDialogOpen(false)}
        content={editedContent}
        onContentUpdate={handleContentUpdate}
      />
    </>
  );
};
