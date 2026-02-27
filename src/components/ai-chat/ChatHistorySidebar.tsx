import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Plus,
  MoreVertical,
  Trash2,
  ChevronDown,
  Loader2,
  Pin,
  Archive,
  BookOpen,
  FileText,
  Megaphone,
  Users,
  BarChart3,
  Settings,
  User,
  ChevronRight,
} from 'lucide-react';
import { AIConversation } from '@/hooks/useEnhancedAIChatDB';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface ChatHistorySidebarProps {
  conversations: AIConversation[];
  activeConversation: string | null;
  onSelectConversation: (id: string) => void;
  onCreateConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onArchiveConversation?: (id: string) => void;
  onPinConversation?: (id: string) => void;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  conversations,
  activeConversation,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  onArchiveConversation,
  onPinConversation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [displayLimit, setDisplayLimit] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [appsOpen, setAppsOpen] = useState(true);
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const navigate = useNavigate();
  const { user } = useAuth();

  const filteredConversations = conversations
    .filter(conv => {
      if (searchTerm && !conv.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (conv.archived) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  const pinnedConversations = filteredConversations.filter(c => c.pinned);
  const recentConversations = filteredConversations.filter(c => !c.pinned).slice(0, displayLimit);
  const hasMore = filteredConversations.filter(c => !c.pinned).length > displayLimit;

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setDisplayLimit(prev => prev + 10);
    setIsLoadingMore(false);
  };

  React.useEffect(() => {
    setDisplayLimit(10);
  }, [searchTerm]);

  const appItems = [
    { title: 'Content', icon: FileText, path: '/content' },
    { title: 'Marketing', icon: Megaphone, path: '/marketing' },
    { title: 'Audience', icon: Users, path: '/audience' },
    { title: 'Analytics', icon: BarChart3, path: '/analytics' },
  ];

  const handleOpenSettings = () => {
    window.dispatchEvent(new CustomEvent('openSettings', { detail: { tab: 'api' } }));
  };

  const ConversationItem = ({ conversation }: { conversation: AIConversation }) => (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={activeConversation === conversation.id}
        onClick={() => onSelectConversation(conversation.id)}
        tooltip={conversation.title}
        className="group/conv"
      >
        <div className="flex-1 min-w-0 flex items-center gap-2">
          {conversation.pinned && <Pin className="h-3 w-3 text-sidebar-foreground/40 flex-shrink-0" />}
          {!collapsed && <span className="truncate text-sm">{conversation.title}</span>}
        </div>
        {!collapsed && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="opacity-0 group-hover/conv:opacity-100 h-5 w-5 flex items-center justify-center rounded text-sidebar-foreground/50 hover:text-sidebar-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border-border/20">
              {onPinConversation && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPinConversation(conversation.id); }}>
                  <Pin className="h-4 w-4 mr-2" />
                  {conversation.pinned ? 'Unpin' : 'Pin'}
                </DropdownMenuItem>
              )}
              {onArchiveConversation && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchiveConversation(conversation.id); }}>
                  <Archive className="h-4 w-4 mr-2" />
                  {conversation.archived ? 'Unarchive' : 'Archive'}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDeleteConversation(conversation.id); }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/10">
      {/* Header */}
      <SidebarHeader className="p-3">
        {!collapsed && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-sidebar-foreground tracking-tight">CREAiTER</span>
          </div>
        )}
        <Button
          onClick={onCreateConversation}
          variant="ghost"
          size={collapsed ? 'icon' : 'default'}
          className={cn(
            "border border-sidebar-border/20 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:border-sidebar-border/40",
            collapsed ? "h-8 w-8" : "w-full rounded-full h-8 text-sm"
          )}
        >
          <Plus className="h-4 w-4" />
          {!collapsed && <span className="ml-2">New Chat</span>}
        </Button>
      </SidebarHeader>

      <SidebarContent>
        {/* Search */}
        {!collapsed && (
          <SidebarGroup className="py-0 px-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sidebar-foreground/30" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 bg-transparent border-sidebar-border/15 text-sidebar-foreground placeholder:text-sidebar-foreground/30 focus:border-sidebar-border/30 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
              />
            </div>
          </SidebarGroup>
        )}

        <SidebarSeparator className="bg-sidebar-border/10" />

        {/* Library */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40">
            Library
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/repository')}
                  tooltip="Content Repository"
                >
                  <BookOpen className="h-4 w-4" />
                  {!collapsed && <span>Content Repository</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-sidebar-border/10" />

        {/* Apps */}
        <SidebarGroup>
          <Collapsible open={appsOpen} onOpenChange={setAppsOpen}>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 cursor-pointer hover:text-sidebar-foreground/60">
                Apps
                {!collapsed && (
                  <ChevronRight className={cn("h-3 w-3 ml-auto transition-transform", appsOpen && "rotate-90")} />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {appItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        onClick={() => navigate(item.path)}
                        tooltip={item.title}
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        <SidebarSeparator className="bg-sidebar-border/10" />

        {/* Chats */}
        <SidebarGroup className="flex-1 min-h-0">
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40">
            Chats
          </SidebarGroupLabel>
          <SidebarGroupContent className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <SidebarMenu>
                {/* Pinned */}
                {pinnedConversations.map(conv => (
                  <ConversationItem key={conv.id} conversation={conv} />
                ))}
                
                {pinnedConversations.length > 0 && recentConversations.length > 0 && (
                  <div className="my-1" />
                )}

                {/* Recent */}
                {recentConversations.map(conv => (
                  <ConversationItem key={conv.id} conversation={conv} />
                ))}

                {/* Empty */}
                {filteredConversations.length === 0 && !collapsed && (
                  <div className="text-center py-6">
                    <p className="text-xs text-sidebar-foreground/30">
                      {searchTerm ? 'No results' : 'No conversations yet'}
                    </p>
                  </div>
                )}

                {/* Load More */}
                {hasMore && !collapsed && (
                  <SidebarMenuItem>
                    <Button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      variant="ghost"
                      size="sm"
                      className="w-full text-sidebar-foreground/40 hover:text-sidebar-foreground h-7 text-xs"
                    >
                      {isLoadingMore ? (
                        <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Loading...</>
                      ) : (
                        <><ChevronDown className="h-3 w-3 mr-1" /> More</>
                      )}
                    </Button>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer - User Profile */}
      <SidebarFooter>
        <SidebarSeparator className="bg-sidebar-border/10" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleOpenSettings}
              tooltip="Settings"
              className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
            >
              <div className="w-6 h-6 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
                <User className="h-3.5 w-3.5 text-sidebar-accent-foreground" />
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <span className="truncate text-sm">{user?.email?.split('@')[0] || 'User'}</span>
                  <Settings className="h-3.5 w-3.5 text-sidebar-foreground/30" />
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
