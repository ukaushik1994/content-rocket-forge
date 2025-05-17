
import React, { useState, useEffect } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { motion } from 'framer-motion';
import { useApproval } from '../context/ApprovalContext';
import { ContentHeader } from './ContentHeader';
import { ApprovalMetadata } from '../ApprovalMetadata';
import { EditorMain } from './EditorMain';
import { EditorSidebar } from './EditorSidebar';
import { toast } from 'sonner';

interface ContentApprovalEditorRefactoredProps {
  content: ContentItemType;
}

export const ContentApprovalEditorRefactored: React.FC<ContentApprovalEditorRefactoredProps> = ({ content }) => {
  const [editedContent, setEditedContent] = useState(content.content);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState('serp');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedTitle, setEditedTitle] = useState(content.title);
  
  const { 
    serpData,
    isFetchingSerp,
    fetchSerpData
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
      <ContentHeader 
        content={content}
        editedContent={editedContent}
        editedTitle={editedTitle}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
      />
      
      {/* SEO Metadata Section */}
      <ApprovalMetadata content={content} />
      
      <div className="flex gap-6">
        {/* Main Editor */}
        <EditorMain 
          content={content}
          editedContent={editedContent}
          handleContentChange={handleContentChange}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          approvalNotes={approvalNotes}
          setApprovalNotes={setApprovalNotes}
        />
        
        {/* AI & SERP Tools Sidebar */}
        <EditorSidebar 
          showSidebar={showSidebar}
          activeSidebarTab={activeSidebarTab}
          setActiveSidebarTab={setActiveSidebarTab}
          content={content}
          serpData={serpData}
          isFetchingSerp={isFetchingSerp}
          handleTitleSelect={handleTitleSelect}
          handleSectionRegenerated={handleSectionRegenerated}
          handleAddToContent={handleAddToContent}
        />
      </div>
    </motion.div>
  );
};
