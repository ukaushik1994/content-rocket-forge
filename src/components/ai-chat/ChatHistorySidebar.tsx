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
  FolderOpen,
  Package,
  CheckCircle,
  Pencil,
  Megaphone,
  BarChart3,
  Key,
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
  Sparkles,
  Tag,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AIConversation } from '@/hooks/useEnhancedAIChatDB';
import { GlobalSearchResults } from './GlobalSearchResults';
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
  onRenameConversation?: (id: string, newTitle: string) => void;
  onAddTag?: (conversationId: string, tag: string) => void;
  onRemoveTag?: (conversationId: string, tag: string) => void;
  onShareConversation?: (conversationId: string) => void;
  onOpenPanel?: (panelType: string) => void;
  isCollapsed?: boolean;
  className?: string;
}

const PRESET_TAGS = ['important', 'strategy', 'content', 'research', 'follow-up'];

const TAG_COLORS: Record<string, string> = {
  important: 'bg-destructive/20 text-destructive border-destructive/30',
  strategy: 'bg-primary/20 text-primary border-primary/30',
  content: 'bg-accent/60 text-accent-foreground border-accent/30',
  research: 'bg-secondary/60 text-secondary-foreground border-secondary/30',
  'follow-up': 'bg-warning/20 text-warning border-warning/30',
};

// Sidebar nav item — premium style with active indicator
const SidebarNavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  badge?: string;
  isActive?: boolean;
}> = ({ icon, label, onClick, badge, isActive }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-[background-color,color] duration-200 group relative overflow-hidden",
      isActive
        ? "bg-accent/60 text-foreground"
        : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
    )}
  >
    {isActive && (
      <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-primary" />
    )}
    <span className={cn(
      "flex-shrink-0 transition-colors duration-200",
      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
    )}>
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

// Collapsed icon button with tooltip — premium
const CollapsedIconButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ icon, label, onClick }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        onClick={onClick}
        aria-label={label}
        className="w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-[background-color,color] duration-200"
      >
        {icon}
      </button>
    </TooltipTrigger>
    <TooltipContent side="right" sideOffset={8}>
      {label}
    </TooltipContent>
  </Tooltip>
);

