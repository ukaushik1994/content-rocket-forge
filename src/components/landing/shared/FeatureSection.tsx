import React from 'react';
import { motion } from 'framer-motion';

interface FeatureSectionProps {
  headline: string;
  description: string;
  features: string[];
  mockUI: React.ReactNode;
  direction?: 'left' | 'right';
  accentColor: string;
  className?: string;
}

export const FeatureSection: React.FC<FeatureSectionProps> = ({
  headline,
  description,
  features,
  mockUI,
  direction = 'left',
  accentColor,
  className = '',
}) => {
  const textContent = (
    <motion.div
      initial={{ opacity: 0, x: direction === 'left' ? -40 : 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8 }}
      className="flex-1 space-y-6"
    >
      <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold leading-tight text-foreground">
        {headline}
      </h2>
      <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
        {description}
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        {features.map((f) => (
          <span
            key={f}
            className="px-4 py-2 rounded-full text-sm font-medium border backdrop-blur-md"
            style={{
              background: `${accentColor}10`,
              borderColor: `${accentColor}25`,
              color: accentColor,
            }}
          >
            {f}
          </span>
        ))}
      </div>
    </motion.div>
  );

  const visualContent = (
    <motion.div
      initial={{ opacity: 0, x: direction === 'left' ? 40 : -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="flex-1 relative"
    >
      {/* Glow behind mock UI */}
      <div
        className="absolute -inset-8 rounded-3xl blur-3xl opacity-15 pointer-events-none"
        style={{ background: accentColor }}
      />
      <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl overflow-hidden">
        {/* macOS window dots */}
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06]">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-3 text-xs text-muted-foreground/50 font-mono">creaiter.app</span>
        </div>
        <div className="p-6 md:p-8 min-h-[300px]">
          {mockUI}
        </div>
      </div>
    </motion.div>
  );

  return (
    <section className={`py-24 md:py-32 px-4 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className={`flex flex-col ${direction === 'left' ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-20 items-center`}>
          {textContent}
          {visualContent}
        </div>
      </div>
    </section>
  );
};
