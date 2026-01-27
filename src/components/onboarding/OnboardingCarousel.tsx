import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useOnboarding } from './OnboardingContext';
import { OnboardingStep } from './OnboardingStep';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

// Import all illustrations
import { WelcomeIllustration } from './illustrations/WelcomeIllustration';
import { ContentSuiteIllustration } from './illustrations/ContentSuiteIllustration';
import { ResearchIllustration } from './illustrations/ResearchIllustration';
import { StrategyIllustration } from './illustrations/StrategyIllustration';
import { CampaignIllustration } from './illustrations/CampaignIllustration';
import { AnalyticsIllustration } from './illustrations/AnalyticsIllustration';
import { AIChatIllustration } from './illustrations/AIChatIllustration';
import { IntegrationsIllustration } from './illustrations/IntegrationsIllustration';

// Step icons
import { Sparkles as SparklesIcon, FileText, Search, Target, Rocket, BarChart3, MessageSquare, Puzzle } from 'lucide-react';

const AUTO_ADVANCE_DURATION = 10000; // 10 seconds

interface StepConfig {
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  illustration: React.ReactNode;
  icon: React.ReactNode;
  route?: string;
  actionLabel?: string;
}

const getStepConfigs = (): StepConfig[] => [
  {
    title: 'Welcome to CreAiter',
    subtitle: 'The Self-Learning Content Engine',
    description: 'CreAiter is an AI-powered content platform that learns from your results. Every piece of content you create makes the system smarter, delivering increasingly personalized recommendations.',
    benefits: ['AI that learns your style', 'Data-driven insights', 'End-to-end workflow', 'Continuous optimization'],
    illustration: <WelcomeIllustration />,
    icon: <SparklesIcon className="w-6 h-6" />,
  },
  {
    title: 'Content Creation Suite',
    subtitle: 'Builder • Repository • Approvals',
    description: 'Create content through a guided 5-step process, manage all your assets in a centralized repository, and collaborate with team approval workflows.',
    benefits: ['5-step AI writing', 'Version control', 'Team approvals', 'Quality scoring'],
    illustration: <ContentSuiteIllustration />,
    icon: <FileText className="w-6 h-6" />,
    route: '/content-builder',
    actionLabel: 'Try Content Builder',
  },
  {
    title: 'Research & Keywords',
    subtitle: 'SERP Intelligence • Keyword Discovery',
    description: 'Analyze live SERP data, discover high-value keywords, explore People Also Ask questions, and identify content gaps your competitors are missing.',
    benefits: ['Live SERP analysis', 'Keyword clusters', 'PAA insights', 'Gap detection'],
    illustration: <ResearchIllustration />,
    icon: <Search className="w-6 h-6" />,
    route: '/research',
    actionLabel: 'Explore Research',
  },
  {
    title: 'Content Strategy',
    subtitle: 'Goals • Proposals • Calendar',
    description: 'Set content goals and let AI generate strategic proposals based on your data. Plan your editorial calendar and organize topics into semantic clusters.',
    benefits: ['Goal tracking', 'AI proposals', 'Editorial calendar', 'Topic clusters'],
    illustration: <StrategyIllustration />,
    icon: <Target className="w-6 h-6" />,
    route: '/research/content-strategy',
    actionLabel: 'View Strategy',
  },
  {
    title: 'Campaign Management',
    subtitle: 'Strategy • Generation • Execution',
    description: 'Launch complete content campaigns with AI-generated strategies. Watch as content is batch-generated in real-time with full progress tracking.',
    benefits: ['Strategy selection', 'Batch generation', 'Queue tracking', 'Solution branding'],
    illustration: <CampaignIllustration />,
    icon: <Rocket className="w-6 h-6" />,
    route: '/campaigns',
    actionLabel: 'Start Campaign',
  },
  {
    title: 'Analytics & Performance',
    subtitle: 'Metrics • GA4 • Search Console',
    description: 'Track content performance with integrated analytics. Connect Google Analytics and Search Console to see real impact and calculate ROI.',
    benefits: ['GA4 integration', 'Search Console', 'Content metrics', 'ROI tracking'],
    illustration: <AnalyticsIllustration />,
    icon: <BarChart3 className="w-6 h-6" />,
    route: '/analytics',
    actionLabel: 'View Analytics',
  },
  {
    title: 'AI Strategy Coach',
    subtitle: 'Chat • Charts • Insights',
    description: 'Converse naturally with AI to get strategic recommendations. Receive interactive charts, metric cards, and actionable insights directly in chat.',
    benefits: ['Natural language', 'Live charts', 'Campaign status', 'Smart suggestions'],
    illustration: <AIChatIllustration />,
    icon: <MessageSquare className="w-6 h-6" />,
    route: '/ai-chat',
    actionLabel: 'Open AI Chat',
  },
  {
    title: 'Integrations Ecosystem',
    subtitle: 'Publishing • Analytics • AI Providers',
    description: 'Connect your favorite tools: publish to WordPress or Wix, sync with GA4 and Search Console, choose from multiple AI providers, and get Slack notifications.',
    benefits: ['WordPress & Wix', 'GA4 & GSC', 'Multi-AI support', 'Slack alerts'],
    illustration: <IntegrationsIllustration />,
    icon: <Puzzle className="w-6 h-6" />,
    route: '/settings',
    actionLabel: 'Configure Integrations',
  },
];

