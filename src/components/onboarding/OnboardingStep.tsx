import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Lightbulb } from 'lucide-react';

interface OnboardingStepProps {
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  illustration: React.ReactNode;
  icon: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const OnboardingStep = ({
  title,
  subtitle,
  description,
  benefits,
  illustration,
  icon,
  actionLabel,
  onAction,
}: OnboardingStepProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 p-6 lg:p-10 h-full">
      {/* Left: Illustration */}
      <motion.div
        className="relative flex items-center justify-center h-full min-h-[320px] lg:min-h-0 rounded-2xl overflow-hidden bg-transparent border border-border/20"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="relative z-10 w-full h-full flex items-center justify-center p-4 overflow-hidden">
          <div className="w-full h-full max-h-full flex items-center justify-center scale-[0.85]">
            {illustration}
          </div>
        </div>
      </motion.div>

      {/* Right: Content */}
      <motion.div
        className="flex flex-col justify-center space-y-5 overflow-y-auto max-h-full"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
      >
        {/* Icon badge */}
        <motion.div
          className="w-14 h-14 rounded-xl bg-transparent border border-border/20 flex items-center justify-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3, type: 'spring' }}
        >
          <div className="text-muted-foreground">
            {icon}
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="text-sm font-medium uppercase tracking-widest text-muted-foreground"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {subtitle}
        </motion.p>

        {/* Title */}
        <motion.h2
          className="text-2xl lg:text-3xl font-bold text-foreground leading-tight"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {title}
        </motion.h2>

        {/* Description */}
        <motion.p
          className="text-muted-foreground text-base leading-relaxed"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {description}
        </motion.p>

        {/* Benefits */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit}
              className="flex items-center gap-2.5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
            >
              <div className="w-5 h-5 rounded-full bg-transparent border border-border/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-foreground" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">{benefit}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Pro Tip */}
        <motion.div
          className="p-3 rounded-xl bg-transparent border border-border/20"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-transparent border border-border/20 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pro Tip</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">
                Hover to pause auto-advance. Use arrow keys or click dots to navigate.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action button */}
        {actionLabel && onAction && (
          <motion.button
            onClick={onAction}
            className="mt-1 w-fit px-6 py-3 rounded-xl bg-foreground text-background font-semibold text-sm flex items-center gap-2.5 hover:opacity-90 transition-opacity"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {actionLabel}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};
