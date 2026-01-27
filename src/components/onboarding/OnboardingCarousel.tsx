import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useOnboarding } from './OnboardingContext';
import { OnboardingStep } from './OnboardingStep';

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
  gradient: string;
}

const getStepConfigs = (): StepConfig[] => [
  {
    title: 'Welcome to CreAiter',
    subtitle: 'The Self-Learning Content Engine',
    description: 'CreAiter is an AI-powered content platform that learns from your results. Every piece of content you create makes the system smarter, delivering increasingly personalized recommendations.',
    benefits: ['AI that learns your style', 'Data-driven insights', 'End-to-end workflow', 'Continuous optimization'],
    illustration: <WelcomeIllustration />,
    icon: <SparklesIcon className="w-7 h-7" />,
    gradient: 'from-purple-500 via-pink-500 to-purple-500',
  },
  {
    title: 'Content Creation Suite',
    subtitle: 'Builder • Repository • Approvals',
    description: 'Create content through a guided 5-step process, manage all your assets in a centralized repository, and collaborate with team approval workflows.',
    benefits: ['5-step AI writing', 'Version control', 'Team approvals', 'Quality scoring'],
    illustration: <ContentSuiteIllustration />,
    icon: <FileText className="w-7 h-7" />,
    route: '/content-builder',
    actionLabel: 'Try Content Builder',
    gradient: 'from-blue-500 via-cyan-500 to-blue-500',
  },
  {
    title: 'Research & Keywords',
    subtitle: 'SERP Intelligence • Keyword Discovery',
    description: 'Analyze live SERP data, discover high-value keywords, explore People Also Ask questions, and identify content gaps your competitors are missing.',
    benefits: ['Live SERP analysis', 'Keyword clusters', 'PAA insights', 'Gap detection'],
    illustration: <ResearchIllustration />,
    icon: <Search className="w-7 h-7" />,
    route: '/research',
    actionLabel: 'Explore Research',
    gradient: 'from-emerald-500 via-teal-500 to-emerald-500',
  },
  {
    title: 'Content Strategy',
    subtitle: 'Goals • Proposals • Calendar',
    description: 'Set content goals and let AI generate strategic proposals based on your data. Plan your editorial calendar and organize topics into semantic clusters.',
    benefits: ['Goal tracking', 'AI proposals', 'Editorial calendar', 'Topic clusters'],
    illustration: <StrategyIllustration />,
    icon: <Target className="w-7 h-7" />,
    route: '/research/content-strategy',
    actionLabel: 'View Strategy',
    gradient: 'from-amber-500 via-orange-500 to-amber-500',
  },
  {
    title: 'Campaign Management',
    subtitle: 'Strategy • Generation • Execution',
    description: 'Launch complete content campaigns with AI-generated strategies. Watch as content is batch-generated in real-time with full progress tracking.',
    benefits: ['Strategy selection', 'Batch generation', 'Queue tracking', 'Solution branding'],
    illustration: <CampaignIllustration />,
    icon: <Rocket className="w-7 h-7" />,
    route: '/campaigns',
    actionLabel: 'Start Campaign',
    gradient: 'from-pink-500 via-rose-500 to-pink-500',
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
    gradient: 'from-violet-500 via-purple-500 to-violet-500',
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
    gradient: 'from-cyan-500 via-blue-500 to-cyan-500',
  },
  {
    title: 'Integrations Ecosystem',
    subtitle: 'Publishing • Analytics • AI Providers',
    description: 'Connect your favorite tools: publish to WordPress or Wix, sync with GA4 and Search Console, choose from multiple AI providers, and get Slack notifications.',
    benefits: ['WordPress & Wix', 'GA4 & GSC', 'Multi-AI support', 'Slack alerts'],
    illustration: <IntegrationsIllustration />,
    icon: <Puzzle className="w-7 h-7" />,
    route: '/settings',
    actionLabel: 'Configure Integrations',
    gradient: 'from-indigo-500 via-purple-500 to-indigo-500',
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
        transition={{ duration: 0.4 }}
      >
        {/* Backdrop with blur */}
        <motion.div
          className="absolute inset-0 bg-black/85 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={skipOnboarding}
        />


        {/* Main container with gradient border */}
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
            {/* Premium header */}
            <div className="relative flex-shrink-0 flex items-center justify-between px-8 py-5 border-b border-white/5 bg-slate-900/50 backdrop-blur-sm">
              {/* Logo and step counter */}
              <div className="flex items-center gap-4">
                <motion.div
                  className="relative"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(155, 135, 245, 0.3)',
                      '0 0 40px rgba(155, 135, 245, 0.5)',
                      '0 0 20px rgba(155, 135, 245, 0.3)',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </motion.div>
                
                {/* Step indicator badge */}
                <motion.div
                  className="px-4 py-1.5 rounded-full bg-gradient-to-r from-white/10 to-white/5 border border-white/10"
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-sm font-medium bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                    Step {currentStep + 1} of {totalSteps}
                  </span>
                </motion.div>
              </div>

              {/* Progress segments */}
              <div className="hidden md:flex items-center gap-1">
                {stepConfigs.map((_, index) => (
                  <motion.button
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
                        ? "bg-gradient-to-r from-neon-purple to-neon-blue"
                        : index === currentStep
                        ? "bg-gradient-to-r from-neon-purple to-neon-blue"
                        : "bg-white/20"
                    )} />
                    {index === currentStep && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue"
                        style={{ width: `${progress}%` }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
              
              {/* Close button */}
              <motion.button
                onClick={skipOnboarding}
                className="p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5 text-white/60" />
              </motion.button>
            </div>

            {/* Content area with step transition */}
            <div className="flex-1 overflow-hidden bg-slate-950/80">
              <AnimatePresence mode="wait">
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
              </AnimatePresence>
            </div>

            {/* Premium footer controls */}
            <div className="flex-shrink-0 px-8 py-5 border-t border-white/5 bg-slate-900/50 backdrop-blur-sm">
              {/* Segmented progress bar */}
              <div className="flex gap-1 mb-5">
                {stepConfigs.map((config, index) => (
                  <motion.div
                    key={index}
                    className={cn(
                      "flex-1 h-1 rounded-full overflow-hidden transition-all duration-300",
                      index <= currentStep ? "bg-slate-700" : "bg-slate-800"
                    )}
                  >
                    {index < currentStep && (
                      <div className={cn("h-full w-full bg-gradient-to-r", config.gradient)} />
                    )}
                    {index === currentStep && (
                      <motion.div
                        className={cn("h-full bg-gradient-to-r", config.gradient)}
                        style={{ width: `${progress}%` }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                {/* Navigation arrows and dots */}
                <div className="flex items-center gap-3">
                  <motion.button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className={cn(
                      "p-2.5 rounded-xl border transition-all duration-300",
                      currentStep === 0 
                        ? "opacity-30 cursor-not-allowed border-transparent" 
                        : "hover:bg-white/5 border-white/10 hover:border-white/20"
                    )}
                    whileHover={currentStep > 0 ? { scale: 1.05 } : {}}
                    whileTap={currentStep > 0 ? { scale: 0.95 } : {}}
                  >
                    <ChevronLeft className="w-5 h-5 text-white/70" />
                  </motion.button>

                  {/* Step dots */}
                  <div className="hidden sm:flex items-center gap-2">
                    {stepConfigs.map((_, index) => (
                      <motion.button
                        key={index}
                        onClick={() => goToStep(index)}
                        className="relative"
                        whileHover={{ scale: 1.2 }}
                      >
                        <div
                          className={cn(
                            "w-2.5 h-2.5 rounded-full transition-all duration-300",
                            index === currentStep
                              ? "bg-gradient-to-r from-neon-purple to-neon-blue scale-125"
                              : index < currentStep
                              ? "bg-neon-purple/60"
                              : "bg-white/20"
                          )}
                        />
                        {index === currentStep && (
                          <motion.div
                            className="absolute inset-0 rounded-full bg-neon-purple/50"
                            animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>

                  <motion.button
                    onClick={nextStep}
                    className="p-2.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronRight className="w-5 h-5 text-white/70" />
                  </motion.button>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={skipOnboarding}
                    className="px-5 py-2.5 text-sm text-white/50 hover:text-white/80 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    Skip Tour
                  </motion.button>

                  {currentStep > 0 && (
                    <motion.button
                      onClick={prevStep}
                      className="hidden sm:block px-5 py-2.5 text-sm text-white/70 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-all"
                      whileHover={{ scale: 1.02 }}
                    >
                      Previous
                    </motion.button>
                  )}

                  {/* Premium next button with shimmer */}
                  <motion.button
                    onClick={nextStep}
                    className="relative px-7 py-3 rounded-xl text-white text-sm font-semibold overflow-hidden group"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {/* Gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-purple via-neon-blue to-neon-purple bg-[length:200%_100%] animate-gradient-shift" />
                    
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                      animate={{ translateX: ['100%', '-100%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    />
                    
                    {/* Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-blue opacity-0 group-hover:opacity-50 blur-xl transition-opacity" />
                    
                    <span className="relative z-10 flex items-center gap-2">
                      {currentStep === totalSteps - 1 ? 'Get Started' : 'Next'}
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </GradientBorder>
      </motion.div>
    </AnimatePresence>
  );
};
