import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Trash2, 
  ChevronDown,
  ChevronRight,
  Loader2,
  Pin,
  Archive,
  FileText,
  Puzzle,
  CheckCircle,
  PenLine,
  Megaphone,
  BarChart3,
  Mail,
  Share2,
  Users,
  Zap,
  GitBranch,
  CalendarDays,
  UserCircle,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquarePlus,
  BookOpen,
  Wrench,
  MessageCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AIConversation } from '@/hooks/useEnhancedAIChatDB';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useResponsiveBreakpoint } from '@/hooks/useResponsiveBreakpoint';
import { CreAiterLogo } from '@/components/brand/CreAiterLogo';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';

interface ChatHistorySidebarProps {
  conversations: AIConversation[];
  activeConversation: string | null;
  onSelectConversation: (id: string) => void;
  onCreateConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onToggleSidebar: () => void;
  onArchiveConversation?: (id: string) => void;
  onPinConversation?: (id: string) => void;
  onOpenPanel?: (panelType: string) => void;
  isCollapsed?: boolean;
  className?: string;
}

// Sidebar nav item
const SidebarNavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  badge?: string;
}> = ({ icon, label, onClick, badge }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors group"
  >
    <span className="flex-shrink-0 text-muted-foreground/60 group-hover:text-foreground/80 transition-colors">
      {icon}
    </span>
    <span className="flex-1 text-left truncate">{label}</span>
    {badge && (
      <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] h-5 px-1.5 border-0">
        {badge}
      </Badge>
    )}
  </button>
);

// Collapsed icon button with tooltip
const CollapsedIconButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ icon, label, onClick }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        onClick={onClick}
        className="w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
      >
        {icon}
      </button>
    </TooltipTrigger>
    <TooltipContent side="right" sideOffset={8}>
      {label}
    </TooltipContent>
  </Tooltip>
);

