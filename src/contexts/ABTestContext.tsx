import React, { createContext, useContext, useEffect, useState } from 'react';
import { abTestService, ABTest, ABTestVariant } from '@/services/abTestService';
import { abTestAnalyticsService, TestAnalysis } from '@/services/abTestAnalyticsService';

interface ABTestContextType {
  // Test Management
  tests: ABTest[];
  activeTests: ABTest[];
  loading: boolean;
  
  // Actions
  createTest: (test: Omit<ABTest, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<ABTest | null>;
  updateTest: (testId: string, updates: Partial<ABTest>) => Promise<ABTest | null>;
  deleteTest: (testId: string) => Promise<boolean>;
  startTest: (testId: string) => Promise<boolean>;
  pauseTest: (testId: string) => Promise<boolean>;
  completeTest: (testId: string) => Promise<boolean>;
  
  // Variant Management
  createVariant: (variant: Omit<ABTestVariant, 'id' | 'created_at' | 'updated_at'>) => Promise<ABTestVariant | null>;
  getVariant: (testId: string) => Promise<ABTestVariant | null>;
  
  // Event Tracking
  trackEvent: (testId: string, eventType: string, eventValue?: number, metadata?: Record<string, any>) => Promise<boolean>;
  
  // Analytics
  getTestAnalysis: (testId: string) => Promise<TestAnalysis | null>;
  
  // Utilities
  refreshTests: () => Promise<void>;
}

const ABTestContext = createContext<ABTestContextType | undefined>(undefined);

export const ABTestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);

  const activeTests = tests.filter(test => test.status === 'active');

  const refreshTests = async () => {
    setLoading(true);
    try {
      const userTests = await abTestService.getUserTests();
      setTests(userTests);
    } catch (error) {
      console.error('Error refreshing tests:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshTests();
  }, []);

  const createTest = async (test: Omit<ABTest, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ABTest | null> => {
    const newTest = await abTestService.createTest(test);
    if (newTest) {
      setTests(prev => [newTest, ...prev]);
    }
    return newTest;
  };

  const updateTest = async (testId: string, updates: Partial<ABTest>): Promise<ABTest | null> => {
    const updatedTest = await abTestService.updateTest(testId, updates);
    if (updatedTest) {
      setTests(prev => prev.map(test => test.id === testId ? updatedTest : test));
    }
    return updatedTest;
  };

  const deleteTest = async (testId: string): Promise<boolean> => {
    const success = await abTestService.deleteTest(testId);
    if (success) {
      setTests(prev => prev.filter(test => test.id !== testId));
    }
    return success;
  };

  const startTest = async (testId: string): Promise<boolean> => {
    const success = await abTestService.startTest(testId);
    if (success) {
      await refreshTests();
    }
    return success;
  };

  const pauseTest = async (testId: string): Promise<boolean> => {
    const success = await abTestService.pauseTest(testId);
    if (success) {
      await refreshTests();
    }
    return success;
  };

  const completeTest = async (testId: string): Promise<boolean> => {
    const success = await abTestService.completeTest(testId);
    if (success) {
      await refreshTests();
    }
    return success;
  };

  const createVariant = async (variant: Omit<ABTestVariant, 'id' | 'created_at' | 'updated_at'>): Promise<ABTestVariant | null> => {
    return await abTestService.createVariant(variant);
  };

  const getVariant = async (testId: string): Promise<ABTestVariant | null> => {
    return await abTestService.getVariantAssignment(testId);
  };

  const trackEvent = async (
    testId: string, 
    eventType: string, 
    eventValue?: number, 
    metadata: Record<string, any> = {}
  ): Promise<boolean> => {
    return await abTestService.trackEvent(testId, eventType, eventValue, metadata);
  };

  const getTestAnalysis = async (testId: string): Promise<TestAnalysis | null> => {
    return await abTestAnalyticsService.calculateTestResults(testId);
  };

  const value: ABTestContextType = {
    tests,
    activeTests,
    loading,
    createTest,
    updateTest,
    deleteTest,
    startTest,
    pauseTest,
    completeTest,
    createVariant,
    getVariant,
    trackEvent,
    getTestAnalysis,
    refreshTests
  };

  return (
    <ABTestContext.Provider value={value}>
      {children}
    </ABTestContext.Provider>
  );
};

export const useABTest = () => {
  const context = useContext(ABTestContext);
  if (context === undefined) {
    throw new Error('useABTest must be used within an ABTestProvider');
  }
  return context;
};