import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { 
  contentStrategyService, 
  ContentStrategy, 
  CalendarItem, 
  PipelineItem, 
  StrategyInsight 
} from '@/services/contentStrategyService';

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

  // AI Proposals state
  const [aiProposals, setAiProposals] = useState<any[]>([]);
  const [selectedProposals, setSelectedProposals] = useState<Record<string, boolean>>({});

  const loadData = async () => {
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
      
      // Load critical data first (strategies and active strategy)
      const [strategiesData, activeStrategy] = await Promise.all([
        contentStrategyService.getStrategies(),
        contentStrategyService.getActiveStrategy()
      ]);

      setStrategies(strategiesData);
      setCurrentStrategy(activeStrategy);
      setLoading(false);

      // Load secondary data in background without blocking UI
      setTimeout(async () => {
        try {
          const [calendarData, pipelineData, insightsData] = await Promise.all([
            contentStrategyService.getCalendarItems(),
            contentStrategyService.getPipelineItems(),
            contentStrategyService.getInsights()
          ]);

          setCalendarItems(calendarData);
          setPipelineItems(pipelineData);
          setContentItems([]); // TODO: Load from content service when available
          setInsights(insightsData);
        } catch (error: any) {
          console.error('Error loading secondary data:', error);
        }
      }, 100);
      
    } catch (error: any) {
      console.error('Error loading content strategy data:', error);
      toast.error('Failed to load strategy data');
      setLoading(false);
    }
  };

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
      const targetCount = parseInt(goals.contentPieces) || 5;
      const result = await contentStrategyService.generateAIStrategy({ 
        goals: {
          monthlyTraffic: parseInt(goals.monthlyTraffic) || 10000,
          contentPieces: targetCount,
          timeline: goals.timeline || '3 months',
          mainKeyword: goals.mainKeyword || ''
        }, 
        location: 'United States' 
      });
      
      // Take exactly the number of proposals matching the goal
      const limitedProposals = result.proposals?.slice(0, targetCount) || [];
      setAiProposals(limitedProposals);
      
      toast.success(`Generated ${limitedProposals.length} proposals matching your ${targetCount} content pieces goal`);
    } catch (error) {
      console.error('Error generating goal-based proposals:', error);
      toast.error('Failed to generate proposals');
    }
  };

  const refreshData = async () => {
    await loadData();
  };

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
  if (context === undefined) {
    throw new Error('useContentStrategy must be used within a ContentStrategyProvider');
  }
  return context;
};

export const useContentStrategyOptional = () => {
  return useContext(ContentStrategyContext);
};