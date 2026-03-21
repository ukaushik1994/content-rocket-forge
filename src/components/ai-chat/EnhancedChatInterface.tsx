import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAnalystEngine } from '@/hooks/useAnalystEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedMessageBubble } from './EnhancedMessageBubble';
import { ContextAwareMessageInput } from './ContextAwareMessageInput';
import { EnhancedQuickActions } from './EnhancedQuickActions';
import { PlatformSummaryCard } from './PlatformSummaryCard';
import { DynamicGreeting } from './DynamicGreeting';
import { GettingStartedChecklist } from './GettingStartedChecklist';
import { VisualizationSidebar } from './VisualizationSidebar';
import { ThinkingTextRotator } from './ThinkingTextRotator';
import { SolutionIntelligenceCard } from './SolutionIntelligenceCard';
import { SolutionSuggestions } from './SolutionSuggestions';
import { SolutionContextCard } from './SolutionContextCard';
import { SolutionRecommendations } from './SolutionRecommendations';
import { SolutionWorkflowTemplates } from './SolutionWorkflowTemplates';
import { ConversationAnalyticsModal } from './ConversationAnalyticsModal';
import { MessageSearchBar } from './MessageSearchBar';
import { useSharedAIChatDB } from '@/contexts/AIChatDBContext';
import { useResponsiveBreakpoint } from '@/hooks/useResponsiveBreakpoint';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AiServiceStatusIndicator } from '@/components/ai/AiServiceStatusIndicator';
import { PageBreadcrumb } from '@/components/shared/PageBreadcrumb';
import { RateLimitBanner } from '@/components/common/RateLimitBanner';
import { GlobalApiStatus } from '@/components/common/GlobalApiStatus';
import { Brain, TrendingUp, History, MoreVertical, Share2, Download, Trash2, Search, Sparkles, AlertTriangle, Clock, CalendarX, CheckCircle2, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChartConfiguration } from '@/types/enhancedChat';
import { cn } from '@/lib/utils';
import { extractWizardContext, WizardContextExtraction } from '@/services/wizardContextExtraction';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { APIKeyOnboarding } from '@/components/onboarding/APIKeyOnboarding';

interface EnhancedChatInterfaceProps {
  className?: string;
}

