import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { engageHeroVariant } from './engageAnimations';

interface EngageHeroProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  gradientFrom: string;
  gradientTo: string;
  glowFrom: string;
  glowTo: string;
  actions?: React.ReactNode;
}

export const EngageHero: React.FC<EngageHeroProps> = ({
  icon: Icon,
  title,
  subtitle,
  gradientFrom,
  gradientTo,
  glowFrom,
  glowTo,
  actions,
}) => (
  <motion.div
    variants={engageHeroVariant}
    initial="hidden"
    animate="visible"
    className="flex items-center justify-between"
  >
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${glowFrom} ${glowTo} blur-xl scale-150 opacity-60`} />
        <div className={`relative h-12 w-12 rounded-2xl bg-gradient-to-br ${glowFrom} ${glowTo} flex items-center justify-center border border-white/10`}>
          <Icon className="h-6 w-6 text-white/80" />
        </div>
      </div>
      <div>
        <h2 className={`text-2xl font-bold bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}>
          {title}
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </motion.div>
);
