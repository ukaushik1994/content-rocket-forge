import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { ChatHistorySidebar } from '@/components/ai-chat/ChatHistorySidebar';
import { AIChatDBProvider, useSharedAIChatDB } from '@/contexts/AIChatDBContext';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { useResponsiveBreakpoint } from '@/hooks/useResponsiveBreakpoint';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ActiveProviderIndicator } from '@/components/ai/ActiveProviderIndicator';
import { useDueContentNotifications } from '@/hooks/useDueContentNotifications';
import { useChatContextBridge } from '@/contexts/ChatContextBridge';
import { ChatSearchProvider, useChatSearch } from '@/contexts/ChatSearchContext';
import { MessageSearchBar } from '@/components/ai-chat/MessageSearchBar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { OnboardingProvider, useOnboarding, OnboardingCarousel } from '@/components/onboarding';

interface AppLayoutProps {
  children: React.ReactNode;
}

const SearchIconButton: React.FC = () => {
  const location = useLocation();
  const chatSearch = useChatSearch();
  if (!chatSearch || location.pathname !== '/ai-chat') return null;

  const { showSearch, toggleSearch, searchQuery, setSearchQuery, currentMatch, totalMatches, navigateMatch, messageCount, onExportConversation, onShowAnalytics } = chatSearch;

  return (
    <Popover open={showSearch} onOpenChange={(open) => { if (open !== showSearch) toggleSearch(); }}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full border border-border relative transition-transform duration-200 hover:scale-105 bg-background/80 backdrop-blur-md shadow-lg h-9 w-9"
          title="Search messages"
        >
          <Search className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 p-0 bg-background/95 backdrop-blur-sm border-border/50 shadow-xl"
      >
        <MessageSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onExportConversation={(format) => onExportConversation?.(format)}
          onShowAnalytics={() => onShowAnalytics?.()}
          messageCount={messageCount}
          filteredCount={totalMatches}
          onNavigateMatch={navigateMatch}
          currentMatch={currentMatch}
          totalMatches={totalMatches}
        />
      </PopoverContent>
    </Popover>
  );
};

const AppLayoutInner: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSidebarOpen, toggleSidebar, setSidebarOpen, setPendingPanel } = useSidebarContext();
  const { isMobile } = useResponsiveBreakpoint();

  // Global due content notifications — runs for all authenticated pages
  useDueContentNotifications();

  // #49: Auto-trigger onboarding for first-time users
  const { isActive: isOnboardingActive, startOnboarding, hasCompletedOnboarding } = useOnboarding();
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  useEffect(() => {
    if (!onboardingChecked && !hasCompletedOnboarding) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        startOnboarding();
        setOnboardingChecked(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
    setOnboardingChecked(true);
  }, [hasCompletedOnboarding, onboardingChecked, startOnboarding]);

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
      {/* #49: Onboarding overlay for first-time users */}
      {isOnboardingActive && <OnboardingCarousel />}

      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 transition-all duration-300">
        <ActiveProviderIndicator />
        <NotificationBell />
        <SearchIconButton />
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
          onClick={() => {
            if (isSidebarOpen && !isMobile) {
              setSidebarOpen(false);
            }
          }}
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
    <OnboardingProvider>
      <AIChatDBProvider>
        <ChatSearchProvider>
          <AppLayoutInner>{children}</AppLayoutInner>
        </ChatSearchProvider>
      </AIChatDBProvider>
    </OnboardingProvider>
  );
};
