import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { 
  contentStrategyService, 
  ContentStrategy, 
  CalendarItem, 
  PipelineItem, 
  StrategyInsight 
} from '@/services/contentStrategyService';
import { proposalPipelineSync } from '@/services/proposalPipelineSync';
import { supabase } from '@/integrations/supabase/client';

interface ContentItem {
  id: string;
  title: string;
  status: string;
  updated_at: string;
}

interface ContentStrategyContextType {
  // Current state
  currentStrategy: ContentStrategy | null;
  strategies: ContentStrategy[];
  calendarItems: CalendarItem[];
  pipelineItems: PipelineItem[];  
  contentItems: ContentItem[];
  insights: StrategyInsight[];
  loading: boolean;
  loadingProposals: boolean;
  loadingCalendar: boolean;

  // AI Proposals state
  aiProposals: any[];
  setAiProposals: (proposals: any[] | ((prev: any[]) => any[])) => void;
  selectedProposals: Record<string, boolean>;
  setSelectedProposals: (selected: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;

  // Strategy management
  createStrategy: (strategy: Partial<ContentStrategy>) => Promise<void>;
  updateStrategy: (id: string, updates: Partial<ContentStrategy>) => Promise<void>;
  
  // Calendar management
  createCalendarItem: (item: Partial<CalendarItem>) => Promise<void>;
  updateCalendarItem: (id: string, updates: Partial<CalendarItem>) => Promise<void>;
  deleteCalendarItem: (id: string) => Promise<void>;
  
  // Pipeline management
  createPipelineItem: (item: Partial<PipelineItem>) => Promise<void>;
  updatePipelineItem: (id: string, updates: Partial<PipelineItem>) => Promise<void>;
  deletePipelineItem: (id: string) => Promise<void>;
  
  // Analysis and insights
  analyzeSERP: (keyword: string) => Promise<any>;
  saveInsight: (insight: Partial<StrategyInsight>) => Promise<void>;
  
  // AI Strategy Generation
  generateGoalBasedProposals: (goals: any) => Promise<void>;
  
  // Data refresh
  refreshData: () => Promise<void>;
}

export const ContentStrategyContext = createContext<ContentStrategyContextType | undefined>(undefined);

export const ContentStrategyProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [currentStrategy, setCurrentStrategy] = useState<ContentStrategy | null>(null);
  const [strategies, setStrategies] = useState<ContentStrategy[]>([]);
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [pipelineItems, setPipelineItems] = useState<PipelineItem[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [insights, setInsights] = useState<StrategyInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  // AI Proposals state
  const [aiProposals, setAiProposals] = useState<any[]>([]);
  const [selectedProposals, setSelectedProposals] = useState<Record<string, boolean>>({});

  const loadData = useCallback(async () => {
    if (!user) {
      setCurrentStrategy(null);
      setStrategies([]);
      setCalendarItems([]);
      setPipelineItems([]);
      setContentItems([]);
      setInsights([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Load critical data first (strategies, active strategy, and proposals)
      const [strategiesData, activeStrategy, proposalsData] = await Promise.all([
        contentStrategyService.getStrategies(),
        contentStrategyService.getActiveStrategy(),
        contentStrategyService.getAIProposals(50, 0)
      ]);

      setStrategies(strategiesData);
      setCurrentStrategy(activeStrategy);
      setAiProposals(proposalsData);
      setLoading(false);

      // Load secondary data in background without blocking UI
      setTimeout(async () => {
        try {
          setLoadingCalendar(true);
          const [calendarData, pipelineData, insightsData, contentData] = await Promise.all([
            contentStrategyService.getCalendarItems(),
            contentStrategyService.getPipelineItems(),
            contentStrategyService.getInsights(),
            supabase
              .from('content_items')
              .select('id, title, status, updated_at')
              .eq('user_id', user.id)
              .in('status', ['draft', 'approved', 'published'])
              .order('updated_at', { ascending: false })
              .limit(50)
          ]);

          setCalendarItems(calendarData);
          setPipelineItems(pipelineData);
          setContentItems(contentData.data || []);
          setInsights(insightsData);
        } catch (error: any) {
          console.error('Error loading secondary data:', error);
        } finally {
          setLoadingCalendar(false);
        }
      }, 100);
      
    } catch (error: any) {
      console.error('Error loading content strategy data:', error);
      toast.error('Failed to load strategy data');
      setLoading(false);
    }
  }, [user]);

  // Auto-sync selected proposals to pipeline
  useEffect(() => {
    const syncProposalsToPipeline = async () => {
      if (!user || !aiProposals.length || Object.keys(selectedProposals).length === 0) return;
      
      try {
        await proposalPipelineSync.syncSelectedProposals(
          selectedProposals,
          aiProposals,
          pipelineItems,
          user.id,
          currentStrategy?.id
        );
        
        // Refresh pipeline data to show new items
        const updatedPipelineData = await contentStrategyService.getPipelineItems();
        setPipelineItems(updatedPipelineData);
      } catch (error) {
        console.error('Error syncing proposals to pipeline:', error);
        toast.error('Failed to sync proposals to pipeline');
      }
    };

    // Debounce the sync to avoid too many calls
    const timeoutId = setTimeout(syncProposalsToPipeline, 500);
    return () => clearTimeout(timeoutId);
  }, [selectedProposals, aiProposals, user, currentStrategy?.id]);

  useEffect(() => {
    loadData();
  }, [user]);

  const createStrategy = async (strategy: Partial<ContentStrategy>) => {
    if (!user) return;
    
    try {
      const newStrategy = await contentStrategyService.createStrategy({
        ...strategy,
        user_id: user.id
      });
      setCurrentStrategy(newStrategy);
      setStrategies(prev => [newStrategy, ...prev.map(s => ({ ...s, is_active: false }))]);
      toast.success('Content strategy created successfully');
    } catch (error: any) {
      console.error('Error creating strategy:', error);
      toast.error('Failed to create strategy');
    }
  };

  const updateStrategy = async (id: string, updates: Partial<ContentStrategy>) => {
    try {
      const updatedStrategy = await contentStrategyService.updateStrategy(id, updates);
      setStrategies(prev => prev.map(s => s.id === id ? updatedStrategy : s));
      if (currentStrategy?.id === id) {
        setCurrentStrategy(updatedStrategy);
      }
      toast.success('Strategy updated successfully');
    } catch (error: any) {
      console.error('Error updating strategy:', error);
      toast.error('Failed to update strategy');
    }
  };

  const createCalendarItem = async (item: Partial<CalendarItem>) => {
    if (!user) return;
    
    try {
      const newItem = await contentStrategyService.createCalendarItem({
        ...item,
        user_id: user.id,
        strategy_id: currentStrategy?.id
      });
      setCalendarItems(prev => [newItem, ...prev]);
      toast.success('Calendar item created');
    } catch (error: any) {
      console.error('Error creating calendar item:', error);
      toast.error('Failed to create calendar item');
    }
  };

  const updateCalendarItem = async (id: string, updates: Partial<CalendarItem>) => {
    try {
      const updatedItem = await contentStrategyService.updateCalendarItem(id, updates);
      setCalendarItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      toast.success('Calendar item updated');
    } catch (error: any) {
      console.error('Error updating calendar item:', error);
      toast.error('Failed to update calendar item');
    }
  };

  const deleteCalendarItem = async (id: string) => {
    try {
      await contentStrategyService.deleteCalendarItem(id);
      setCalendarItems(prev => prev.filter(item => item.id !== id));
      toast.success('Calendar item deleted');
    } catch (error: any) {
      console.error('Error deleting calendar item:', error);
      toast.error('Failed to delete calendar item');
    }
  };

  const createPipelineItem = async (item: Partial<PipelineItem>) => {
    if (!user) return;
    
    try {
      const newItem = await contentStrategyService.createPipelineItem({
        ...item,
        user_id: user.id,
        strategy_id: currentStrategy?.id
      });
      setPipelineItems(prev => [newItem, ...prev]);
      toast.success('Pipeline item created');
    } catch (error: any) {
      console.error('Error creating pipeline item:', error);
      toast.error('Failed to create pipeline item');
    }
  };

  const updatePipelineItem = async (id: string, updates: Partial<PipelineItem>) => {
    try {
      const updatedItem = await contentStrategyService.updatePipelineItem(id, updates);
      setPipelineItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      toast.success('Pipeline item updated');
    } catch (error: any) {
      console.error('Error updating pipeline item:', error);
      toast.error('Failed to update pipeline item');
    }
  };

  const deletePipelineItem = async (id: string) => {
    try {
      await contentStrategyService.deletePipelineItem(id);
      setPipelineItems(prev => prev.filter(item => item.id !== id));
      toast.success('Pipeline item deleted');
    } catch (error: any) {
      console.error('Error deleting pipeline item:', error);
      toast.error('Failed to delete pipeline item');
    }
  };

  const analyzeSERP = async (keyword: string) => {
    return await contentStrategyService.analyzeSERP(keyword);
  };

  const saveInsight = async (insight: Partial<StrategyInsight>) => {
    if (!user) return;
    
    try {
      const newInsight = await contentStrategyService.saveInsight({
        ...insight,
        user_id: user.id,
        strategy_id: currentStrategy?.id
      });
      setInsights(prev => [newInsight, ...prev]);
    } catch (error: any) {
      console.error('Error saving insight:', error);
    }
  };

  const generateGoalBasedProposals = async (goals: any) => {
    if (!user) return;
    
    try {
      setLoadingProposals(true);
      
      // Always use batch size of 6, regardless of contentPieces goal
      const targetCount = 6;
      const result = await contentStrategyService.generateAIStrategy({ 
        goals: {
          monthlyTraffic: parseInt(goals.monthlyTraffic) || 10000,
          contentPieces: targetCount,
          timeline: goals.timeline || '3 months',
          mainKeyword: goals.mainKeyword || ''
        }, 
        location: 'United States' 
      });
      
      // Use all generated proposals (not limited by content pieces goal)
      const generatedProposals = result.proposals || [];
      
      console.log('🎯 Generated proposals from edge function:', {
        count: generatedProposals.length,
        sample: generatedProposals[0],
        user_id: user.id,
        currentStrategy: currentStrategy?.id
      });
      
      // Save proposals to ai_strategy_proposals table
      if (generatedProposals.length > 0) {
        try {
          // Test database access first
          const { data: testData, error: testError } = await supabase
            .from('ai_strategy_proposals')
            .select('id')
            .limit(1);

          console.log('🔍 Database access test:', { 
            canAccess: !testError, 
            error: testError?.message 
          });

          // Validate and prepare proposals for insertion
          const proposalsToInsert = generatedProposals
            .filter((proposal: any) => {
              const isValid = proposal.title && proposal.primary_keyword;
              if (!isValid) {
                console.warn('⚠️ Skipping invalid proposal:', {
                  title: proposal.title,
                  primary_keyword: proposal.primary_keyword
                });
              }
              return isValid;
            })
            .map((proposal: any) => ({
              // Don't include 'id' - let database auto-generate UUID
              user_id: user.id,
              strategy_session_id: currentStrategy?.id,
              title: proposal.title || 'Untitled',
              description: proposal.description || null,
              primary_keyword: proposal.primary_keyword,
              related_keywords: Array.isArray(proposal.keywords) 
                ? proposal.keywords.map((k: any) => typeof k === 'string' ? k : k.keyword) 
                : [],
              content_type: proposal.content_type || 'blog',
              priority_tag: proposal.priority_tag || 'evergreen',
              estimated_impressions: parseInt(proposal.estimated_impressions) || 0,
              proposal_data: proposal, // Store full proposal for debugging
              status: 'available'
            }));
          
          console.log('💾 Attempting to insert proposals:', {
            count: proposalsToInsert.length,
            sample: proposalsToInsert[0]
          });

          const { data: savedProposals, error: saveError } = await supabase
            .from('ai_strategy_proposals')
            .insert(proposalsToInsert)
            .select();

          if (saveError) {
            console.error('❌ FAILED to save proposals:', {
              error: saveError,
              code: saveError.code,
              message: saveError.message,
              details: saveError.details,
              hint: saveError.hint
            });
            toast.error(`Failed to save proposals: ${saveError.message}`);
            // Don't throw - continue with local state
            setAiProposals(generatedProposals);
          } else {
            console.log('✅ Successfully saved', savedProposals?.length || 0, 'proposals to database');
            toast.success(`Saved ${savedProposals?.length || 0} proposals to your library`);
            
            // Reload proposals from database to ensure UI shows saved data
            try {
              const reloadedProposals = await contentStrategyService.getAIProposals(50, 0);
              setAiProposals(reloadedProposals);
              console.log('✅ Reloaded', reloadedProposals.length, 'proposals from database');
            } catch (reloadError) {
              console.warn('⚠️ Failed to reload proposals:', reloadError);
              setAiProposals(generatedProposals);
            }
          }
        } catch (dbError) {
          console.error('❌ Database error saving proposals:', {
            error: dbError,
            message: dbError instanceof Error ? dbError.message : 'Unknown error'
          });
          toast.error('Database error - using proposals locally only');
          setAiProposals(generatedProposals);
        }
      } else {
        setAiProposals(generatedProposals);
      }
      
      toast.success(`Generated ${generatedProposals.length} AI proposals`);
    } catch (error) {
      console.error('Error generating goal-based proposals:', error);
      toast.error('Failed to generate proposals');
    } finally {
      setLoadingProposals(false);
    }
  };

  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return (
    <ContentStrategyContext.Provider
      value={{
        // Current state
        currentStrategy,
        strategies,
        calendarItems,
        pipelineItems,
        contentItems,
        insights,
        loading,
        loadingProposals,
        loadingCalendar,
        
        // AI Proposals state
        aiProposals,
        setAiProposals,
        selectedProposals,
        setSelectedProposals,
        
        // Strategy management
        createStrategy,
        updateStrategy,
        
        // Calendar management
        createCalendarItem,
        updateCalendarItem,
        deleteCalendarItem,
        
        // Pipeline management
        createPipelineItem,
        updatePipelineItem,
        deletePipelineItem,
        
        // Analysis and insights
        analyzeSERP,
        saveInsight,
        
        // AI Strategy Generation
        generateGoalBasedProposals,
        
        // Data refresh
        refreshData,
      }}
    >
      {children}
    </ContentStrategyContext.Provider>
  );
};

export const useContentStrategy = () => {
  const context = useContext(ContentStrategyContext);
  if (!context || context === undefined) {
    throw new Error('useContentStrategy must be used within a ContentStrategyProvider');
  }
  return context;
};

export const useContentStrategyOptional = () => {
  return useContext(ContentStrategyContext);
};