export const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  className = ""
}) => {
  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isTyping,
    searchTerm,
    createConversation,
    deleteConversation,
    sendMessage,
    handleAction,
    handleLegacyAction,
    selectConversation,
    togglePinConversation,
    toggleArchiveConversation,
    addTagToConversation,
    removeTagFromConversation,
    exportConversation,
    shareConversation,
    searchConversations,
    clearSearch,
    editMessage,
    deleteMessage,
    handleConfirmAction,
    handleCancelAction,
    setAnalystActive,
    progressText,
    handleFeedback,
    handlePinMessage,
    justCreatedConversation
  } = useSharedAIChatDB();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // API Key onboarding gate
  const [showKeyOnboarding, setShowKeyOnboarding] = useState(false);
  const [hasCheckedKeys, setHasCheckedKeys] = useState(false);

  useEffect(() => {
    if (!user || hasCheckedKeys) return;
    const checkKeys = async () => {
      const { count, error } = await supabase
        .from('api_keys')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true);
      if (!error && (count === null || count === 0)) {
        setShowKeyOnboarding(true);
      }
      setHasCheckedKeys(true);
    };
    checkKeys();
  }, [user, hasCheckedKeys]);

  // 4b: Proactive insights on welcome screen
  const [proactiveInsights, setProactiveInsights] = useState<Array<{type: string; label: string; count: number; icon: React.ReactNode}>>([]);
  // Sprint 3: AI-generated proactive recommendations
  const [aiRecommendations, setAiRecommendations] = useState<Array<{id: string; type: string; title: string; description: string; action: string; priority: number}>>([]);
  // 4e: Conversation templates from patterns
  const [workflowTemplates, setWorkflowTemplates] = useState<string[]>([]);
  // E6: Brand voice detection moved to offerings page

  useEffect(() => {
    if (!user || messages.length > 0) return;
    const fetchInsights = async () => {
      try {
        const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString();
        const sevenDaysFromNow = new Date(Date.now() + 7 * 86400000).toISOString();
        const today = new Date().toISOString().split('T')[0];

        const [staleDrafts, failedQueue, calendarItems, pendingApprovals] = await Promise.all([
          supabase.from('content_items').select('id', { count: 'exact', head: true })
            .eq('user_id', user.id).eq('status', 'draft').lt('updated_at', fourteenDaysAgo),
          supabase.from('content_generation_queue').select('id', { count: 'exact', head: true })
            .eq('user_id', user.id).eq('status', 'failed'),
          supabase.from('content_calendar').select('id', { count: 'exact', head: true })
            .eq('user_id', user.id).gte('scheduled_date', today).lte('scheduled_date', sevenDaysFromNow),
          supabase.from('content_approvals').select('id', { count: 'exact', head: true })
            .eq('reviewer_id', user.id).eq('status', 'pending_review'),
        ]);

        const insights: typeof proactiveInsights = [];
        if ((staleDrafts.count ?? 0) > 0) insights.push({ type: 'stale', label: 'Stale drafts (>14d)', count: staleDrafts.count!, icon: <Clock className="h-3.5 w-3.5" /> });
        if ((failedQueue.count ?? 0) > 0) insights.push({ type: 'failed', label: 'Failed queue items', count: failedQueue.count!, icon: <AlertTriangle className="h-3.5 w-3.5" /> });
        if ((calendarItems.count ?? 0) === 0) insights.push({ type: 'empty_cal', label: 'Empty calendar this week', count: 0, icon: <CalendarX className="h-3.5 w-3.5" /> });
        if ((pendingApprovals.count ?? 0) > 0) insights.push({ type: 'approvals', label: 'Pending approvals', count: pendingApprovals.count!, icon: <CheckCircle2 className="h-3.5 w-3.5" /> });
        setProactiveInsights(insights);
      } catch (_) { /* non-blocking */ }
    };

    const fetchTemplates = async () => {
      try {
        const { data: convos } = await supabase.from('ai_conversations')
          .select('title').eq('user_id', user.id)
          .order('updated_at', { ascending: false }).limit(20);
        if (!convos?.length) return;
        const patterns: Record<string, number> = {};
        for (const c of convos) {
          if (!c.title) continue;
          const match = c.title.match(/^(Write|Create|Analyze|Generate|Draft|Plan|Research|Compare|Optimize|Review)\s+.{3,}/i);
          if (match) {
            const key = c.title.substring(0, 40).trim();
            patterns[key] = (patterns[key] || 0) + 1;
          }
        }
        const sorted = Object.entries(patterns).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k]) => k);
        setWorkflowTemplates(sorted);
      } catch (_) { /* non-blocking */ }
    };


    fetchInsights();
    fetchTemplates();

    // Sprint 3: Fetch AI-generated proactive recommendations
    const fetchAiRecs = async () => {
      try {
        const { data } = await supabase.from('proactive_recommendations')
          .select('id, type, title, description, action, priority')
          .eq('user_id', user.id)
          .eq('dismissed', false)
          .eq('acted_on', false)
          .order('priority', { ascending: true })
          .limit(3);
        if (data?.length) setAiRecommendations(data);
      } catch (_) { /* non-blocking */ }
    };
    fetchAiRecs();
    
  }, [user, messages.length]);

  // Analyst engine: per-conversation — isActive is deferred to after sidebar state declared
  const activeConvObj = conversations.find(c => c.id === activeConversation);

  // Message search state
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  // Derive search results as a pure memo (no setState inside useMemo)
  const messageSearchResults = React.useMemo(() => {
    if (!messageSearchQuery.trim()) return [];
    const q = messageSearchQuery.toLowerCase();
    return messages.filter((m) => m.content.toLowerCase().includes(q)).map((m) => m.id);
  }, [messages, messageSearchQuery]);


  // Handle search navigation
  const handleNavigateMatch = (direction: 'prev' | 'next') => {
    if (messageSearchResults.length === 0) return;

    if (direction === 'next') {
      setCurrentMatchIndex((prev) =>
      prev >= messageSearchResults.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentMatchIndex((prev) =>
      prev <= 0 ? messageSearchResults.length - 1 : prev - 1
      );
    }
  };

  // Scroll to current match
  useEffect(() => {
    if (messageSearchResults.length > 0 && currentMatchIndex < messageSearchResults.length) {
      const matchId = messageSearchResults[currentMatchIndex];
      const element = document.getElementById(`message-${matchId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentMatchIndex, messageSearchResults]);

  const { pendingPanel, setPendingPanel, isSidebarOpen } = useSidebarContext();
  const [contextSources, setContextSources] = useState<any[]>([]);
  const [showContextIndicator, setShowContextIndicator] = useState(false);
  const [isExtractingContext, setIsExtractingContext] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Visualization sidebar state
  const [showVisualizationSidebar, setShowVisualizationSidebar] = useState(false);
  const [visualizationData, setVisualizationData] = useState<{
    visualData: any;
    chartConfig: ChartConfiguration | null;
    title?: string;
    description?: string;
  } | null>(null);

  // Smart persistence: track if user has interacted with sidebar
  const [sidebarInteracted, setSidebarInteracted] = useState(false);

  // Issue #4 Fix: Track explicit user close intent
  const [userClosedSidebar, setUserClosedSidebar] = useState(false);

  // Phase 1 Fix: Track previous message count for smart auto-open
  const prevMessageCountRef = useRef(0);

  // Phase 1 Fix: Loading state for conversation transitions
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  // ─── Per-Conversation Analyst State Persistence ─────────────────────────
  const ANALYST_STATE_KEY = 'analyst_sidebar_state';
  const MAX_STORED_STATES = 30;

  const saveAnalystOpenState = useCallback((convId: string, isOpen: boolean) => {
    try {
      const raw = localStorage.getItem(ANALYST_STATE_KEY);
      const states: Record<string, boolean> = raw ? JSON.parse(raw) : {};
      states[convId] = isOpen;
      // Cap at MAX entries
      const keys = Object.keys(states);
      if (keys.length > MAX_STORED_STATES) {
        for (const k of keys.slice(0, keys.length - MAX_STORED_STATES)) delete states[k];
      }
      localStorage.setItem(ANALYST_STATE_KEY, JSON.stringify(states));
    } catch { /* quota */ }
  }, []);

  const getAnalystOpenState = useCallback((convId: string): boolean | null => {
    try {
      const raw = localStorage.getItem(ANALYST_STATE_KEY);
      if (!raw) return null;
      const states: Record<string, boolean> = JSON.parse(raw);
      return states[convId] ?? null;
    } catch { return null; }
  }, []);

  // Analyst engine: per-conversation, uses sidebar visibility
  const isAnalystVisible = showVisualizationSidebar && visualizationData?.visualData?.type === 'analyst';
  const analystState = useAnalystEngine(messages, user?.id || null, isAnalystVisible || messages.length > 0, activeConvObj?.title || null, activeConversation);

  // Handle manual expand visualization (kept for backwards compatibility)
  const handleExpandVisualization = (visualData: any, chartConfig: ChartConfiguration) => {
    setVisualizationData({
      visualData,
      chartConfig,
      title: visualData?.title || chartConfig?.title,
      description: visualData?.description
    });
    setShowVisualizationSidebar(true);
    setSidebarInteracted(true); // Manual expand counts as interaction
  };

  // Handle setting visualization from choice card (content_wizard or proposal_browser)
  const handleSetVisualization = (visualData: any) => {
    setVisualizationData({
      visualData,
      chartConfig: null,
      title: visualData?.title,
      description: visualData?.description
    });
    setShowVisualizationSidebar(true);
    setSidebarInteracted(true);
    setUserClosedSidebar(false);
  };

  // Consume pending panel from SidebarContext (when navigating from other pages)
  useEffect(() => {
    if (pendingPanel) {
      if (pendingPanel === 'content_wizard') {
        handleSetVisualization({ type: 'content_wizard', keyword: '', content_type: 'blog' });
      } else {
        handleSetVisualization({ type: pendingPanel });
      }
      setPendingPanel(null);
    }
  }, [pendingPanel, setPendingPanel]);

  // SB-1: Auto-open wizard when navigated with selectedProposal from Proposals page
  useEffect(() => {
    const state = location.state as { selectedProposal?: any } | null;
    if (state?.selectedProposal) {
      const p = state.selectedProposal;
      handleSetVisualization({
        type: 'content_wizard',
        keyword: typeof p.primary_keyword === 'string' ? p.primary_keyword : p.primary_keyword?.keyword || '',
        solution_id: p.solution_id,
        content_type: p.content_type || 'blog',
        extractedContext: {
          keyword: typeof p.primary_keyword === 'string' ? p.primary_keyword : p.primary_keyword?.keyword || '',
          title: p.title,
          description: p.description,
          related_keywords: p.related_keywords,
          solution_id: p.solution_id,
          content_type: p.content_type || 'blog',
        }
      });
      // Clear navigation state to prevent re-triggering
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);


  // AUTO-OPEN sidebar when AI response contains visual data OR first message sent
  // Respects user's explicit close intent (Issue #4 fix)
  useEffect(() => {
    // If user explicitly closed sidebar, don't auto-open
    if (userClosedSidebar) {
      prevMessageCountRef.current = messages.length;
      return;
    }

    if (messages.length === 0) {
      // No messages - close sidebar if user hasn't interacted
      if (!sidebarInteracted) {
        setShowVisualizationSidebar(false);
      }
      prevMessageCountRef.current = 0;
      return;
    }

    // Phase 1 Fix: Only auto-open when a genuinely NEW message arrives
    const isNewMessage = messages.length > prevMessageCountRef.current;
    const wasEmpty = prevMessageCountRef.current === 0;
    prevMessageCountRef.current = messages.length;

    // Auto-open analyst panel on first message ONLY for brand-new conversations
    if (wasEmpty && messages.length > 0 && justCreatedConversation.current) {
      justCreatedConversation.current = false;
      setVisualizationData({
        visualData: { type: 'analyst' },
        chartConfig: null,
        title: 'Intelligence Panel',
        description: 'Charts & insights companion'
      });
      setShowVisualizationSidebar(true);
      setSidebarInteracted(true);
      setAnalystActive(true);
      // Save open state for this conversation
      if (activeConversation) saveAnalystOpenState(activeConversation, true);
      return;
    }

    if (!isNewMessage) {
      // Loading history - don't auto-open unless user interacted
      if (!sidebarInteracted) {
        setShowVisualizationSidebar(false);
      }
      return;
    }

    // Find the most recent assistant message with visual data
    const messagesWithVisualData = messages.filter((msg) =>
    msg.role === 'assistant' &&
    msg.visualData &&
    msg.visualData.type !== 'serp_analysis' &&
    msg.visualData.type !== 'content_creation_choice'
    );

    const latestVisualization = messagesWithVisualData[messagesWithVisualData.length - 1];

    if (latestVisualization?.visualData) {
      const chartConfig = latestVisualization.visualData?.chartConfig || null;
      setVisualizationData({
        visualData: latestVisualization.visualData,
        chartConfig,
        title: latestVisualization.visualData?.title || 'Data Visualization',
        description: latestVisualization.visualData?.description
      });
      setShowVisualizationSidebar(true);
    } else if (!sidebarInteracted) {
      // Keep sidebar open with analyst view if already showing
    }
  }, [messages, sidebarInteracted, userClosedSidebar]);

  // Phase 1 Fix: Reset sidebar state when switching conversations — restore from localStorage
  useEffect(() => {
    setUserClosedSidebar(false);
    setSidebarInteracted(false);
    prevMessageCountRef.current = 0;
    setIsLoadingConversation(true);

    if (activeConversation) {
      const savedState = getAnalystOpenState(activeConversation);
      if (savedState === true) {
        // Restore analyst sidebar for this conversation
        setVisualizationData({
          visualData: { type: 'analyst' },
          chartConfig: null,
          title: 'Intelligence Panel',
          description: 'Charts & insights companion'
        });
        setShowVisualizationSidebar(true);
        setSidebarInteracted(true);
        setAnalystActive(true);
      } else {
        setShowVisualizationSidebar(false);
        setVisualizationData(null);
      }
    } else {
      setShowVisualizationSidebar(false);
      setVisualizationData(null);
    }

    const timeout = setTimeout(() => setIsLoadingConversation(false), 300);
    return () => clearTimeout(timeout);
  }, [activeConversation, getAnalystOpenState, setAnalystActive]);

  // Track user interaction with sidebar (for smart persistence)
  const handleSidebarInteraction = () => {
    setSidebarInteracted(true);
  };

  // Close sidebar and track user's explicit close intent (Issue #4 fix)
  const handleCloseSidebar = () => {
    setShowVisualizationSidebar(false);
    setSidebarInteracted(false);
    setUserClosedSidebar(true);
    setAnalystActive(false);
    if (activeConversation) saveAnalystOpenState(activeConversation, false);
  };

  // Handle manual open (resets close intent)
  const handleOpenSidebar = () => {
    setShowVisualizationSidebar(true);
    setSidebarInteracted(true);
    setUserClosedSidebar(false);
    if (activeConversation) saveAnalystOpenState(activeConversation, true);
  };

  // Issue #1 Fix: Enhanced scroll using double-RAF to ensure DOM is fully rendered
  const scrollToBottom = React.useCallback(() => {
    // Double requestAnimationFrame ensures DOM updates are complete
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: 'smooth'
          });
        }
      });
    });
  }, []);

  // Auto-scroll to bottom when new messages arrive (Issue #1 enhanced fix)
  useEffect(() => {
    scrollToBottom();
    // Phase 1 Fix: Clear loading state when messages arrive
    if (isLoadingConversation && messages.length > 0) {
      setIsLoadingConversation(false);
    }
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isTyping, scrollToBottom, isLoadingConversation]);




  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  // Handle wizard launch with AI context extraction
  const handleLaunchWizard = useCallback(async (userPrompt: string) => {
    setIsExtractingContext(true);
    try {
      // Get user's solutions for matching
      const { data: { user } } = await supabase.auth.getUser();
      let solutions: {id: string;name: string;}[] = [];

      if (user) {
        try {
          const { data: solutionData } = await supabase.
          from('solutions' as any).
          select('id, name').
          eq('user_id', user.id).
          limit(50);
          solutions = (solutionData || []) as unknown as {id: string;name: string;}[];
        } catch (e) {
          console.warn('Solutions table query failed, continuing without solutions:', e);
        }
      }

      // Build conversation history from current messages
      const conversationHistory = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content
      }));

      // Extract context via AI
      const extracted = await extractWizardContext(userPrompt, conversationHistory, solutions);

      // Open wizard sidebar directly with pre-filled data
      handleSetVisualization({
        type: 'content_wizard',
        keyword: extracted.keyword || userPrompt,
        solution_id: extracted.solution_id,
        content_type: extracted.content_type || 'blog',
        // Pass extraction data for pre-filling
        extractedContext: extracted
      });

      toast.success('Content Wizard ready', {
        description: `Topic: "${extracted.keyword}"${extracted.tone ? ` · Tone: ${extracted.tone}` : ''}`,
        duration: 3000
      });
    } catch (err) {
      console.error('Wizard context extraction failed:', err);
      // Fallback: open wizard with just the user prompt
      handleSetVisualization({
        type: 'content_wizard',
        keyword: userPrompt,
        content_type: 'blog'
      });
    } finally {
      setIsExtractingContext(false);
    }
  }, [messages, handleSetVisualization]);

  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };
  const welcomeVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.2
      }
    },
    exit: {
      opacity: 0,
      y: -40,
      scale: 0.95,
      filter: "blur(4px)",
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };
  const { isMobile, isTablet, isDesktop } = useResponsiveBreakpoint();

  return <div className={cn("h-full flex flex-col", className)}>

      {/* API Key Onboarding Modal */}
      <APIKeyOnboarding
        open={showKeyOnboarding}
        onComplete={() => setShowKeyOnboarding(false)}
      />

      {/* Visualization Sidebar (Right) - positioned within chat area */}
      <VisualizationSidebar
      isOpen={showVisualizationSidebar}
      onClose={handleCloseSidebar}
      visualData={visualizationData?.visualData}
      chartConfig={visualizationData?.chartConfig || null}
      title={visualizationData?.title}
      description={visualizationData?.description}
      onSendMessage={sendMessage}
      onInteract={handleSidebarInteraction}
      analystState={analystState} />
    

      {/* Main Content Area - Chat and Visualization side by side */}
      <div className={cn(
      "flex-1 flex transition-all duration-300 ease-out pt-4 pb-24 overflow-hidden"
    )}>
        {/* Chat Messages Area - shrinks when visualization sidebar is open */}
        <motion.div
        className={cn(
          "flex-1 flex flex-col min-h-0 transition-all duration-300 ease-out",
          // Right margin for visualization - only on xl screens (overlays on smaller)
          showVisualizationSidebar && "xl:mr-[600px]"
        )}
        initial="hidden"
        animate="visible"
        variants={containerVariants}>
        
          {/* 4A: Conversation Goal Chip */}
          {activeConvObj && messages.length > 0 && (
            <div className="mx-6 mt-2 flex items-center gap-2">
              <span className="text-sm font-medium text-foreground/70 truncate max-w-xs">
                {activeConvObj.title || 'New conversation'}
              </span>
              {activeConvObj.goal && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                  <Target className="h-2.5 w-2.5" />
                  {activeConvObj.goal}
                </span>
              )}
            </div>
          )}

        
          {/* Rate Limit Banner */}
          <RateLimitBanner
          className="mx-6 mt-2"
          onRetry={() => {
            const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
            if (lastUserMsg) sendMessage(lastUserMsg.content);
          }} />



          {/* Message Search Bar (toggleable) */}
          {messages.length > 0 &&
        <div className="mx-6 mt-2">
              <div className="flex items-center gap-2">
                <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMessageSearch(!showMessageSearch)}
              className="text-muted-foreground hover:text-foreground">
              
                  <Search className="h-4 w-4 mr-1" />
                  Search
                </Button>
              </div>
              
              <AnimatePresence>
                {showMessageSearch &&
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2">
              
                    <MessageSearchBar
                searchQuery={messageSearchQuery}
                onSearchChange={setMessageSearchQuery}
                onExportConversation={(format) => activeConversation && exportConversation(activeConversation, format as 'json' | 'markdown' | 'txt')}
                onShowAnalytics={() => setShowAnalyticsModal(true)}
                messageCount={messages.length}
                filteredCount={messageSearchResults.length}
                onNavigateMatch={handleNavigateMatch}
                currentMatch={currentMatchIndex + 1}
                totalMatches={messageSearchResults.length} />
              
                  </motion.div>
            }
              </AnimatePresence>
            </div>
        }
          
          {/* Messages Area - with ref for proper scrolling (Issue #1 fix) */}
          <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
            <div className="max-w-6xl mx-auto py-6 space-y-8">
              {/* Phase 1 Fix: Loading skeleton during conversation transitions */}
              {isLoadingConversation && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 space-y-4">
                  <Skeleton className="h-4 w-3/4 max-w-md" />
                  <Skeleton className="h-4 w-1/2 max-w-sm" />
                  <Skeleton className="h-4 w-2/3 max-w-md" />
                </div>
              )}

              {/* Welcome State - Premium Minimal */}
              <AnimatePresence>
              {messages.length === 0 && !isLoadingConversation && <motion.div variants={welcomeVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center justify-center min-h-[60vh] py-12 sm:py-16 lg:py-24 space-y-8">
                    {/* Hero Badge Pill */}
                    <motion.div
                  className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-background/60 backdrop-blur-xl rounded-full border border-border/50"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}>
                  
                      <Brain className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">AI Command Centre</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    </motion.div>

                    {/* Dynamic Rotating Greeting */}
                    <DynamicGreeting firstName={user?.user_metadata?.first_name || user?.user_metadata?.name?.split(' ')[0] || ''} />

                    {/* SB-10: Getting Started Milestones */}
                    <GettingStartedChecklist />

                    {/* Circular Stats */}
                    <PlatformSummaryCard onAction={handleLegacyAction} />

                    {/* 3-Column Layout: Actions | Insights | Recommended */}
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-3xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      {/* Column 1: Quick Actions */}
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-muted-foreground/50 uppercase tracking-wider mb-2 px-3">Quick Actions</span>
                        <EnhancedQuickActions 
                          onAction={handleLegacyAction} 
                          onSetVisualization={handleSetVisualization}
                          
                        />
                      </div>

                      {/* Column 2: Insights */}
                      <div className="flex flex-col gap-1">
                        {proactiveInsights.length > 0 && (
                          <>
                            <span className="text-xs font-medium text-muted-foreground/50 uppercase tracking-wider mb-2 px-3">Insights</span>
                            {proactiveInsights.map((insight) => (
                              <button
                                key={insight.type}
                                onClick={() => {
                                  const prompts: Record<string, string> = {
                                    stale: 'Show me my stale drafts that need attention',
                                    failed: 'What content generation tasks failed?',
                                    empty_cal: 'Help me plan content for this week',
                                    approvals: 'Show me content pending my review'
                                  };
                                  sendMessage(prompts[insight.type] || '');
                                }}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/5 transition-colors text-left"
                              >
                                <span className="shrink-0">{insight.icon}</span>
                                <span>{insight.label}{insight.count > 0 ? ` (${insight.count})` : ''}</span>
                              </button>
                            ))}
                          </>
                        )}
                      </div>

                      {/* Column 3: Recommended */}
                      <div className="flex flex-col gap-1">
                        {aiRecommendations.length > 0 && (
                          <>
                            <span className="text-xs font-medium text-muted-foreground/50 uppercase tracking-wider mb-2 px-3">Recommended</span>
                            {aiRecommendations.map((rec) => (
                              <button
                                key={rec.id}
                                onClick={() => {
                                  sendMessage(rec.action);
                                  (supabase as any).from('proactive_recommendations')
                                    .update({ acted_on: true })
                                    .eq('id', rec.id).then(() => {});
                                  setAiRecommendations(prev => prev.filter(r => r.id !== rec.id));
                                }}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-colors text-left"
                              >
                                <span className="shrink-0 text-primary">✦</span>
                                <span>{rec.title}</span>
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>}
              </AnimatePresence>

              {/* Messages */}
              {messages.length > 0 && <div className="space-y-6">
                  {messages.map((message, index) => {
                const isMatch = messageSearchQuery && message.content.toLowerCase().includes(messageSearchQuery.toLowerCase());
                const isCurrentMatch = messageSearchResults[currentMatchIndex] === message.id;

                return (
                  <div
                    key={message.id}
                    id={`message-${message.id}`}
                    className={cn(
                      "transition-all duration-200",
                      isMatch && "search-highlight",
                      isCurrentMatch && "ring-2 ring-primary/50 rounded-lg"
                    )}>
                    
                    <EnhancedMessageBubble
                      message={message}
                      isLatest={index === messages.length - 1}
                      onAction={handleAction}
                      onSendMessage={sendMessage}
                      onExpandVisualization={handleExpandVisualization}
                      onEditMessage={editMessage}
                      onDeleteMessage={deleteMessage}
                      onConfirmAction={handleConfirmAction}
                      onCancelAction={handleCancelAction}
                      onSetVisualization={handleSetVisualization}
                      onFeedback={handleFeedback}
                      onPinMessage={handlePinMessage}
                      onRetry={async () => {
                        const idx = messages.findIndex((m) => m.id === message.id);
                        const lastUserMsg = messages.slice(0, idx).reverse().find((m) => m.role === 'user');
                        if (lastUserMsg) {
                          sendMessage(lastUserMsg.content);
                        }
                      }} />
                    
                      </div>);

              })}
                </div>}

              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && <ThinkingTextRotator progressText={progressText} />}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </motion.div>
      </div>

      {/* Input Area - ALWAYS full width, respects left sidebar only on desktop */}
      <div className={cn(
      "fixed bottom-0 left-0 right-0 z-40",
      "border-t border-white/5 bg-background/80 backdrop-blur-md",
      "transition-all duration-300 ease-out",
      !isMobile && (isSidebarOpen ? "sm:left-72 lg:left-80" : "sm:left-14")
    )}>
        <div className="max-w-6xl mx-auto px-4 py-3">
          
          <ContextAwareMessageInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading || isExtractingContext}
          placeholder={isExtractingContext ? "Analyzing your request..." : messages.length === 0 ? "Ask Creaiter anything..." : "Continue the conversation..."}
          onOpenProposals={() => {
            handleSetVisualization({
              type: 'proposal_browser',
              title: 'AI Proposals',
              description: 'Browse AI-generated content proposals',
              step: 'solution_selection'
            });
          }}
          onLaunchWizard={handleLaunchWizard}
          onOpenResearch={() => {
            handleSetVisualization({
              type: 'research_intelligence',
              title: 'Research Intelligence',
              description: 'Plan content strategy & identify gaps'
            });
          }}
          onOpenAnalyst={() => {
            // Toggle behavior: if sidebar showing analyst, close it; otherwise open
            if (showVisualizationSidebar && visualizationData?.visualData?.type === 'analyst') {
              handleCloseSidebar();
            } else {
              setAnalystActive(true);
              handleSetVisualization({
                type: 'analyst',
                title: 'Intelligence Panel',
                description: 'Charts & insights companion'
              });
              // Trigger fresh data fetch by resetting analyst engine state
            }
          }}
          onWebSearch={() => {


            // Web search mode is handled in ContextAwareMessageInput
            // The [web-search] prefix is detected by the backend
          }} />
        </div>
      </div>

      {/* Conversation Analytics Modal */}
      <ConversationAnalyticsModal isOpen={showAnalyticsModal}
    onClose={() => setShowAnalyticsModal(false)}
    onGetAnalytics={async () => {
      const userMsgs = messages.filter((m) => m.role === 'user');
      const assistantMsgs = messages.filter((m) => m.role === 'assistant');
      const allLens = messages.map((m) => m.content.length);
      const avgLen = allLens.length > 0 ? Math.round(allLens.reduce((a, b) => a + b, 0) / allLens.length) : 0;
      const duration = messages.length >= 2 ?
      Math.round((new Date(messages[messages.length - 1].timestamp).getTime() - new Date(messages[0].timestamp).getTime()) / 60000) :
      0;
      return {
        totalMessages: messages.length,
        userMessages: userMsgs.length,
        assistantMessages: assistantMsgs.length,
        averageMessageLength: avgLen,
        conversationDuration: duration,
        actionsTriggered: messages.filter((m) => m.actions && m.actions.length > 0).length,
        hasVisualData: messages.some((m) => !!m.visualData),
        hasWorkflowData: messages.some((m) => !!m.workflowContext)
      };
    }} />
    
    </div>;
};