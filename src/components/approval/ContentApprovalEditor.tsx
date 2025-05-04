
import React, { useState, useEffect } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useContent } from '@/contexts/content';
import { ContentEditor } from '@/components/content/ContentEditor';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, CheckCircle, Wand, History, 
  ThumbsUp, AlertCircle, Search, PanelRight
} from 'lucide-react';
import { ApprovalMetadata } from './ApprovalMetadata';
import { useApproval } from './context/ApprovalContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { ApprovalSerpSummary } from './serp/ApprovalSerpSummary';
import { ApprovalAITitleSuggestions } from './ai/ApprovalAITitleSuggestions';
import { SectionRegenerationTool } from './ai/SectionRegenerationTool';

interface ContentApprovalEditorProps {
  content: ContentItemType;
}

export const ContentApprovalEditor: React.FC<ContentApprovalEditorProps> = ({ content }) => {
  const [editedContent, setEditedContent] = useState(content.content);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [activeTab, setActiveTab] = useState('edit');
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState('serp');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedTitle, setEditedTitle] = useState(content.title);
  
  const { updateContentItem, publishContent } = useContent();
  const { 
    improveContentWithAI, 
    isImproving,
    serpData,
    isFetchingSerp,
    fetchSerpData,
    generateTitleSuggestions,
    generateMetadata
  } = useApproval();
  
  // Fetch SERP data on load if we have keywords
  useEffect(() => {
    if (content.keywords && content.keywords.length > 0) {
      fetchSerpData(content.keywords[0]);
    }
  }, [content.keywords, fetchSerpData]);
  
  const handleContentChange = (newContent: string) => {
    setEditedContent(newContent);
  };
  
  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await updateContentItem(content.id, { 
        content: editedContent,
        title: editedTitle 
      });
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
  
  const handleTitleSelect = (title: string) => {
    setEditedTitle(title);
  };
  
  const handleSectionRegenerated = (updatedContent: string) => {
    setEditedContent(updatedContent);
  };
  
  const handleAddToContent = (content: string, type: string) => {
    let insertText = '';
    
    switch (type) {
      case 'keyword':
        insertText = `${content} `;
        break;
      case 'question':
        insertText = `\n\n## ${content}\n\n`;
        break;
      case 'heading':
        insertText = `\n\n## ${content}\n\n`;
        break;
      case 'entity':
        insertText = `${content} `;
        break;
      default:
        insertText = `${content} `;
    }
    
    setEditedContent(prev => prev + insertText);
    toast.success(`Added ${type} to content`);
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
          <h2 className="text-xl font-semibold text-white/90">{editedTitle}</h2>
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
      
      <div className="flex gap-6">
        {/* Main Editor */}
        <Card className="relative border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm shadow-xl flex-1">
          <CardHeader className="pb-2 border-b border-white/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-white/80">Content Editor</CardTitle>
              <div className="flex gap-2">
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(!showSidebar)}
                  className={`flex items-center gap-1 ${showSidebar ? 'text-neon-blue' : 'text-white/70'} hover:text-white hover:bg-white/10`}
                >
                  <PanelRight className="h-4 w-4" />
                  {showSidebar ? 'Hide Tools' : 'Show Tools'}
                </Button>
              </div>
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
        
        {/* AI & SERP Tools Sidebar */}
        {showSidebar && (
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="w-80 space-y-4"
          >
            <Tabs defaultValue={activeSidebarTab} onValueChange={setActiveSidebarTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="serp" className="text-xs">
                  <Search className="h-4 w-4 mr-1" />
                  SERP
                </TabsTrigger>
                <TabsTrigger value="titles" className="text-xs">
                  <FileText className="h-4 w-4 mr-1" />
                  Titles
                </TabsTrigger>
                <TabsTrigger value="sections" className="text-xs">
                  <Wand className="h-4 w-4 mr-1" />
                  Sections
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="serp" className="mt-4">
                <ApprovalSerpSummary
                  serpData={serpData}
                  isLoading={isFetchingSerp}
                  mainKeyword={content.keywords?.[0] || 'keyword'}
                  onAddToContent={handleAddToContent}
                />
              </TabsContent>
              
              <TabsContent value="titles" className="mt-4">
                <ApprovalAITitleSuggestions
                  content={content}
                  onSelectTitle={handleTitleSelect}
                />
              </TabsContent>
              
              <TabsContent value="sections" className="mt-4">
                <SectionRegenerationTool
                  content={content}
                  onSectionRegenerated={handleSectionRegenerated}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
