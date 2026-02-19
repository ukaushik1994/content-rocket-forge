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

  return (
    <section className="py-20 md:py-32 px-4 relative">
      {/* Subtle accent orb */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[200px] opacity-[0.06] pointer-events-none"
        style={{
          background: accentColor,
          top: '20%',
          ...(direction === 'left' ? { right: '10%' } : { left: '10%' }),
        }}
      />

      <div className="max-w-6xl mx-auto">
        <div className={`flex flex-col ${direction === 'left' ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-20 items-center`}>
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 space-y-5"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-[-0.02em] text-foreground">
              {headline}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-md">
              {description}
            </p>
            <button
              onClick={() => navigate(learnMoreRoute)}
              className="inline-flex items-center gap-2 text-sm font-medium group transition-all duration-300 hover:gap-3"
              style={{ color: accentColor }}
            >
              {learnMoreLabel}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </motion.div>

          {/* Mock UI */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 relative w-full"
          >
            {/* Glow */}
            <div
              className="absolute -inset-6 rounded-3xl blur-[80px] opacity-[0.08] pointer-events-none"
              style={{ background: accentColor }}
            />
            <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden">
              {/* Minimal window dots */}
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/[0.04]">
                <div className="w-2 h-2 rounded-full bg-white/10" />
                <div className="w-2 h-2 rounded-full bg-white/10" />
                <div className="w-2 h-2 rounded-full bg-white/10" />
              </div>
              <div className="p-5 md:p-6">
                {mockUI}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
