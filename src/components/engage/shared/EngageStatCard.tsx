import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { engageStagger } from './engageAnimations';

interface StatItem {
  label: string;
  count: number;
  icon: LucideIcon;
  color: string;   // e.g. "from-blue-500/20 to-blue-500/5"
  text: string;     // e.g. "text-blue-400"
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
            className={`rounded-2xl border border-white/[0.06] bg-gradient-to-br ${s.color} backdrop-blur-sm p-4
              hover:border-white/[0.12] hover:scale-[1.02] hover:-translate-y-1
              transition-all duration-300 group cursor-default`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                <p className={`text-2xl font-bold ${s.text} mt-1`}>{s.count}</p>
              </div>
              <div className={`h-10 w-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center
                group-hover:bg-white/[0.08] transition-colors`}>
                <s.icon className={`h-5 w-5 ${s.text} opacity-70`} />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};
