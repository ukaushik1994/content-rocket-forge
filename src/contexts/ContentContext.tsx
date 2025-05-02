
import React, { createContext, useState, useContext, ReactNode } from 'react';

type ContentItemType = {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  seoScore: number;
  keywords: string[];
  author: string;
};

type ContentContextType = {
  contentItems: ContentItemType[];
  addContentItem: (item: Omit<ContentItemType, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateContentItem: (id: string, updates: Partial<ContentItemType>) => void;
  deleteContentItem: (id: string) => void;
  getContentItem: (id: string) => ContentItemType | undefined;
  publishContent: (id: string) => void;
};

// Sample data
const initialContent: ContentItemType[] = [
  {
    id: '1',
    title: 'Top 10 Project Management Tools for Remote Teams',
    content: 'Content about project management tools...',
    status: 'published',
    createdAt: new Date(2025, 3, 28).toISOString(),
    updatedAt: new Date(2025, 3, 28).toISOString(),
    seoScore: 87,
    keywords: ['project management', 'remote work', 'productivity tools'],
    author: 'Content Writer',
  },
  {
    id: '2',
    title: 'Email Marketing Best Practices in 2025',
    content: 'Content about email marketing...',
    status: 'draft',
    createdAt: new Date(2025, 3, 25).toISOString(),
    updatedAt: new Date(2025, 3, 27).toISOString(),
    seoScore: 74,
    keywords: ['email marketing', 'digital marketing', 'marketing automation'],
    author: 'Content Writer',
  },
  {
    id: '3',
    title: 'How to Choose the Best CRM for Your Business',
    content: 'Content about selecting a CRM system...',
    status: 'published',
    createdAt: new Date(2025, 4, 1).toISOString(),
    updatedAt: new Date(2025, 4, 1).toISOString(),
    seoScore: 91,
    keywords: ['crm', 'sales software', 'customer relationship'],
    author: 'Content Writer',
  },
];

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [contentItems, setContentItems] = useState<ContentItemType[]>(() => {
    // Load from localStorage if available
    const savedContent = localStorage.getItem('contentItems');
    return savedContent ? JSON.parse(savedContent) : initialContent;
  });

  const saveToLocalStorage = (items: ContentItemType[]) => {
    localStorage.setItem('contentItems', JSON.stringify(items));
  };

  const addContentItem = (item: Omit<ContentItemType, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newItem = {
      ...item,
      id: `content-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    
    const updatedItems = [...contentItems, newItem];
    setContentItems(updatedItems);
    saveToLocalStorage(updatedItems);
  };

  const updateContentItem = (id: string, updates: Partial<ContentItemType>) => {
    const updatedItems = contentItems.map(item => 
      item.id === id 
        ? { ...item, ...updates, updatedAt: new Date().toISOString() } 
        : item
    );
    setContentItems(updatedItems);
    saveToLocalStorage(updatedItems);
  };

  const deleteContentItem = (id: string) => {
    const updatedItems = contentItems.filter(item => item.id !== id);
    setContentItems(updatedItems);
    saveToLocalStorage(updatedItems);
  };

  const getContentItem = (id: string) => {
    return contentItems.find(item => item.id === id);
  };

  const publishContent = (id: string) => {
    updateContentItem(id, { 
      status: 'published',
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <ContentContext.Provider 
      value={{ 
        contentItems, 
        addContentItem, 
        updateContentItem, 
        deleteContentItem, 
        getContentItem,
        publishContent
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
