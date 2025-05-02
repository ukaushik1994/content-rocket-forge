
import React, { createContext, useState, ReactNode } from 'react';

interface ContentContextType {
  selectedKeywords: string[];
  setSelectedKeywords: React.Dispatch<React.SetStateAction<string[]>>;
  contentTitle: string;
  setContentTitle: React.Dispatch<React.SetStateAction<string>>;
  contentStructure: string[];
  setContentStructure: React.Dispatch<React.SetStateAction<string[]>>;
  contentTemplate: string;
  setContentTemplate: React.Dispatch<React.SetStateAction<string>>;
}

export const ContentContext = createContext<ContentContextType>({
  selectedKeywords: [],
  setSelectedKeywords: () => {},
  contentTitle: '',
  setContentTitle: () => {},
  contentStructure: [],
  setContentStructure: () => {},
  contentTemplate: '',
  setContentTemplate: () => {},
});

interface ContentProviderProps {
  children: ReactNode;
}

export const ContentProvider = ({ children }: ContentProviderProps) => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [contentTitle, setContentTitle] = useState<string>('');
  const [contentStructure, setContentStructure] = useState<string[]>([]);
  const [contentTemplate, setContentTemplate] = useState<string>('');

  return (
    <ContentContext.Provider value={{
      selectedKeywords,
      setSelectedKeywords,
      contentTitle,
      setContentTitle,
      contentStructure,
      setContentStructure,
      contentTemplate,
      setContentTemplate,
    }}>
      {children}
    </ContentContext.Provider>
  );
};
