import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface OnboardingContextType {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
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

const TOTAL_STEPS = 8;
const STORAGE_KEY = 'creAiter-onboarding-completed';

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  const startOnboarding = useCallback(() => {
    setIsActive(true);
    setCurrentStep(0);
  }, []);

  const endOnboarding = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    setHasCompletedOnboarding(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      endOnboarding();
    }
  }, [currentStep, endOnboarding]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < TOTAL_STEPS) {
      setCurrentStep(step);
    }
  }, []);

  const skipOnboarding = useCallback(() => {
    endOnboarding();
  }, [endOnboarding]);

  return (
    <OnboardingContext.Provider
      value={{
        isActive,
        currentStep,
        totalSteps: TOTAL_STEPS,
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
