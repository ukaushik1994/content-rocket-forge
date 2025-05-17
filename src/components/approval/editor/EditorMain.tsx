
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand, PanelRight } from 'lucide-react';
import { EditorTabs } from './EditorTabs';
import { EditorFooter } from './EditorFooter';
import { useApproval } from '../context/ApprovalContext';
import { ContentItemType } from '@/contexts/content/types';
import { toast } from 'sonner';

interface EditorMainProps {
  content: ContentItemType;
  editedContent: string;
  handleContentChange: (newContent: string) => void;
  showSidebar: boolean;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  approvalNotes: string;
  setApprovalNotes: React.Dispatch<React.SetStateAction<string>>;
}

export const EditorMain: React.FC<EditorMainProps> = ({
  content,
  editedContent,
  handleContentChange,
  showSidebar,
  setShowSidebar,
  approvalNotes,
  setApprovalNotes
}) => {
  const [activeTab, setActiveTab] = useState('edit');
  const { improveContentWithAI, isImproving } = useApproval();
  
  const handleImproveContent = async () => {
    try {
      if (!content) return;
      
      const improvedContent = await improveContentWithAI(content);
      if (improvedContent) {
        handleContentChange(improvedContent);
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
        <EditorTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          editedContent={editedContent}
          handleContentChange={handleContentChange}
        />
      </CardContent>
      
      <CardFooter className="border-t border-white/10 p-4">
        <EditorFooter 
          approvalNotes={approvalNotes}
          setApprovalNotes={setApprovalNotes}
        />
      </CardFooter>
    </Card>
  );
};
