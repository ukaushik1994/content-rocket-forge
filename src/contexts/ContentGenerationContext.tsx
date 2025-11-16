import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CampaignStrategy, ContentFormatCount } from '@/types/campaign-types';

interface ContentGenerationContextType {
  isOpen: boolean;
  selectedContent: ContentFormatCount | null;
  strategy: CampaignStrategy | null;
  openPanel: (strategy: CampaignStrategy, content?: ContentFormatCount) => void;
  closePanel: () => void;
  setSelectedContent: (content: ContentFormatCount | null) => void;
}

const ContentGenerationContext = createContext<ContentGenerationContextType | undefined>(undefined);

export function ContentGenerationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentFormatCount | null>(null);
  const [strategy, setStrategy] = useState<CampaignStrategy | null>(null);

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

  return (
    <ContentGenerationContext.Provider
      value={{
        isOpen,
        selectedContent,
        strategy,
        openPanel,
        closePanel,
        setSelectedContent,
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
