import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ChatHistorySidebar } from '@/components/ai-chat/ChatHistorySidebar';
import { useEnhancedAIChatDB } from '@/hooks/useEnhancedAIChatDB';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { useResponsiveBreakpoint } from '@/hooks/useResponsiveBreakpoint';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSidebarOpen, toggleSidebar, setPendingPanel } = useSidebarContext();
  const { isMobile } = useResponsiveBreakpoint();

  const {
    conversations,
    activeConversation,
    selectConversation,
    createConversation,
    deleteConversation,
    togglePinConversation,
    toggleArchiveConversation,
  } = useEnhancedAIChatDB();

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
    onOpenPanel: (panelType: string) => {
      if (['automations'].includes(panelType)) {
        handleNavigation('/engage/automations');
      } else if (['journeys'].includes(panelType)) {
        handleNavigation('/engage/journeys');
      } else {
        handlePanel(panelType);
      }
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex relative">
        {/* On mobile: only show expanded sidebar via AnimatePresence when open */}
        {isMobile ? (
          <AnimatePresence>
            {isSidebarOpen && (
              <ChatHistorySidebar {...sidebarProps} />
            )}
          </AnimatePresence>
        ) : (
          /* On desktop: always render, toggle between expanded and collapsed */
          <ChatHistorySidebar {...sidebarProps} isCollapsed={!isSidebarOpen} />
        )}

        {/* Main content with responsive margin */}
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
