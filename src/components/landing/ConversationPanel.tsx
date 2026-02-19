import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface ConversationPanelProps {
  headline: string;
  description: string;
  mockUI: React.ReactNode;
  accentColor: string;
  direction?: 'left' | 'right';
  learnMoreRoute: string;
  learnMoreLabel: string;
  index: number;
}

export const ConversationPanel: React.FC<ConversationPanelProps> = ({
  headline,
  description,
  mockUI,
  accentColor,
  direction = 'left',
  learnMoreRoute,
  learnMoreLabel,
  index,
}) => {
  const navigate = useNavigate();

  const textContent = (
    <motion.div
      initial={{ opacity: 0, x: direction === 'left' ? -40 : 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8 }}
      className="flex-1 space-y-6"
    >
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
        {headline}
      </h2>
      <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
        {description}
      </p>
      <button
        onClick={() => navigate(learnMoreRoute)}
        className="inline-flex items-center gap-2 text-lg font-medium group transition-colors"
        style={{ color: accentColor }}
      >
        {learnMoreLabel}
        <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
      </button>
    </motion.div>
  );

  const visualContent = (
    <motion.div
      initial={{ opacity: 0, x: direction === 'left' ? 40 : -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay: 0.15 }}
      className="flex-1 relative"
    >
      {/* Category glow */}
      <div
        className="absolute -inset-8 rounded-3xl blur-[100px] opacity-20 pointer-events-none"
        style={{ background: accentColor }}
      />
      <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl overflow-hidden">
        {/* macOS dots */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06]">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        </div>
        <div className="p-6 md:p-8">
          {mockUI}
        </div>
      </div>
    </motion.div>
  );

  return (
    <section className="py-24 md:py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <div className={`flex flex-col ${direction === 'left' ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-20 items-center`}>
          {textContent}
          {visualContent}
        </div>
      </div>
    </section>
  );
};
