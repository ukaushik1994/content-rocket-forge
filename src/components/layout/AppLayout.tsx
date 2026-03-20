import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ChatHistorySidebar } from '@/components/ai-chat/ChatHistorySidebar';
import { AIChatDBProvider, useSharedAIChatDB } from '@/contexts/AIChatDBContext';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { useResponsiveBreakpoint } from '@/hooks/useResponsiveBreakpoint';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ActiveProviderIndicator } from '@/components/ai/ActiveProviderIndicator';
import { useDueContentNotifications } from '@/hooks/useDueContentNotifications';
import { useChatContextBridge } from '@/contexts/ChatContextBridge';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayoutInner: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSidebarOpen, toggleSidebar, setPendingPanel } = useSidebarContext();
  const { isMobile } = useResponsiveBreakpoint();

  // Global due content notifications — runs for all authenticated pages
  useDueContentNotifications();

  const {
    conversations,
    activeConversation,
    messages,
    selectConversation,
    createConversation,
    deleteConversation,
    renameConversation,
    togglePinConversation,
    toggleArchiveConversation,
    addTagToConversation,
    removeTagFromConversation,
    shareConversation,
  } = useSharedAIChatDB();

  // Sync AIChatDB state → ChatContextBridge so downstream consumers get live data
  const { updateActiveConversation, syncMessages } = useChatContextBridge();

  useEffect(() => {
    updateActiveConversation(activeConversation);
  }, [activeConversation, updateActiveConversation]);

  useEffect(() => {
    syncMessages(messages);
  }, [messages, syncMessages]);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handlePanel = (panelType: string) => {
    setPendingPanel(panelType);
    navigate('/ai-chat');
  };

  const handleSelectConversation = (id: string) => {
    selectConversation(id);
    if (location.pathname !== '/ai-chat') {
      navigate('/ai-chat');
    }
  };

  const handleCreateConversation = () => {
    createConversation();
    if (location.pathname !== '/ai-chat') {
      navigate('/ai-chat');
    }
  };

  const sidebarProps = {
    conversations,
    activeConversation,
    onSelectConversation: handleSelectConversation,
    onCreateConversation: handleCreateConversation,
    onDeleteConversation: deleteConversation,
    onToggleSidebar: toggleSidebar,
    onPinConversation: togglePinConversation,
    onArchiveConversation: toggleArchiveConversation,
    onRenameConversation: renameConversation,
    onAddTag: addTagToConversation,
    onRemoveTag: removeTagFromConversation,
    onShareConversation: shareConversation,
    onOpenPanel: (panelType: string) => {
      const panelRouteMap: Record<string, string> = {
        automations: '/engage/automations',
        journeys: '/engage/journeys',
        repository: '/repository',
        offerings: '/offerings',
        approvals: '/content-approval',
        campaigns: '/campaigns',
        keywords: '/keywords',
        analytics: '/analytics',
        email: '/engage/email',
        social: '/engage/social',
        contacts: '/engage/contacts',
      };
      const route = panelRouteMap[panelType];
      if (route) {
        handleNavigation(route);
      } else {
        handlePanel(panelType);
      }
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <ActiveProviderIndicator />
        <NotificationBell />
      </div>
      <div className="flex-1 flex relative">
        {isMobile ? (
          <AnimatePresence>
            {isSidebarOpen && (
              <ChatHistorySidebar {...sidebarProps} />
            )}
          </AnimatePresence>
        ) : (
          <ChatHistorySidebar {...sidebarProps} isCollapsed={!isSidebarOpen} />
        )}

        <main
          className={cn(
            "flex-1 transition-all duration-300 min-w-0",
            isMobile
              ? 'ml-0'
              : isSidebarOpen
                ? 'sm:ml-72 lg:ml-80'
                : 'sm:ml-14'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <AIChatDBProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </AIChatDBProvider>
  );
};
