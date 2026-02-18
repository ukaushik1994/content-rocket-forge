import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface CategoryTeaserProps {
  title: string;
  headline: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  accentColor: string;
  mockUI: React.ReactNode;
  direction?: 'left' | 'right';
  index: number;
}

export const CategoryTeaser: React.FC<CategoryTeaserProps> = ({
  title,
  headline,
  description,
  icon,
  route,
  accentColor,
  mockUI,
  direction = 'left',
  index,
}) => {
  const navigate = useNavigate();

  const textContent = (
    <div className="flex-1 space-y-6">
      {/* Category badge */}
      <div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium"
        style={{ background: `${accentColor}10`, borderColor: `${accentColor}25`, color: accentColor }}
      >
        {icon}
        {title}
      </div>

      <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
        {headline}
      </h2>

      <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
        {description}
      </p>

      <button
        onClick={() => navigate(route)}
        className="inline-flex items-center gap-2 text-lg font-medium group transition-colors"
        style={{ color: accentColor }}
      >
        Learn more
        <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
      </button>
    </div>
  );

  const visualContent = (
    <div className="flex-1 relative">
      <div
        className="absolute -inset-8 rounded-3xl blur-3xl opacity-15 pointer-events-none"
        style={{ background: accentColor }}
      />
      <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06]">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        </div>
        <div className="p-6">
          {mockUI}
        </div>
      </div>
    </div>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, delay: 0.1 }}
      className="py-20 md:py-28 px-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className={`flex flex-col ${direction === 'left' ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-20 items-center`}>
          {textContent}
          {visualContent}
        </div>
      </div>
    </motion.section>
  );
};
