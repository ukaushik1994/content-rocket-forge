import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface QuickStat {
  icon: LucideIcon;
  label: string;
  value: number | string;
}

interface QuickFilter {
  key: string;
  label: string;
  count?: number;
  icon?: LucideIcon;
}

interface EngagePageHeroProps {
  icon: LucideIcon;
  badge: string;
  title: string;
  titleAccent?: string;
  subtitle: string;
  gradientFrom: string;
  gradientTo: string;
  stats?: QuickStat[];
  quickFilters?: QuickFilter[];
  activeFilter?: string;
  onFilterChange?: (key: string) => void;
  actions?: React.ReactNode;
}

export const EngagePageHero: React.FC<EngagePageHeroProps> = ({
  icon: Icon,
  badge,
  title,
  titleAccent,
  subtitle,
  gradientFrom,
  gradientTo,
  stats,
  quickFilters,
  activeFilter,
  onFilterChange,
  actions,
}) => {
  return (
    <motion.div
      className="min-h-[40vh] w-full relative flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Glow */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-3xl blur-[100px] opacity-[0.08]`}
        animate={{ opacity: [0.05, 0.12, 0.05] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative z-10 w-full px-6 py-12">
        <motion.div
          className="text-center mb-10 relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative">
            {/* Badge pill */}
            <motion.div
              className="inline-flex items-center gap-3 px-5 py-2.5 glass-card rounded-full mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Icon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{badge}</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </motion.div>

            {/* Title */}
            <motion.h1
              className={`text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {title}
              {titleAccent && (
                <>
                  <br />
                  <span className="text-primary">{titleAccent}</span>
                </>
              )}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {subtitle}
            </motion.p>

            {/* Actions */}
            {actions && (
              <motion.div
                className="flex gap-3 justify-center mb-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              >
                {actions}
              </motion.div>
            )}

            {/* Quick Stats */}
            {stats && stats.length > 0 && (
              <motion.div
                className="flex justify-center gap-8 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {stats.map((stat) => (
                  <motion.div
                    key={stat.label}
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-background/60 backdrop-blur-xl rounded-xl border border-border/50 mb-2">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-sm font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Quick Filters */}
        {quickFilters && quickFilters.length > 0 && onFilterChange && (
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex gap-2 p-1.5 bg-background/60 backdrop-blur-xl rounded-2xl border border-border/50">
              {quickFilters.map((filter) => (
                <motion.button
                  key={filter.key}
                  onClick={() => onFilterChange(filter.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm ${
                    activeFilter === filter.key
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'hover:bg-background/80 text-muted-foreground'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {filter.icon && <filter.icon className="h-4 w-4" />}
                  <span className="font-medium">{filter.label}</span>
                  {filter.count !== undefined && (
                    <Badge
                      variant={activeFilter === filter.key ? 'secondary' : 'outline'}
                      className={activeFilter === filter.key ? 'bg-primary-foreground/20' : ''}
                    >
                      {filter.count}
                    </Badge>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
