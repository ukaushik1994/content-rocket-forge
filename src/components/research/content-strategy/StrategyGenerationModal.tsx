import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Sparkles, Brain, Target, TrendingUp, Search, Lightbulb, Zap } from 'lucide-react';
import { CustomBadge } from '@/components/ui/custom-badge';
import { LoadingParticles } from '@/components/content-builder/serp/loading-state/LoadingParticle';

export type GenerationStep = {
  label: string;
  status: 'pending' | 'active' | 'done';
  hint?: string;
};

interface StrategyGenerationModalProps {
  open: boolean;
  steps: GenerationStep[];
  onCancel?: () => void;
}

const stepIcons = {
  'Analyzing Market Landscape': Brain,
  'Identifying Content Gaps': Target,
  'Building Content Pillars': TrendingUp,
  'Generating Strategic Recommendations': Lightbulb,
  'Optimizing for Search Intent': Search,
} as const;

const stepDescriptions = {
  'Analyzing Market Landscape': 'Scanning competitor strategies, market trends, and industry insights to understand your competitive environment.',
  'Identifying Content Gaps': 'Finding underserved topics and opportunities where your content can make the biggest impact.',
  'Building Content Pillars': 'Creating thematic content structures that align with your brand and audience needs.',
  'Generating Strategic Recommendations': 'AI-powered analysis to create personalized content strategy proposals.',
  'Optimizing for Search Intent': 'Aligning your content strategy with user search behavior and SEO best practices.',
} as const;

const estimatedTimes = {
  'Analyzing Market Landscape': '2-3 min',
  'Identifying Content Gaps': '1-2 min',
  'Building Content Pillars': '1-2 min',
  'Generating Strategic Recommendations': '2-3 min',
  'Optimizing for Search Intent': '1 min',
} as const;

export function StrategyGenerationModal({ open, steps, onCancel }: StrategyGenerationModalProps) {
  const activeStepIndex = steps.findIndex(step => step.status === 'active');
  const completedSteps = steps.filter(step => step.status === 'done').length;
  const totalSteps = steps.length;
  const progress = (completedSteps / totalSteps) * 100;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Enhanced backdrop with blur */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onCancel} />
          
          {/* Animated background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
                x: [0, 50, 0],
                y: [0, -30, 0],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/20 to-primary/20 blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.4, 0.2, 0.4],
                x: [0, -30, 0],
                y: [0, 20, 0],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <LoadingParticles count={20} />
          </div>

          {/* Enhanced modal container */}
          <motion.div
            className="relative w-full max-w-4xl mx-auto glass-card overflow-hidden"
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Hero Header Section */}
            <div className="relative p-8 pb-6 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5">
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 backdrop-blur-sm border border-primary/20 flex items-center justify-center"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Brain className="h-6 w-6 text-primary" />
                    </motion.div>
                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        AI Strategy Generation
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        Creating your personalized content strategy with advanced AI analysis
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <CustomBadge 
                      animated 
                      icon={<div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                      className="bg-green-500/10 text-green-600 border-green-500/20"
                    >
                      AI-Powered Generation
                    </CustomBadge>
                    <CustomBadge className="bg-primary/10 text-primary border-primary/20">
                      {completedSteps}/{totalSteps} Steps Complete
                    </CustomBadge>
                  </div>
                </div>

                <motion.div
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap className="h-4 w-4 text-primary" />
                  <span>Processing...</span>
                </motion.div>
              </div>

              {/* Overall Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-blue-500 shadow-glow"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>

            {/* Enhanced Steps Section */}
            <div className="p-8 pt-4">
              <div className="grid gap-4">
                {steps.map((step, index) => {
                  const IconComponent = stepIcons[step.label as keyof typeof stepIcons] || Brain;
                  const description = stepDescriptions[step.label as keyof typeof stepDescriptions] || step.hint;
                  const estimatedTime = estimatedTimes[step.label as keyof typeof estimatedTimes] || '1-2 min';
                  
                  return (
                    <motion.div
                      key={index}
                      className={`relative glass-card p-6 transition-all duration-500 ${
                        step.status === 'active' 
                          ? 'ring-2 ring-primary/20 shadow-glow bg-primary/5' 
                          : step.status === 'done'
                          ? 'bg-green-500/5 border-green-500/20'
                          : 'opacity-70'
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {/* Step completion celebration */}
                      {step.status === 'done' && (
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <div className="absolute top-4 right-4">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", duration: 0.6 }}
                            >
                              <CheckCircle2 className="h-6 w-6 text-green-500" />
                            </motion.div>
                          </div>
                        </motion.div>
                      )}

                      <div className="flex items-start gap-4">
                        {/* Step Icon */}
                        <div className={`relative h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          step.status === 'active'
                            ? 'bg-primary/20 border border-primary/30'
                            : step.status === 'done'
                            ? 'bg-green-500/20 border border-green-500/30'
                            : 'bg-muted border border-border'
                        }`}>
                          {step.status === 'active' ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <IconComponent className="h-6 w-6 text-primary" />
                            </motion.div>
                          ) : step.status === 'done' ? (
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                          ) : (
                            <IconComponent className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className={`font-semibold ${
                              step.status === 'active' ? 'text-foreground' : 
                              step.status === 'done' ? 'text-green-600' : 'text-muted-foreground'
                            }`}>
                              {step.label}
                            </h3>
                            {step.status === 'active' && (
                              <motion.span
                                className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full"
                                animate={{ opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                Est. {estimatedTime}
                              </motion.span>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {description}
                          </p>

                          {/* Active step progress bar */}
                          {step.status === 'active' && (
                            <motion.div
                              className="h-1.5 rounded-full bg-muted mt-3 overflow-hidden"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <motion.div
                                className="h-full bg-gradient-to-r from-primary to-blue-500 shadow-glow"
                                initial={{ width: '0%' }}
                                animate={{ width: '85%' }}
                                transition={{ 
                                  duration: 2, 
                                  repeat: Infinity, 
                                  repeatType: 'reverse',
                                  ease: 'easeInOut'
                                }}
                              />
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer */}
              {onCancel && (
                <motion.div
                  className="mt-8 pt-6 border-t border-border flex justify-between items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="text-sm text-muted-foreground">
                    Your AI strategy will be ready in a few moments...
                  </div>
                  <button
                    onClick={onCancel}
                    className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 hover:shadow-sm"
                  >
                    Cancel Generation
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}