// Collapsible section
const CollapsibleSection: React.FC<{
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ label, defaultOpen = true, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full flex items-center gap-1.5 px-3 pt-4 pb-1.5 group cursor-pointer">
        {isOpen ? (
          <ChevronDown className="h-3 w-3 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors" />
        ) : (
          <ChevronRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors" />
        )}
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-medium group-hover:text-muted-foreground/60 transition-colors">
          {label}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  conversations,
  activeConversation,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  onToggleSidebar,
  onArchiveConversation,
  onPinConversation,
  onOpenPanel,
  isCollapsed = false,
  className = ""
}) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { openSettings } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [displayLimit, setDisplayLimit] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const userFullName = user?.user_metadata?.first_name 
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}` 
    : user?.email?.split('@')[0] || 'User';

  const userInitials = userFullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const filteredConversations = conversations
    .filter(conv => {
      if (searchTerm && !conv.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (conv.archived) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  const displayedConversations = filteredConversations.slice(0, displayLimit);
  const hasMoreConversations = filteredConversations.length > displayLimit;

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setDisplayLimit(prev => prev + 10);
    setIsLoadingMore(false);
  };

  React.useEffect(() => {
    setDisplayLimit(10);
  }, [searchTerm]);

  const { isMobile } = useResponsiveBreakpoint();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) onToggleSidebar();
  };

  const handlePanel = (panelType: string) => {
    onOpenPanel?.(panelType);
    if (isMobile) onToggleSidebar();
  };

  // Navigation items for collapsed view
  const libraryItems = [
    { icon: <FileText className="h-4 w-4" />, label: 'Repository', action: () => handlePanel('repository') },
    { icon: <Puzzle className="h-4 w-4" />, label: 'Offerings', action: () => handlePanel('offerings') },
    { icon: <CheckCircle className="h-4 w-4" />, label: 'Approvals', action: () => handlePanel('approvals') },
  ];

  const toolsItems = [
    { icon: <PenLine className="h-4 w-4" />, label: 'Content Wizard', action: () => handlePanel('content_wizard') },
    { icon: <Megaphone className="h-4 w-4" />, label: 'Campaigns', action: () => handlePanel('campaigns') },
    { icon: <Search className="h-4 w-4" />, label: 'Keywords', action: () => handlePanel('keywords') },
    { icon: <BarChart3 className="h-4 w-4" />, label: 'Analytics', action: () => handlePanel('analytics') },
  ];

  const engageItems = [
    { icon: <Mail className="h-4 w-4" />, label: 'Email', action: () => handlePanel('email') },
    { icon: <Share2 className="h-4 w-4" />, label: 'Social', action: () => handlePanel('social') },
    { icon: <Users className="h-4 w-4" />, label: 'Contacts', action: () => handlePanel('contacts') },
    { icon: <Zap className="h-4 w-4" />, label: 'Automations', action: () => handleNavigation('/engage/automations') },
    { icon: <GitBranch className="h-4 w-4" />, label: 'Journeys', action: () => handleNavigation('/engage/journeys') },
  ];

  // ─── COLLAPSED ICON-ONLY STRIP ───
  if (isCollapsed && !isMobile) {
    return (
      <TooltipProvider delayDuration={0}>
        <div
          className={cn(
            "fixed left-0 top-0 bottom-0 z-50",
            "w-14 bg-background/95 backdrop-blur-xl",
            "border-r border-border/10 flex flex-col items-center py-3",
            className
          )}
        >
          {/* Toggle (expand) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleSidebar}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
              >
                <PanelLeftOpen className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>Open sidebar</TooltipContent>
          </Tooltip>

          {/* New Chat */}
          <CollapsedIconButton
            icon={<MessageSquarePlus className="h-5 w-5" />}
            label="New Chat"
            onClick={onCreateConversation}
          />

          {/* Divider */}
          <div className="w-6 h-px bg-border/20 my-2" />

          {/* Section icons */}
          <div className="flex flex-col items-center gap-1 flex-1">
            <CollapsedIconButton icon={<BookOpen className="h-4 w-4" />} label="Library" onClick={onToggleSidebar} />
            <CollapsedIconButton icon={<Wrench className="h-4 w-4" />} label="Tools" onClick={onToggleSidebar} />
            <CollapsedIconButton icon={<MessageCircle className="h-4 w-4" />} label="Engage" onClick={onToggleSidebar} />
          </div>

          {/* Bottom: Profile */}
          <div className="flex flex-col items-center gap-0.5 mt-2">

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground">
                    {userInitials}
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="bg-card border border-border/20 w-56">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  {user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => openSettings()}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  // ─── EXPANDED SIDEBAR ───
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggleSidebar}
        />
      )}
      
      <motion.div 
        className={cn(
          "fixed left-0 top-0 bottom-0 z-50",
          "w-full sm:w-72 lg:w-80",
          "bg-background/95 backdrop-blur-xl",
          "border-r border-border/10 flex flex-col",
          className
        )}
        initial={isMobile ? { x: -320, opacity: 0 } : false}
        animate={isMobile ? { x: 0, opacity: 1, transition: { type: "spring", damping: 25, stiffness: 300 } } : undefined}
        exit={isMobile ? { x: -320, opacity: 0, transition: { duration: 0.2 } } : undefined}
      >
        {/* Top: Logo + Toggle + New Chat + Notifications */}
        <div className="p-3 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSidebar}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
            <CreAiterLogo showText={true} size="sm" />
          </div>
          <NotificationBell />
        </div>

        {/* New Chat + Search */}
        <div className="px-3 py-2 space-y-2">
          <Button
            onClick={onCreateConversation}
            variant="outline"
            className="w-full justify-start gap-2 h-9 text-sm text-muted-foreground hover:text-foreground border-border/15"
          >
            <MessageSquarePlus className="h-4 w-4" />
            New Chat
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-transparent border-border/15 text-foreground placeholder:text-muted-foreground/40 focus:border-border/40 focus-visible:ring-0 focus-visible:ring-offset-0 h-8 text-xs rounded-lg"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-2">
            {/* ── LIBRARY (collapsible) ── */}
            <CollapsibleSection label="Library" defaultOpen={false}>
              {libraryItems.map((item) => (
                <SidebarNavItem key={item.label} icon={item.icon} label={item.label} onClick={item.action} />
              ))}
            </CollapsibleSection>

            {/* ── TOOLS (collapsible) ── */}
            <CollapsibleSection label="Tools" defaultOpen={false}>
              {toolsItems.map((item) => (
                <SidebarNavItem key={item.label} icon={item.icon} label={item.label} onClick={item.action} />
              ))}
            </CollapsibleSection>

            {/* ── ENGAGE (collapsible) ── */}
            <CollapsibleSection label="Engage" defaultOpen={false}>
              {engageItems.map((item) => (
                <SidebarNavItem key={item.label} icon={item.icon} label={item.label} onClick={item.action} />
              ))}
            </CollapsibleSection>

            {/* ── CHATS ── */}
            <CollapsibleSection label="Chats">
              {/* Conversations List */}
              <AnimatePresence mode="wait">
                {conversations && conversations.length > 0 ? (
                  filteredConversations.length > 0 ? (
                    <>
                      {displayedConversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className={cn(
                            "mx-1 mb-0.5 px-3 py-2.5 cursor-pointer transition-colors duration-150 rounded-lg group",
                            activeConversation === conversation.id 
                              ? 'bg-muted/40' 
                              : 'hover:bg-muted/20'
                          )}
                          onClick={() => onSelectConversation(conversation.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                {conversation.pinned && <Pin className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />}
                                <h3 className="text-sm text-foreground truncate">
                                  {conversation.title}
                                </h3>
                              </div>
                              <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                                {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                              </p>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-background border-border/20">
                                {onPinConversation && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onPinConversation?.(conversation.id);
                                    }}
                                  >
                                    <Pin className="h-4 w-4 mr-2" />
                                    {conversation.pinned ? 'Unpin' : 'Pin'}
                                  </DropdownMenuItem>
                                )}
                                {onArchiveConversation && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onArchiveConversation(conversation.id);
                                    }}
                                  >
                                    <Archive className="h-4 w-4 mr-2" />
                                    {conversation.archived ? 'Unarchive' : 'Archive'}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteConversation(conversation.id);
                                  }}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                      
                      {/* Load More */}
                      {hasMoreConversations && (
                        <div className="mt-2 px-2">
                          <Button
                            onClick={handleLoadMore}
                            disabled={isLoadingMore}
                            variant="ghost"
                            size="sm"
                            className="w-full text-muted-foreground/60 hover:text-foreground h-7 text-xs"
                          >
                            {isLoadingMore ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                Loading...
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3 w-3 mr-2" />
                                Load More ({filteredConversations.length - displayLimit})
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-6"
                    >
                      <Search className="h-4 w-4 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-muted-foreground/50 text-xs">No results</p>
                    </motion.div>
                  )
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-6"
                  >
                    <p className="text-muted-foreground/40 text-xs">No conversations yet</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CollapsibleSection>
          </div>
        </ScrollArea>

        {/* Bottom: Calendar + Profile */}
        <div className="p-3 border-t border-border/10 space-y-1">
          <SidebarNavItem 
            icon={<CalendarDays className="h-4 w-4" />} 
            label="Content Calendar" 
            onClick={() => handleNavigation('/research/calendar')} 
          />
          
          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors group">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium text-foreground flex-shrink-0">
                  {userInitials}
                </div>
                <span className="flex-1 text-left truncate">{userFullName}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="bg-card border border-border/20 w-56">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {user?.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openSettings()}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
    </>
  );
};