export const OnboardingCarousel = () => {
  const { 
    isActive, 
    currentStep, 
    totalSteps, 
    nextStep, 
    prevStep, 
    goToStep, 
    skipOnboarding,
    endOnboarding 
  } = useOnboarding();
  
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const stepConfigs = getStepConfigs();
  const currentConfig = stepConfigs[currentStep];

  // Auto-advance progress
  useEffect(() => {
    if (!isActive || isPaused) {
      setProgress(0);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / AUTO_ADVANCE_DURATION) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        nextStep();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isActive, currentStep, isPaused, nextStep]);

  // Reset progress on step change
  useEffect(() => {
    setProgress(0);
  }, [currentStep]);

  const handleAction = useCallback(() => {
    if (currentConfig.route) {
      endOnboarding();
      navigate(currentConfig.route);
    }
  }, [currentConfig.route, endOnboarding, navigate]);

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={skipOnboarding}
        />

        {/* Main container */}
        <motion.div
          className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-white/10 shadow-2xl"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-neon-purple" />
              <span className="text-sm font-medium text-white/80">
                Step {currentStep + 1} of {totalSteps}
              </span>
            </div>
            <button
              onClick={skipOnboarding}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Content area with step transition */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
              >
                <OnboardingStep
                  {...currentConfig}
                  onAction={currentConfig.route ? handleAction : undefined}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer controls */}
          <div className="px-6 py-4 border-t border-white/5 bg-slate-900/50">
            {/* Progress bar */}
            <div className="h-1 bg-white/5 rounded-full mb-4 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-neon-purple to-neon-blue rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.05 }}
              />
            </div>

            <div className="flex items-center justify-between">
              {/* Step indicators */}
              <div className="flex items-center gap-2">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    currentStep === 0 
                      ? "opacity-30 cursor-not-allowed" 
                      : "hover:bg-white/5"
                  )}
                >
                  <ChevronLeft className="w-5 h-5 text-white/60" />
                </button>

                <div className="flex items-center gap-1.5">
                  {stepConfigs.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToStep(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        index === currentStep
                          ? "w-6 bg-gradient-to-r from-neon-purple to-neon-blue"
                          : index < currentStep
                          ? "bg-neon-purple/50"
                          : "bg-white/20"
                      )}
                    />
                  ))}
                </div>

                <button
                  onClick={nextStep}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-white/60" />
                </button>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={skipOnboarding}
                  className="px-4 py-2 text-sm text-white/60 hover:text-white/80 transition-colors"
                >
                  Skip Tour
                </button>

                {currentStep > 0 && (
                  <button
                    onClick={prevStep}
                    className="px-4 py-2 text-sm text-white/80 hover:text-white transition-colors"
                  >
                    Previous
                  </button>
                )}

                <button
                  onClick={nextStep}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  {currentStep === totalSteps - 1 ? 'Get Started' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