// Collapsible section — styled like nav items (icon + text row)
const CollapsibleSection: React.FC<{
  label: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  showDivider?: boolean;
}> = ({ label, icon, defaultOpen = true, children, showDivider = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  React.useEffect(() => { setIsOpen(defaultOpen); }, [defaultOpen]);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      {showDivider && <div className="mx-3 border-t border-border/5 mt-1" />}
      <CollapsibleTrigger className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-[background-color,color] duration-200 group cursor-pointer",
        isOpen
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
      )}>
        {icon && (
          <span className="flex-shrink-0 text-muted-foreground group-hover:text-foreground transition-colors duration-200">
            {icon}
          </span>
        )}
        <span className="flex-1 text-left text-[11px] font-semibold uppercase tracking-[0.06em]">{label}</span>
        <ChevronDown className={cn(
          "h-3 w-3 text-muted-foreground/50 transition-transform duration-200",
          !isOpen && "-rotate-90"
        )} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5">
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
  onRenameConversation,
  onAddTag,
  onRemoveTag,
  onShareConversation,
  onOpenPanel,
  isCollapsed = false,
  className = ""
}) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { openSettings } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchActive, setSearchActive] = useState<boolean>(false);
  const [displayLimit, setDisplayLimit] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

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
      if (searchTerm) {
        // Tag-based search: #tag filters by tag match
        if (searchTerm.startsWith('#')) {
          const tagSearch = searchTerm.slice(1).toLowerCase();
          if (!conv.tags?.some(t => t.toLowerCase().includes(tagSearch))) return false;
        } else if (!conv.title.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
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
    { icon: <FolderOpen className="h-4 w-4" />, label: 'Repository', action: () => handleNavigation('/repository') },
    { icon: <CheckCircle className="h-4 w-4" />, label: 'Approvals', action: () => handleNavigation('/content-approval') },
    { icon: <Sparkles className="h-4 w-4" />, label: 'AI Proposals', action: () => handleNavigation('/ai-proposals') },
  ];

  const toolsItems = [
    { icon: <Megaphone className="h-4 w-4" />, label: 'Campaigns', action: () => handleNavigation('/campaigns') },
    { icon: <Key className="h-4 w-4" />, label: 'Keywords', action: () => handleNavigation('/keywords') },
    { icon: <BarChart3 className="h-4 w-4" />, label: 'Analytics', action: () => handleNavigation('/analytics') },
  ];

  const engageItems = [
    { icon: <Mail className="h-4 w-4" />, label: 'Email', action: () => handleNavigation('/engage/email') },
    { icon: <Share2 className="h-4 w-4" />, label: 'Social', action: () => handleNavigation('/engage/social') },
    { icon: <Users className="h-4 w-4" />, label: 'Contacts', action: () => handleNavigation('/engage/contacts') },
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
            "w-14 bg-background backdrop-blur-xl border-r border-border/15",
            "flex flex-col items-center py-3",
            "shadow-[inset_-1px_0_0_0_hsl(var(--border)/0.05)]",
            className
          )}
        >
          {/* Toggle (expand) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleSidebar}
                aria-label="Expand sidebar"
                className="w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-[background-color,color] duration-200"
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
                  <button aria-label="User menu" className="w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-[background-color,color] duration-200">
                    <div className="w-7 h-7 rounded-full bg-muted ring-1 ring-border/10 flex items-center justify-center text-xs font-medium text-foreground">
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
          "bg-background backdrop-blur-xl",
          "border-r border-border/15 flex flex-col",
          "shadow-[inset_-1px_0_0_0_hsl(var(--border)/0.05)]",
          className
        )}
        initial={isMobile ? { x: -320, opacity: 0 } : false}
        animate={isMobile ? { x: 0, opacity: 1, transition: { type: "spring", damping: 25, stiffness: 300 } } : undefined}
        exit={isMobile ? { x: -320, opacity: 0, transition: { duration: 0.2 } } : undefined}
      >
        {/* Top: Logo + Toggle + New Chat + Notifications */}
        <div className="p-3 pb-2 flex items-center justify-between border-b border-border/5">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSidebar}
              aria-label="Collapse sidebar"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-[background-color,color] duration-200"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
            <CreAiterLogo showText={true} size="sm" />
          </div>
          
        </div>

        {/* New Chat + Search */}
        <div className="px-2 pt-2 pb-1">
          <SidebarNavItem
            icon={<Plus className="h-4 w-4" />}
            label="New chat"
            onClick={onCreateConversation}
          />
          {searchActive ? (
            <div className="flex items-center gap-2 px-3 py-2 mx-1 rounded-lg bg-accent/30">
              <Search className="h-4 w-4 text-muted-foreground/60 flex-shrink-0" />
              <input
                autoFocus
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onBlur={() => { if (!searchTerm) setSearchActive(false); }}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none border-none"
              />
            </div>
          ) : (
            <SidebarNavItem
              icon={<Search className="h-4 w-4" />}
              label="Search"
              onClick={() => setSearchActive(true)}
            />
          )}
        </div>

        {/* Global Search Results */}
        {searchActive && searchTerm.length >= 2 && (
          <div className="px-2">
            <GlobalSearchResults searchTerm={searchTerm} onClose={() => { setSearchTerm(''); setSearchActive(false); }} />
          </div>
        )}

        <ScrollArea className="flex-1">
          <div className="px-2 pt-4">
            {/* ── LIBRARY (collapsible) ── */}
            <CollapsibleSection label="Library" icon={<BookOpen className="h-4 w-4" />} defaultOpen={false}>
              {libraryItems.map((item) => (
                <SidebarNavItem key={item.label} icon={item.icon} label={item.label} onClick={item.action} />
              ))}
            </CollapsibleSection>

            {/* ── TOOLS (collapsible) ── */}
            <CollapsibleSection label="Tools" icon={<Wrench className="h-4 w-4" />} defaultOpen={false} showDivider>
              {toolsItems.map((item) => (
                <SidebarNavItem key={item.label} icon={item.icon} label={item.label} onClick={item.action} />
              ))}
            </CollapsibleSection>

            {/* ── ENGAGE (collapsible) ── */}
            <CollapsibleSection label="Engage" icon={<MessageCircle className="h-4 w-4" />} defaultOpen={false} showDivider>
              {engageItems.map((item) => (
                <SidebarNavItem key={item.label} icon={item.icon} label={item.label} onClick={item.action} />
              ))}
            </CollapsibleSection>

            <div className="mb-6" />

            {/* ── CHATS ── */}
            <CollapsibleSection label="Chats" showDivider>
              {/* Conversations List */}
              <AnimatePresence mode="wait">
                {conversations && conversations.length > 0 ? (
                  filteredConversations.length > 0 ? (
                    <>
              <div role="list">
                      {displayedConversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          role="listitem"
                          aria-selected={activeConversation === conversation.id}
                          className={cn(
                            "mx-1 mb-0.5 px-3 py-2 cursor-pointer transition-[background-color,color] duration-200 rounded-lg group relative overflow-hidden",
                            activeConversation === conversation.id 
                              ? 'bg-accent/50' 
                              : 'hover:bg-accent/30'
                          )}
                          onClick={() => onSelectConversation(conversation.id)}
                        >
                          {activeConversation === conversation.id && (
                            <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-primary" />
                          )}
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                {conversation.pinned && <Pin className="h-3 w-3 text-primary/60 flex-shrink-0" />}
                                {renamingId === conversation.id ? (
                                  <input
                                    ref={renameInputRef}
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    onBlur={() => {
                                      if (renameValue.trim() && renameValue.trim() !== conversation.title) {
                                        onRenameConversation?.(conversation.id, renameValue.trim());
                                      }
                                      setRenamingId(null);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        if (renameValue.trim() && renameValue.trim() !== conversation.title) {
                                          onRenameConversation?.(conversation.id, renameValue.trim());
                                        }
                                        setRenamingId(null);
                                      }
                                      if (e.key === 'Escape') setRenamingId(null);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-[13px] bg-accent/50 border border-border/30 rounded px-1.5 py-0.5 outline-none w-full text-foreground"
                                    autoFocus
                                  />
                                ) : (
                                  <h3 className={cn(
                                    "text-[13px] truncate",
                                    activeConversation === conversation.id ? "text-foreground font-medium" : "text-foreground/90"
                                  )}>
                                    {conversation.title}
                                  </h3>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                                {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                              </p>
                              {/* Tag badges */}
                              {conversation.tags && conversation.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {conversation.tags.map(tag => (
                                    <span
                                      key={tag}
                                      className={cn(
                                        "inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full border font-medium",
                                        TAG_COLORS[tag] || 'bg-muted text-muted-foreground border-border/30'
                                      )}
                                    >
                                      {tag}
                                      {onRemoveTag && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveTag(conversation.id, tag);
                                          }}
                                          className="hover:opacity-70 ml-0.5"
                                        >
                                          <X className="h-2 w-2" />
                                        </button>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              )}
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
                                {onRenameConversation && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRenameValue(conversation.title);
                                      setRenamingId(conversation.id);
                                      setTimeout(() => renameInputRef.current?.focus(), 50);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Rename
                                  </DropdownMenuItem>
                                )}
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
                                {onShareConversation && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onShareConversation(conversation.id);
                                    }}
                                  >
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Share
                                  </DropdownMenuItem>
                                )}
                                {onAddTag && (
                                  <DropdownMenuSub>
                                    <DropdownMenuSubTrigger onClick={(e) => e.stopPropagation()}>
                                      <Tag className="h-4 w-4 mr-2" />
                                      Tags
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="bg-background border-border/20">
                                      {PRESET_TAGS.map(tag => {
                                        const isApplied = (conversation.tags || []).includes(tag);
                                        return (
                                          <DropdownMenuItem
                                            key={tag}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (isApplied) {
                                                onRemoveTag?.(conversation.id, tag);
                                              } else {
                                                onAddTag(conversation.id, tag);
                                              }
                                            }}
                                            className="capitalize"
                                          >
                                            <span className={cn(
                                              "w-2 h-2 rounded-full mr-2",
                                              isApplied ? "bg-primary" : "bg-muted-foreground/30"
                                            )} />
                                            {tag}
                                            {isApplied && <X className="h-3 w-3 ml-auto text-muted-foreground" />}
                                          </DropdownMenuItem>
                                        );
                                      })}
                                    </DropdownMenuSubContent>
                                  </DropdownMenuSub>
                                )}
                                <DropdownMenuSeparator className="bg-border/20" />
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
                      </div>
                      
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
        <div className="p-3 border-t border-border/8 space-y-0.5">
          <SidebarNavItem 
            icon={<Package className="h-4 w-4" />} 
            label="Offerings" 
            onClick={() => handleNavigation('/offerings')} 
          />
          <SidebarNavItem 
            icon={<CalendarDays className="h-4 w-4" />} 
            label="Content Calendar" 
            onClick={() => handleNavigation('/calendar')} 
          />
          
          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors duration-200 group" aria-label="User menu">
                <div className="w-6 h-6 rounded-full bg-muted ring-1 ring-border/10 flex items-center justify-center text-[10px] font-medium text-foreground flex-shrink-0">
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
