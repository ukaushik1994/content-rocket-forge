
import { useContext } from 'react';
import { ContentContext } from './ContentProvider';
import { ContentContextType } from './types';

export const useContent = (): ContentContextType => {
  const context = useContext(ContentContext);
  
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  
  return context;
};

export * from './types';
export * from './ContentProvider';
