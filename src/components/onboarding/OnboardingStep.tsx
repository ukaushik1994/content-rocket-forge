import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-6 lg:p-8">
      {/* Left: Animated Illustration */}
      <motion.div
        className="relative flex items-center justify-center min-h-[320px] lg:min-h-[380px] rounded-2xl overflow-hidden"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 via-neon-blue/5 to-transparent rounded-2xl" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(155,135,245,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(155,135,245,0.3)_1px,transparent_1px)] bg-[size:30px_30px]" />
        </div>
        
        {/* Illustration container */}
        <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
          {illustration}
        </div>
      </motion.div>

      {/* Right: Content */}
      <motion.div
        className="flex flex-col justify-center space-y-6"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Icon badge */}
        <motion.div
          className="w-14 h-14 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 border border-white/10 flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="text-neon-purple">
            {icon}
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="text-sm font-medium text-neon-purple uppercase tracking-wider"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          {subtitle}
        </motion.p>

        {/* Title */}
        <motion.h2
          className="text-2xl lg:text-3xl font-bold text-white leading-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          {title}
        </motion.h2>

        {/* Description */}
        <motion.p
          className="text-muted-foreground text-base lg:text-lg leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          {description}
        </motion.p>

        {/* Benefits grid */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit}
              className="flex items-center gap-2 text-sm text-muted-foreground"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
            >
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-green-400" />
              </div>
              <span>{benefit}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Action button */}
        {actionLabel && onAction && (
          <motion.button
            onClick={onAction}
            className="mt-4 w-fit px-6 py-3 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {actionLabel}
            <span>→</span>
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};
