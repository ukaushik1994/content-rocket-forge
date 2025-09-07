
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TourStep {
  id: string;
  title: string;
  description: React.ReactNode;
  selector?: string;
  position?: 'top' | 'right' | 'bottom' | 'left' | 'center';
  route?: string;
}

interface TourContextType {
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  goToStep: (step: number) => void;
  hasCompletedTour: boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};

export const TourProvider = ({ children }: { children: ReactNode }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedTour, setHasCompletedTour] = useState(() => {
    return localStorage.getItem('app-tour-completed') === 'true';
  });

  const steps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Content Rocket Forge',
      description: (
        <div className="space-y-3">
          <p>Welcome to the most powerful AI-driven content creation platform!</p>
          <p>This tour will guide you through all the features and help you become a content creation expert.</p>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-sm">Let's get started!</span>
          </div>
        </div>
      ),
      position: 'center',
    },
    {
      id: 'dashboard-overview',
      title: 'Your Command Center',
      description: (
        <div className="space-y-3">
          <p>This is your dashboard - your central hub for all content operations.</p>
          <p>From here, you can create new content, access analytics, and manage your content library.</p>
        </div>
      ),
      position: 'center',
    },
    {
      id: 'search-input',
      title: 'Quick Content Creation',
      description: (
        <div className="space-y-3">
          <p>Use this search input to quickly describe what content you want to create.</p>
          <p>Just type your topic, and our AI will help you generate high-quality, SEO-optimized content.</p>
        </div>
      ),
      position: 'bottom',
    },
    {
      id: 'quick-actions',
      title: 'Quick Actions Hub',
      description: (
        <div className="space-y-3">
          <p>These quick action cards give you instant access to your most-used features:</p>
          <ul className="space-y-1 text-sm">
            <li>• <strong>Content Builder:</strong> Create new content from scratch</li>
            <li>• <strong>Keyword Research:</strong> Find the best keywords for your niche</li>
            <li>• <strong>Content Repurposing:</strong> Transform existing content</li>
            <li>• <strong>Analytics:</strong> Track your content performance</li>
          </ul>
        </div>
      ),
      position: 'top',
    },
    {
      id: 'performance-section',
      title: 'Performance Insights',
      description: (
        <div className="space-y-3">
          <p>Monitor your content's performance at a glance.</p>
          <p>Track key metrics like views, engagement, and SEO rankings to optimize your content strategy.</p>
        </div>
      ),
      position: 'top',
    },
    {
      id: 'navigation',
      title: 'Global Navigation',
      description: (
        <div className="space-y-3">
          <p>Use the top navigation to access different sections of the platform:</p>
          <ul className="space-y-1 text-sm">
            <li>• Dashboard, Content Builder, Research tools</li>
            <li>• Settings and your user profile</li>
            <li>• Feedback to help us improve</li>
          </ul>
        </div>
      ),
      selector: 'header',
      position: 'bottom',
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: (
        <div className="space-y-3">
          <p>Congratulations! You now know the basics of Content Rocket Forge.</p>
          <p>Start creating amazing content and watch your online presence soar!</p>
          <div className="flex items-center justify-center p-4">
            <div className="text-4xl">🚀</div>
          </div>
        </div>
      ),
      position: 'center',
    },
  ];

  const startTour = () => {
    setIsActive(true);
    setCurrentStep(0);
  };

  const endTour = () => {
    setIsActive(false);
    setCurrentStep(0);
    setHasCompletedTour(true);
    localStorage.setItem('app-tour-completed', 'true');
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      endTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    endTour();
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  };

  return (
    <TourContext.Provider
      value={{
        isActive,
        currentStep,
        steps,
        startTour,
        endTour,
        nextStep,
        prevStep,
        skipTour,
        goToStep,
        hasCompletedTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};
