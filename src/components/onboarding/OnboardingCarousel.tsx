import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useOnboarding } from './OnboardingContext';
import { OnboardingStep } from './OnboardingStep';
import { BusinessSetupForm } from './BusinessSetupForm';
import { GradientBorder } from './ui/GradientBorder';
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
import {
  Sparkles as SparklesIcon,
  FileText,
  Search,
  Target,
  Rocket,
  Mail,
  Share2,
  Users,
  BarChart3,
  MessageSquare,
  Puzzle,
} from 'lucide-react';

const AUTO_ADVANCE_DURATION = 10000;

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
    title: 'Welcome to Creaiter',
    subtitle: 'The Self-Learning Content Engine',
    description: 'Creaiter is an AI-powered content platform that learns from your results. Every piece of content you create makes the system smarter, delivering increasingly personalized recommendations.',
    benefits: ['AI that learns your style', 'Data-driven insights', 'End-to-end workflow', 'Continuous optimization'],
    illustration: <WelcomeIllustration />,
    icon: <SparklesIcon className="w-7 h-7" />,
  },
  {
    title: 'Content Creation Suite',
    subtitle: 'Builder • Repository • Approvals • Keywords',
    description: 'Create content through a guided 5-step process, manage all your assets in a centralized repository, and collaborate with team approval workflows.',
    benefits: ['5-step AI writing', 'Version control', 'Team approvals', 'Quality scoring'],
    illustration: <ContentSuiteIllustration />,
    icon: <FileText className="w-7 h-7" />,
    route: '/content-type-selection',
    actionLabel: 'Try Content Builder',
  },
  {
    title: 'Research & Strategy',
    subtitle: 'SERP Intelligence • Content Strategy • Calendar',
    description: 'Analyze live SERP data, generate AI-driven strategy proposals, plan your editorial calendar, and organize topics into semantic clusters.',
    benefits: ['Live SERP analysis', 'AI proposals', 'Editorial calendar', 'Topic clusters'],
    illustration: <ResearchIllustration />,
    icon: <Search className="w-7 h-7" />,
    route: '/research/content-strategy',
    actionLabel: 'Explore Research',
  },
  {
    title: 'Campaigns',
    subtitle: 'Strategy • Generation • Execution',
    description: 'Launch complete content campaigns with AI-generated strategies. Watch as content is batch-generated in real-time with full progress tracking.',
    benefits: ['Strategy selection', 'Batch generation', 'Queue tracking', 'Solution branding'],
    illustration: <CampaignIllustration />,
    icon: <Rocket className="w-7 h-7" />,
    route: '/campaigns',
    actionLabel: 'Start Campaign',
  },
  {
    title: 'Email Marketing',
    subtitle: 'Compose • Automate • Deliver',
    description: 'Craft AI-powered email campaigns with smart templates, automated sequences, and detailed performance tracking to maximize engagement.',
    benefits: ['AI-powered copy', 'Template library', 'Scheduling', 'Performance tracking'],
    illustration: <CampaignIllustration />,
    icon: <Mail className="w-7 h-7" />,
    route: '/engage/email',
    actionLabel: 'Open Email',
  },
  {
    title: 'Social Media',
    subtitle: 'Create • Schedule • Analyze',
    description: 'Manage your social presence with multi-channel posting, content calendars, engagement analytics, and intelligent auto-scheduling.',
    benefits: ['Multi-channel posting', 'Content calendar', 'Engagement analytics', 'Auto-scheduling'],
    illustration: <CampaignIllustration />,
    icon: <Share2 className="w-7 h-7" />,
    route: '/engage/social',
    actionLabel: 'Open Social',
  },
  {
    title: 'Audience Management',
    subtitle: 'Contacts • Segments • Activity',
    description: 'Build and manage your contact database with smart segmentation, activity tracking, and behavioral insights to target the right audience.',
    benefits: ['Contact database', 'Smart segments', 'Activity tracking', 'Behavioral insights'],
    illustration: <IntegrationsIllustration />,
    icon: <Users className="w-7 h-7" />,
    route: '/engage/contacts',
    actionLabel: 'View Contacts',
  },
  {
    title: 'Analytics & Performance',
    subtitle: 'Metrics • GA4 • Search Console',
    description: 'Track content performance with integrated analytics. Connect Google Analytics and Search Console to see real impact and calculate ROI.',
    benefits: ['GA4 integration', 'Search Console', 'Content metrics', 'ROI tracking'],
    illustration: <AnalyticsIllustration />,
    icon: <BarChart3 className="w-7 h-7" />,
    route: '/analytics',
    actionLabel: 'View Analytics',
  },
  {
    title: 'AI Strategy Coach',
    subtitle: 'Chat • Charts • Insights',
    description: 'Converse naturally with AI to get strategic recommendations. Receive interactive charts, metric cards, and actionable insights directly in chat.',
    benefits: ['Natural language', 'Live charts', 'Campaign status', 'Smart suggestions'],
    illustration: <AIChatIllustration />,
    icon: <MessageSquare className="w-7 h-7" />,
    route: '/ai-chat',
    actionLabel: 'Open AI Chat',
  },
  {
    title: 'Integrations & Settings',
    subtitle: 'Publishing • Analytics • AI Providers',
    description: 'Connect your favorite tools: publish to WordPress or Wix, sync with GA4 and Search Console, choose from multiple AI providers, and get Slack notifications.',
    benefits: ['WordPress & Wix', 'GA4 & GSC', 'Multi-AI support', 'Slack alerts'],
    illustration: <IntegrationsIllustration />,
    icon: <Puzzle className="w-7 h-7" />,
    route: '/ai-settings',
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
    endOnboarding,
    showBusinessSetup,
  } = useOnboarding();

  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const stepConfigs = getStepConfigs();
  const currentConfig = stepConfigs[currentStep];

  // Auto-advance progress
  useEffect(() => {
    if (!isActive || isPaused || showBusinessSetup) {
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
  }, [isActive, currentStep, isPaused, nextStep, showBusinessSetup]);

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
        transition={{ duration: 0.4 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/85 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={skipOnboarding}
        />

        {/* Main container */}
        <GradientBorder className="relative z-10 w-full max-w-6xl">
          <motion.div
            className="relative h-[680px] max-h-[90vh] overflow-hidden rounded-3xl flex flex-col"
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Header */}
            <div className="relative flex-shrink-0 flex items-center justify-between px-8 py-5 border-b border-border/10 bg-transparent">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-transparent border border-border/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-muted-foreground" />
                </div>

                <div className="px-4 py-1.5 rounded-full bg-transparent border border-border/20">
                  <span className="text-sm font-medium text-muted-foreground">
                    Step {currentStep + 1} of {totalSteps}
                  </span>
                </div>
              </div>

              {/* Progress segments */}
              <div className="hidden md:flex items-center gap-1">
                {stepConfigs.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToStep(index)}
                    className={cn(
                      "relative h-1.5 rounded-full transition-all duration-500",
                      index === currentStep ? "w-8" : "w-4"
                    )}
                  >
                    <div className={cn(
                      "absolute inset-0 rounded-full transition-all duration-500",
                      index < currentStep
                        ? "bg-foreground"
                        : index === currentStep
                        ? "bg-muted-foreground/40"
                        : "bg-border/20"
                    )} />
                    {index === currentStep && (
                      <div
                        className="absolute inset-0 rounded-full bg-foreground"
                        style={{ width: `${progress}%` }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Close */}
              <motion.button
                onClick={skipOnboarding}
                className="p-2.5 rounded-xl hover:bg-muted/20 border border-transparent hover:border-border/20 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden bg-transparent">
              <AnimatePresence mode="wait">
                {showBusinessSetup ? (
                  <motion.div
                    key="business-setup"
                    className="h-full"
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -60 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  >
                    <BusinessSetupForm />
                  </motion.div>
                ) : (
                  <motion.div
                    key={currentStep}
                    className="h-full"
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -60 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  >
                    <OnboardingStep
                      {...currentConfig}
                      onAction={currentConfig.route ? handleAction : undefined}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {!showBusinessSetup && (
              <div className="flex-shrink-0 px-8 py-5 border-t border-border/10 bg-transparent">
                {/* Segmented progress bar */}
                <div className="flex gap-1 mb-5">
                  {stepConfigs.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex-1 h-1 rounded-full overflow-hidden transition-all duration-300",
                        index <= currentStep ? "bg-border/30" : "bg-border/10"
                      )}
                    >
                      {index < currentStep && (
                        <div className="h-full w-full bg-foreground" />
                      )}
                      {index === currentStep && (
                        <div
                          className="h-full bg-foreground"
                          style={{ width: `${progress}%` }}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  {/* Navigation */}
                  <div className="flex items-center gap-3">
                    <motion.button
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className={cn(
                        "p-2.5 rounded-xl border transition-all duration-300",
                        currentStep === 0
                          ? "opacity-30 cursor-not-allowed border-transparent"
                          : "hover:bg-muted/20 border-border/20 hover:border-border/40"
                      )}
                      whileHover={currentStep > 0 ? { scale: 1.05 } : {}}
                      whileTap={currentStep > 0 ? { scale: 0.95 } : {}}
                    >
                      <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                    </motion.button>

                    {/* Step dots */}
                    <div className="hidden sm:flex items-center gap-2">
                      {stepConfigs.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToStep(index)}
                          className={cn(
                            "w-2.5 h-2.5 rounded-full transition-all duration-300",
                            index === currentStep
                              ? "bg-foreground scale-125"
                              : index < currentStep
                              ? "bg-foreground/60"
                              : "bg-border/30"
                          )}
                        />
                      ))}
                    </div>

                    <motion.button
                      onClick={nextStep}
                      className="p-2.5 rounded-xl border border-border/20 hover:border-border/40 hover:bg-muted/20 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </motion.button>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-4">
                    <motion.button
                      onClick={skipOnboarding}
                      className="px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      Skip Tour
                    </motion.button>

                    {currentStep > 0 && (
                      <motion.button
                        onClick={prevStep}
                        className="hidden sm:block px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground border border-border/20 hover:border-border/40 rounded-xl transition-all"
                        whileHover={{ scale: 1.02 }}
                      >
                        Previous
                      </motion.button>
                    )}

                    {/* Next button — solid monochrome */}
                    <motion.button
                      onClick={nextStep}
                      className="px-7 py-3 rounded-xl bg-foreground text-background text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {currentStep === totalSteps - 1 ? 'Get Started' : 'Next'}
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </GradientBorder>
      </motion.div>
    </AnimatePresence>
  );
};
