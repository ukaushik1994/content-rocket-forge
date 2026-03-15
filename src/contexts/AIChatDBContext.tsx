import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
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

// Fallback stub so the app doesn't crash during HMR reloads
const noopAsync = async () => {};
const noop = () => {};

const fallbackContext: AIChatDBContextType = {
  conversations: [],
  activeConversation: null,
  messages: [],
  isLoading: false,
  isTyping: false,
  progressText: '',
  searchTerm: '',
  pendingConfirmation: null,
  loadConversations: noopAsync as any,
  createConversation: noopAsync as any,
  deleteConversation: noopAsync as any,
  sendMessage: noopAsync as any,
  handleAction: noopAsync as any,
  handleLegacyAction: noopAsync as any,
  selectConversation: noop as any,
  togglePinConversation: noopAsync as any,
  toggleArchiveConversation: noopAsync as any,
  addTagToConversation: noopAsync as any,
  removeTagFromConversation: noopAsync as any,
  exportConversation: noopAsync as any,
  shareConversation: noopAsync as any,
  searchConversations: noop as any,
  clearSearch: noop as any,
  editMessage: noopAsync as any,
  deleteMessage: noopAsync as any,
  handleConfirmAction: noopAsync as any,
  handleCancelAction: noop as any,
  setAnalystActive: noop as any,
};

export const useSharedAIChatDB = (): AIChatDBContextType => {
  const context = useContext(AIChatDBContext);
  if (!context) {
    console.warn('useSharedAIChatDB: context not available, using fallback (HMR reload)');
    return fallbackContext;
  }
  return context;
};
