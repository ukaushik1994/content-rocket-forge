import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, Search, FileText, Puzzle, CheckCircle, Target, 
  Megaphone, Mail, Share2, Zap, GitBranch, Users, Layers, 
  Activity, BarChart3, MoreVertical, Pin, Archive, Trash2,
  ChevronDown, Loader2, Settings, LogOut, Send, BookOpen
} from 'lucide-react';
import { CreAiterLogo } from '@/components/brand/CreAiterLogo';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { AIConversation } from '@/hooks/useEnhancedAIChatDB';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Nav data from NavItems.tsx
const contentItems = [
  { path: '/content-type-selection', label: 'Builder', icon: Puzzle },
  { path: '/content-approval', label: 'Approval', icon: CheckCircle },
  { path: '/keywords', label: 'Keywords', icon: Search },
  { path: '/research/content-strategy', label: 'Strategy', icon: Target },
];

const marketingItems = [
  { path: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { path: '/engage/email', label: 'Email', icon: Mail },
  { path: '/engage/social', label: 'Social', icon: Share2 },
  { path: '/engage/automations', label: 'Automations', icon: Zap },
  { path: '/engage/journeys', label: 'Journeys', icon: GitBranch },
];

const audienceItems = [
  { path: '/engage/contacts', label: 'Contacts', icon: Users },
  { path: '/engage/segments', label: 'Segments', icon: Layers },
  { path: '/engage/activity', label: 'Activity', icon: Activity },
];

interface NavGroupProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: { path: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

const NavGroup: React.FC<NavGroupProps> = ({ label, icon: Icon, items }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const isActive = items.some(item => location.pathname.startsWith(item.path));

  return (
    <Collapsible defaultOpen={isActive}>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className={cn(
              "w-full justify-between",
              isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
          >
            <span className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {!isCollapsed && <span>{label}</span>}
            </span>
            {!isCollapsed && <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-sidebar-border pl-2">
            {items.map((item) => (
              <SidebarMenuButton
                key={item.path}
                size="sm"
                onClick={() => navigate(item.path)}
                className={cn(
                  "h-8",
                  location.pathname.startsWith(item.path) && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </SidebarMenuButton>
            ))}
          </div>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

interface AIChatSidebarProps {
  conversations: AIConversation[];
  activeConversation: string | null;
  onSelectConversation: (id: string) => void;
  onCreateConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onPinConversation?: (id: string) => void;
  onArchiveConversation?: (id: string) => void;
}

export const AIChatSidebar: React.FC<AIChatSidebarProps> = ({
  conversations,
  activeConversation,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  onPinConversation,
  onArchiveConversation,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { openSettings } = useSettings();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const [chatSearch, setChatSearch] = useState('');
  const [displayLimit, setDisplayLimit] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filter & sort conversations
  const filteredConversations = conversations
    .filter(conv => {
      if (conv.archived) return false;
      if (chatSearch && !conv.title?.toLowerCase().includes(chatSearch.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  const displayedConversations = filteredConversations.slice(0, displayLimit);
  const hasMore = filteredConversations.length > displayLimit;

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await new Promise(r => setTimeout(r, 300));
    setDisplayLimit(prev => prev + 10);
    setIsLoadingMore(false);
  };

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || 'U';
  const userName = (user as any)?.user_metadata?.display_name || (user as any)?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User';

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* Header */}
      <SidebarHeader className="flex flex-row items-center justify-between p-3">
        <button onClick={() => navigate('/ai-chat')} className="flex items-center gap-2">
          <CreAiterLogo showText={!isCollapsed} size="sm" />
        </button>
        {!isCollapsed && <SidebarTrigger />}
      </SidebarHeader>

      <SidebarContent>
        {/* Actions: New Chat + Search */}
        <SidebarGroup className="px-3 py-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={onCreateConversation}
                className="w-full border border-sidebar-border rounded-lg"
              >
                <Plus className="h-4 w-4" />
                {!isCollapsed && <span>New Chat</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          {!isCollapsed && (
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
              <Input
                placeholder="Search chats..."
                value={chatSearch}
                onChange={e => setChatSearch(e.target.value)}
                className="pl-8 h-8 text-sm bg-sidebar border-sidebar-border"
              />
            </div>
          )}
        </SidebarGroup>

        <SidebarSeparator />

        {/* Library */}
        <SidebarGroup>
          <SidebarGroupLabel>Library</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/repository')}
                  className={cn(
                    location.pathname === '/repository' && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )}
                >
                  <BookOpen className="h-4 w-4" />
                  {!isCollapsed && <span>Repository</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Apps */}
        <SidebarGroup>
          <SidebarGroupLabel>Apps</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavGroup label="Content" icon={Puzzle} items={contentItems} />
              <NavGroup label="Marketing" icon={Send} items={marketingItems} />
              <NavGroup label="Audience" icon={Users} items={audienceItems} />
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/analytics')}
                  className={cn(
                    location.pathname === '/analytics' && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )}
                >
                  <BarChart3 className="h-4 w-4" />
                  {!isCollapsed && <span>Analytics</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Chats */}
        <SidebarGroup className="flex-1 min-h-0">
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarGroupContent className="flex-1 min-h-0">
            {!isCollapsed ? (
              <ScrollArea className="h-full max-h-[300px]">
                <div className="flex flex-col gap-0.5 px-1">
                  {displayedConversations.length > 0 ? (
                    <>
                      {displayedConversations.map((conv) => (
                        <div
                          key={conv.id}
                          className={cn(
                            "flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer group text-sm",
                            activeConversation === conv.id
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                          )}
                          onClick={() => onSelectConversation(conv.id)}
                        >
                          <div className="flex-1 min-w-0 flex items-center gap-1.5">
                            {conv.pinned && <Pin className="h-3 w-3 flex-shrink-0 text-muted-foreground" />}
                            <span className="truncate">{conv.title || 'Untitled'}</span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                                onClick={e => e.stopPropagation()}
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                              {onPinConversation && (
                                <DropdownMenuItem onClick={e => { e.stopPropagation(); onPinConversation(conv.id); }}>
                                  <Pin className="h-3.5 w-3.5 mr-2" />
                                  {conv.pinned ? 'Unpin' : 'Pin'}
                                </DropdownMenuItem>
                              )}
                              {onArchiveConversation && (
                                <DropdownMenuItem onClick={e => { e.stopPropagation(); onArchiveConversation(conv.id); }}>
                                  <Archive className="h-3.5 w-3.5 mr-2" />
                                  {conv.archived ? 'Unarchive' : 'Archive'}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={e => { e.stopPropagation(); onDeleteConversation(conv.id); }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                      {hasMore && (
                        <Button
                          onClick={handleLoadMore}
                          disabled={isLoadingMore}
                          variant="ghost"
                          size="sm"
                          className="w-full text-muted-foreground text-xs h-7 mt-1"
                        >
                          {isLoadingMore ? (
                            <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Loading...</>
                          ) : (
                            <><ChevronDown className="h-3 w-3 mr-1" />Load More</>
                          )}
                        </Button>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground/50 text-center py-4">
                      {chatSearch ? 'No results' : 'No conversations yet'}
                    </p>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => {}}>
                    <FileText className="h-4 w-4" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer: User */}
      <SidebarFooter className="border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2 h-auto py-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <span className="truncate text-sm font-medium">{userName}</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-48">
            <DropdownMenuItem onClick={() => openSettings('api')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
