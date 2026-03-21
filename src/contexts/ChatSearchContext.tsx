import React, { createContext, useContext, useState, useCallback } from 'react';

interface ChatSearchContextType {
  showSearch: boolean;
  toggleSearch: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentMatch: number;
  totalMatches: number;
  setCurrentMatch: (n: number) => void;
  setTotalMatches: (n: number) => void;
  navigateMatch: (direction: 'prev' | 'next') => void;
  onNavigateMatch: ((direction: 'prev' | 'next') => void) | null;
  registerNavigateMatch: (fn: (direction: 'prev' | 'next') => void) => void;
  messageCount: number;
  setMessageCount: (n: number) => void;
  onExportConversation: ((format: 'json' | 'markdown' | 'txt') => void) | null;
  registerExport: (fn: (format: 'json' | 'markdown' | 'txt') => void) => void;
  onShowAnalytics: (() => void) | null;
  registerShowAnalytics: (fn: () => void) => void;
}

const ChatSearchContext = createContext<ChatSearchContextType | null>(null);

export const ChatSearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatch, setCurrentMatch] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [onNavigateMatch, setOnNavigateMatch] = useState<((d: 'prev' | 'next') => void) | null>(null);
  const [onExportConversation, setOnExportConversation] = useState<((f: 'json' | 'markdown' | 'txt') => void) | null>(null);
  const [onShowAnalytics, setOnShowAnalytics] = useState<(() => void) | null>(null);

  const toggleSearch = useCallback(() => setShowSearch(v => !v), []);
  const navigateMatch = useCallback((direction: 'prev' | 'next') => {
    onNavigateMatch?.(direction);
  }, [onNavigateMatch]);

  const registerNavigateMatch = useCallback((fn: (d: 'prev' | 'next') => void) => {
    setOnNavigateMatch(() => fn);
  }, []);

  const registerExport = useCallback((fn: (f: 'json' | 'markdown' | 'txt') => void) => {
    setOnExportConversation(() => fn);
  }, []);

  const registerShowAnalytics = useCallback((fn: () => void) => {
    setOnShowAnalytics(() => fn);
  }, []);

  return (
    <ChatSearchContext.Provider value={{
      showSearch, toggleSearch, searchQuery, setSearchQuery,
      currentMatch, totalMatches, setCurrentMatch, setTotalMatches,
      navigateMatch, onNavigateMatch, registerNavigateMatch,
      messageCount, setMessageCount,
      onExportConversation, registerExport,
      onShowAnalytics, registerShowAnalytics,
    }}>
      {children}
    </ChatSearchContext.Provider>
  );
};

export const useChatSearch = () => {
  const ctx = useContext(ChatSearchContext);
  if (!ctx) return null;
  return ctx;
};
