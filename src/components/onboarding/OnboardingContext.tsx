import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingContextType {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  showBusinessSetup: boolean;
  startOnboarding: () => void;
  endOnboarding: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  skipOnboarding: () => void;
  hasCompletedOnboarding: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

const TOTAL_STEPS = 10;
const STORAGE_KEY = 'creAiter-onboarding-completed';

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showBusinessSetup, setShowBusinessSetup] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  const startOnboarding = useCallback(() => {
    setIsActive(true);
    setCurrentStep(0);
    setShowBusinessSetup(false);
  }, []);

  const endOnboarding = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    setShowBusinessSetup(false);
    setHasCompletedOnboarding(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // On final step, show business setup form instead of ending
      setShowBusinessSetup(true);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (showBusinessSetup) {
      // Go back to last tour step from business setup
      setShowBusinessSetup(false);
    } else if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep, showBusinessSetup]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < TOTAL_STEPS) {
      setCurrentStep(step);
      setShowBusinessSetup(false);
    }
  }, []);

  const skipOnboarding = useCallback(async () => {
    // H11: Insert default company_info if none exists so downstream features don't crash
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: existing } = await supabase
          .from('company_info')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();
        
        if (!existing) {
          await supabase.from('company_info').insert({
            user_id: user.id,
            name: 'My Company',
          });
        }
      }
    } catch (e) {
      console.warn('⚠️ Failed to ensure company_info on skip (non-critical):', e);
    }
    endOnboarding();
  }, [endOnboarding]);

  return (
    <OnboardingContext.Provider
      value={{
        isActive,
        currentStep,
        totalSteps: TOTAL_STEPS,
        showBusinessSetup,
        startOnboarding,
        endOnboarding,
        nextStep,
        prevStep,
        goToStep,
        skipOnboarding,
        hasCompletedOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};
