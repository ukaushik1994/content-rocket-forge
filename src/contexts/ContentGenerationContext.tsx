import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CampaignStrategy, ContentFormatCount, GeneratedContent } from '@/types/campaign-types';

interface ContentGenerationContextType {
  isOpen: boolean;
  selectedContent: ContentFormatCount | null;
  strategy: CampaignStrategy | null;
  generatedContent: Map<string, GeneratedContent>;
  openPanel: (strategy: CampaignStrategy, content?: ContentFormatCount) => void;
  closePanel: () => void;
  setSelectedContent: (content: ContentFormatCount | null) => void;
  updateGeneratedContent: (key: string, content: GeneratedContent) => void;
  getContentByKey: (formatId: string, index: number) => GeneratedContent | undefined;
}

const ContentGenerationContext = createContext<ContentGenerationContextType | undefined>(undefined);

export function ContentGenerationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentFormatCount | null>(null);
  const [strategy, setStrategy] = useState<CampaignStrategy | null>(null);
  const [generatedContent, setGeneratedContent] = useState<Map<string, GeneratedContent>>(new Map());

  const openPanel = (newStrategy: CampaignStrategy, content?: ContentFormatCount) => {
    setStrategy(newStrategy);
    setSelectedContent(content || null);
    setIsOpen(true);
  };

  const closePanel = () => {
    setIsOpen(false);
    setTimeout(() => {
      setSelectedContent(null);
      setStrategy(null);
    }, 300);
  };

  const updateGeneratedContent = (key: string, content: GeneratedContent) => {
    setGeneratedContent(prev => new Map(prev).set(key, content));
  };

  const getContentByKey = (formatId: string, index: number): GeneratedContent | undefined => {
    const key = `${formatId}-${index}`;
    return generatedContent.get(key);
  };

  return (
    <ContentGenerationContext.Provider
      value={{
        isOpen,
        selectedContent,
        strategy,
        generatedContent,
        openPanel,
        closePanel,
        setSelectedContent,
        updateGeneratedContent,
        getContentByKey,
      }}
    >
      {children}
    </ContentGenerationContext.Provider>
  );
}

export function useContentGeneration() {
  const context = useContext(ContentGenerationContext);
  if (context === undefined) {
    throw new Error('useContentGeneration must be used within a ContentGenerationProvider');
  }
  return context;
}
