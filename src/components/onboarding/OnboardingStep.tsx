import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
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
  gradient?: string;
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
  gradient = 'from-neon-purple to-neon-blue',
}: OnboardingStepProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 p-6 lg:p-10 h-full">
      {/* Left: Premium Animated Illustration */}
      <motion.div
        className="relative flex items-center justify-center h-full min-h-[320px] lg:min-h-0 rounded-3xl overflow-hidden"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {/* Multi-layer background */}
        <div className="absolute inset-0">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950" />
          
          {/* Colored gradient overlay */}
          <motion.div
            className={cn("absolute inset-0 bg-gradient-to-br opacity-20", gradient)}
            animate={{ opacity: [0.1, 0.25, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(155,135,245,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(155,135,245,0.4)_1px,transparent_1px)] bg-[size:32px_32px]" />
          </div>
          
          {/* Radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(155,135,245,0.15)_0%,transparent_70%)]" />
        </div>
        
        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(155,135,245,0.3), rgba(30,174,219,0.3), rgba(155,135,245,0.3))',
            backgroundSize: '200% 200%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-[1px] rounded-3xl bg-slate-950/90" />
        
        {/* Illustration container - constrained */}
        <div className="relative z-10 w-full h-full flex items-center justify-center p-4 overflow-hidden">
          <div className="w-full h-full max-h-full flex items-center justify-center scale-[0.85]">
            {illustration}
          </div>
        </div>
        
        {/* Corner accents */}
        <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-neon-purple/30 rounded-tl-lg" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-neon-blue/30 rounded-br-lg" />
      </motion.div>

      {/* Right: Premium Content */}
      <motion.div
        className="flex flex-col justify-center space-y-5 overflow-y-auto max-h-full"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
      >
        {/* Premium icon badge */}
        <motion.div
          className="relative w-14 h-14"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3, type: 'spring' }}
        >
          {/* Outer glow ring */}
          <motion.div
            className={cn("absolute inset-0 rounded-2xl bg-gradient-to-br blur-lg opacity-40", gradient)}
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          {/* Main badge */}
          <div className={cn(
            "relative w-full h-full rounded-2xl bg-gradient-to-br border border-white/10 flex items-center justify-center",
            gradient
          )}>
            <div className="text-white">
              {icon}
            </div>
          </div>
          
          {/* Inner shine */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-50" />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className={cn(
            "text-sm font-semibold uppercase tracking-[0.2em] bg-gradient-to-r bg-clip-text text-transparent",
            gradient
          )}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {subtitle}
        </motion.p>

        {/* Title with gradient option */}
        <motion.h2
          className="text-2xl lg:text-3xl font-bold text-white leading-tight"
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

        {/* Benefits with animated checkmarks */}
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
              <motion.div
                className="relative w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9 + index * 0.1, type: 'spring', stiffness: 500 }}
              >
                <Check className="w-3 h-3 text-white" />
                {/* Celebration burst */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-green-400"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                />
              </motion.div>
              <span className="text-sm text-white/80 font-medium">{benefit}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Tip callout */}
        <motion.div
          className="relative p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-300">Pro Tip</p>
              <p className="text-xs text-amber-200/70 mt-0.5">
                Hover to pause auto-advance. Use arrow keys or click dots to navigate.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Premium action button */}
        {actionLabel && onAction && (
          <motion.button
            onClick={onAction}
            className="relative mt-1 w-fit group"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Button container */}
            <div className={cn(
              "relative px-6 py-3 rounded-xl bg-gradient-to-r text-white font-semibold flex items-center gap-2.5 overflow-hidden",
              gradient
            )}>
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                animate={{ translateX: ['100%', '-100%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
              />
              
              <span className="relative z-10 text-sm">{actionLabel}</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            </div>
            
            {/* Glow effect */}
            <motion.div
              className={cn("absolute inset-0 rounded-xl bg-gradient-to-r blur-xl opacity-0 group-hover:opacity-40 transition-opacity", gradient)}
            />
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};
