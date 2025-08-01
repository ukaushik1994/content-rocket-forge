
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

interface ContentStrategyContextType {
  // Strategy state
  currentStrategy: ContentStrategy | null;
  strategies: ContentStrategy[];
  calendarItems: CalendarItem[];
  pipelineItems: PipelineItem[];
  insights: StrategyInsight[];
  loading: boolean;

  // Strategy actions
  createStrategy: (strategy: Partial<ContentStrategy>) => Promise<void>;
  updateStrategy: (id: string, updates: Partial<ContentStrategy>) => Promise<void>;
  
  // Calendar actions
  createCalendarItem: (item: Partial<CalendarItem>) => Promise<void>;
  updateCalendarItem: (id: string, updates: Partial<CalendarItem>) => Promise<void>;
  deleteCalendarItem: (id: string) => Promise<void>;
  
  // Pipeline actions
  createPipelineItem: (item: Partial<PipelineItem>) => Promise<void>;
  updatePipelineItem: (id: string, updates: Partial<PipelineItem>) => Promise<void>;
  deletePipelineItem: (id: string) => Promise<void>;
  
  // SERP analysis
  analyzeSERP: (keyword: string) => Promise<any>;
  saveInsight: (insight: Partial<StrategyInsight>) => Promise<void>;
  
  // Data refresh
  refreshData: () => Promise<void>;
}

const ContentStrategyContext = createContext<ContentStrategyContextType | undefined>(undefined);

export const ContentStrategyProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [currentStrategy, setCurrentStrategy] = useState<ContentStrategy | null>(null);
  const [strategies, setStrategies] = useState<ContentStrategy[]>([]);
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [pipelineItems, setPipelineItems] = useState<PipelineItem[]>([]);
  const [insights, setInsights] = useState<StrategyInsight[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) {
      setCurrentStrategy(null);
      setStrategies([]);
      setCalendarItems([]);
      setPipelineItems([]);
      setInsights([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [strategiesData, activeStrategy, calendarData, pipelineData, insightsData] = await Promise.all([
        contentStrategyService.getStrategies(),
        contentStrategyService.getActiveStrategy(),
        contentStrategyService.getCalendarItems(),
        contentStrategyService.getPipelineItems(),
        contentStrategyService.getInsights()
      ]);

      setStrategies(strategiesData);
      setCurrentStrategy(activeStrategy);
      setCalendarItems(calendarData);
      setPipelineItems(pipelineData);
      setInsights(insightsData);
    } catch (error: any) {
      console.error('Error loading content strategy data:', error);
      toast.error('Failed to load strategy data');
    } finally {
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

  const refreshData = async () => {
    await loadData();
  };

  return (
    <ContentStrategyContext.Provider
      value={{
        currentStrategy,
        strategies,
        calendarItems,
        pipelineItems,
        insights,
        loading,
        createStrategy,
        updateStrategy,
        createCalendarItem,
        updateCalendarItem,
        deleteCalendarItem,
        createPipelineItem,
        updatePipelineItem,
        deletePipelineItem,
        analyzeSERP,
        saveInsight,
        refreshData
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
