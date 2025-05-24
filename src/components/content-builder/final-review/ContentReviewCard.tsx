
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
  const [isEnhancedOptimizeDialogOpen, setIsEnhancedOptimizeDialogOpen] = useState(false);

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

  // Handle content update from enhanced optimize dialog
  const handleContentUpdate = (newContent: string) => {
    setEditedContent(newContent);
    setContent(newContent);
    
    // Switch to preview tab to show the optimized content
    setActiveTab('preview');
    
    toast.success("Content optimized with SERP integration and humanization", {
      description: "The content has been enhanced with comprehensive optimizations."
    });
  };

  return (
    <Card className="shadow-lg overflow-hidden glass-panel flex flex-col border-neon-border h-full">
      <CardHeader className="pb-2 border-b bg-gradient-to-r from-purple-500/10 to-transparent flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
          Content Review
        </CardTitle>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="flex justify-between items-center px-4 py-1 border-b">
          <TabsList className="bg-transparent p-0">
            <TabsTrigger value="preview" className="data-[state=active]:bg-muted/30 data-[state=active]:shadow-none">
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="edit" className="data-[state=active]:bg-muted/30 data-[state=active]:shadow-none">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="source" className="data-[state=active]:bg-muted/30 data-[state=active]:shadow-none">
              <FileText className="h-4 w-4 mr-1" />
              Source
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            {activeTab === 'edit' && (
              <Button
                size="sm"
                className="text-xs bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
                onClick={handleSave}
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                Save
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs border-dashed border-muted-foreground/50"
              onClick={() => setIsEnhancedOptimizeDialogOpen(true)}
            >
              <Wand className="h-3.5 w-3.5 mr-1" />
              Smart Optimize
            </Button>
          </div>
        </div>
        
        <TabsContent value="preview" className="flex-1 m-0 p-0 data-[state=active]:flex flex-col">
          <ScrollArea className="flex-1 p-5 h-[50vh]">
            <div className="prose prose-slate dark:prose-invert prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg max-w-none">
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
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="edit" className="flex-1 m-0 p-0 data-[state=active]:flex flex-col">
          <ContentEditor 
            content={editedContent}
            onContentChange={handleContentChange}
          />
        </TabsContent>
        
        <TabsContent value="source" className="flex-1 m-0 p-0 data-[state=active]:flex flex-col">
          <ScrollArea className="flex-1 h-[50vh]">
            <pre className="p-5 text-xs font-mono whitespace-pre-wrap bg-secondary/10">{editedContent}</pre>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <EnhancedAutoOptimizeDialog 
        isOpen={isEnhancedOptimizeDialogOpen}
        onClose={() => setIsEnhancedOptimizeDialogOpen(false)}
        content={editedContent}
        onContentUpdate={handleContentUpdate}
      />
    </Card>
  );
}
