import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ChatHistorySidebar } from '@/components/ai-chat/ChatHistorySidebar';
import { useEnhancedAIChatDB } from '@/hooks/useEnhancedAIChatDB';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSidebarOpen, toggleSidebar, setPendingPanel } = useSidebarContext();

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex relative">
        {/* Persistent Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <ChatHistorySidebar
              conversations={conversations}
              activeConversation={activeConversation}
              onSelectConversation={handleSelectConversation}
              onCreateConversation={handleCreateConversation}
              onDeleteConversation={deleteConversation}
              onToggleSidebar={toggleSidebar}
              onPinConversation={togglePinConversation}
              onArchiveConversation={toggleArchiveConversation}
              onOpenPanel={(panelType) => {
                if (['automations'].includes(panelType)) {
                  handleNavigation('/engage/automations');
                } else if (['journeys'].includes(panelType)) {
                  handleNavigation('/engage/journeys');
                } else {
                  handlePanel(panelType);
                }
              }}
            />
          )}
        </AnimatePresence>

        {/* Floating Sidebar Toggle */}
        <div
          className={cn(
            "fixed z-[60] transition-all duration-300",
            isSidebarOpen
              ? 'top-3 sm:left-[16.5rem] lg:left-[18.5rem]'
              : 'top-3 left-4'
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="rounded-full border border-border/20 hover:border-border/40 hover:bg-muted/30 bg-transparent text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Main content with responsive margin for sidebar */}
        <main
          className={cn(
            "flex-1 transition-all duration-300 min-w-0",
            isSidebarOpen ? 'sm:ml-72 lg:ml-80' : 'ml-0'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
