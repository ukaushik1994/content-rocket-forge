import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Trash2, 
  ChevronDown,
  Loader2,
  Pin,
  Archive,
  // Library section
  FileText,
  Puzzle,
  CheckCircle,
  // Tools section
  PenLine,
  Megaphone,
  BarChart3,
  // Engage section
  Mail,
  Share2,
  Users,
  // Visual builders
  Zap,
  GitBranch,
  Settings,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AIConversation } from '@/hooks/useEnhancedAIChatDB';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useResponsiveBreakpoint } from '@/hooks/useResponsiveBreakpoint';

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

// Section header
const SidebarSection: React.FC<{ label: string }> = ({ label }) => (
  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 px-3 pt-4 pb-1.5 font-medium">
    {label}
  </p>
);

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
  className = ""
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [displayLimit, setDisplayLimit] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showChats, setShowChats] = useState(true);

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

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) onToggleSidebar();
  };

  const handlePanel = (panelType: string) => {
    onOpenPanel?.(panelType);
    if (isMobile) onToggleSidebar();
  };

  const sidebarVariants = {
    hidden: { x: -320, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { type: "spring", damping: 25, stiffness: 300 }
    },
    exit: { 
      x: -320, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const { isMobile } = useResponsiveBreakpoint();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 50) {
      onToggleSidebar();
    }
    setTouchStartX(null);
  };

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
        ref={sidebarRef}
        className={cn(
          "fixed left-0 top-16 bottom-0 z-50",
          "w-full sm:w-72 lg:w-80",
          "bg-background/95 backdrop-blur-xl",
          "border-r border-border/10 flex flex-col",
          className
        )}
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* New Chat Button */}
        <div className="p-4 pb-2">
          <Button
            onClick={onCreateConversation}
            variant="ghost"
            className="w-full border border-border/20 text-muted-foreground hover:text-foreground hover:border-border/40 rounded-full h-9"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-2">
            {/* ── LIBRARY ── */}
            <SidebarSection label="Library" />
            <SidebarNavItem icon={<FileText className="h-4 w-4" />} label="Repository" onClick={() => handlePanel('repository')} />
            <SidebarNavItem icon={<Puzzle className="h-4 w-4" />} label="Offerings" onClick={() => handlePanel('offerings')} />
            <SidebarNavItem icon={<CheckCircle className="h-4 w-4" />} label="Approvals" onClick={() => handlePanel('approvals')} />

            {/* ── TOOLS ── */}
            <SidebarSection label="Tools" />
            <SidebarNavItem icon={<PenLine className="h-4 w-4" />} label="Content Wizard" onClick={() => handlePanel('content_wizard')} />
            <SidebarNavItem icon={<Megaphone className="h-4 w-4" />} label="Campaigns" onClick={() => handleNavigation('/campaigns')} />
            <SidebarNavItem icon={<Search className="h-4 w-4" />} label="Keywords" onClick={() => handleNavigation('/keywords')} />
            <SidebarNavItem icon={<BarChart3 className="h-4 w-4" />} label="Analytics" onClick={() => handleNavigation('/analytics')} />

            {/* ── ENGAGE ── */}
            <SidebarSection label="Engage" />
            <SidebarNavItem icon={<Mail className="h-4 w-4" />} label="Email" onClick={() => handleNavigation('/engage/email')} />
            <SidebarNavItem icon={<Share2 className="h-4 w-4" />} label="Social" onClick={() => handleNavigation('/engage/social')} />
            <SidebarNavItem icon={<Users className="h-4 w-4" />} label="Contacts" onClick={() => handleNavigation('/engage/contacts')} />
            <SidebarNavItem icon={<Zap className="h-4 w-4" />} label="Automations" onClick={() => handleNavigation('/engage/automations')} />
            <SidebarNavItem icon={<GitBranch className="h-4 w-4" />} label="Journeys" onClick={() => handleNavigation('/engage/journeys')} />

            {/* ── CHATS ── */}
            <SidebarSection label="Chats" />
            
            {/* Search chats */}
            <div className="px-2 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
                <Input
                  placeholder="Search chats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-transparent border-border/15 text-foreground placeholder:text-muted-foreground/40 focus:border-border/40 focus-visible:ring-0 focus-visible:ring-offset-0 h-8 text-xs rounded-lg"
                />
              </div>
            </div>

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
          </div>
        </ScrollArea>

        {/* Settings at bottom */}
        <div className="p-3 border-t border-border/10">
          <SidebarNavItem 
            icon={<Settings className="h-4 w-4" />} 
            label="Settings" 
            onClick={() => {
              window.dispatchEvent(new CustomEvent('openSettings', { detail: { tab: 'api' } }));
            }} 
          />
        </div>
      </motion.div>
    </>
  );
};
