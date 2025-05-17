
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { ContentApprovalEditorRefactored } from './editor';
import { toast } from 'sonner';

interface ContentApprovalEditorProps {
  content: ContentItemType;
}

export const ContentApprovalEditor: React.FC<ContentApprovalEditorProps> = ({ content }) => {
  return <ContentApprovalEditorRefactored content={content} />;
};

// Missing toast import fix for EditorSidebar
export { toast };
