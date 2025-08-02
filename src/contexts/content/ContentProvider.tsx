
import React, { createContext, useContext, useState } from 'react';

interface ContentContextType {
  contents: any[];
  addContent: (content: any) => void;
}

const ContentContext = createContext<ContentContextType | null>(null);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contents, setContents] = useState([]);

  const addContent = (content: any) => {
    setContents(prev => [...prev, content]);
  };

  return (
    <ContentContext.Provider value={{ contents, addContent }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
