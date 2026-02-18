import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { engageHeroVariant } from './engageAnimations';

interface EngageHeroProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  gradientFrom?: string;
  gradientTo?: string;
  glowFrom?: string;
  glowTo?: string;
  actions?: React.ReactNode;
}

export const EngageHero: React.FC<EngageHeroProps> = ({
  icon: Icon,
  title,
  subtitle,
  actions,
}) => (
  <motion.div
    variants={engageHeroVariant}
    initial="hidden"
    animate="visible"
    className="flex items-center justify-between"
  >
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 rounded-2xl bg-transparent border border-border/20 flex items-center justify-center">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </motion.div>
);
