import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { engageStagger } from './engageAnimations';

interface StatItem {
  label: string;
  count: number | string;
  icon: LucideIcon;
  color?: string;
  text?: string;
}

interface EngageStatGridProps {
  stats: StatItem[];
  columns?: number;
}

export const EngageStatGrid: React.FC<EngageStatGridProps> = ({ stats, columns }) => {
  const cols = columns || stats.length;
  return (
    <motion.div
      className={`grid gap-3`}
      style={{ gridTemplateColumns: `repeat(${Math.min(cols, 4)}, minmax(0, 1fr))` }}
      variants={engageStagger.container}
      initial="hidden"
      animate="visible"
    >
      {stats.map((s) => (
        <motion.div key={s.label} variants={engageStagger.item}>
          <div
            className="rounded-2xl border border-border/10 bg-background/90 backdrop-blur-md p-4
              transition-colors duration-300 cursor-default"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{s.count}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-transparent border border-border/20 flex items-center justify-center">
                <s.icon className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};
