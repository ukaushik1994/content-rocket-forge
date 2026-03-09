import React, { createContext, useContext } from 'react';
import { useEnhancedAIChatDB } from '@/hooks/useEnhancedAIChatDB';

type AIChatDBContextType = ReturnType<typeof useEnhancedAIChatDB>;

const AIChatDBContext = createContext<AIChatDBContextType | null>(null);

export const AIChatDBProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const chatDB = useEnhancedAIChatDB();
  return (
    <AIChatDBContext.Provider value={chatDB}>
      {children}
    </AIChatDBContext.Provider>
  );
};

export const useSharedAIChatDB = (): AIChatDBContextType => {
  const context = useContext(AIChatDBContext);
  if (!context) {
    throw new Error('useSharedAIChatDB must be used within an AIChatDBProvider');
  }
  return context;
};
