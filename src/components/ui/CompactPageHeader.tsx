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

interface CompactPageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  stats?: QuickStat[];
  actions?: React.ReactNode;
  quickFilters?: QuickFilter[];
  activeFilter?: string;
  onFilterChange?: (key: string) => void;
  children?: React.ReactNode;
}

export const CompactPageHeader: React.FC<CompactPageHeaderProps> = ({
  icon: Icon,
  title,
  subtitle,
  stats,
  actions,
  quickFilters,
  activeFilter,
  onFilterChange,
  children,
}) => {
  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Main header row */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-4.5 w-4.5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-foreground truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
          {/* Inline stats */}
          {stats && stats.length > 0 && (
            <div className="hidden md:flex items-center gap-4 ml-4 pl-4 border-l border-border/40">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-1.5 text-sm">
                  <stat.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium text-foreground">{stat.value}</span>
                  <span className="text-muted-foreground text-xs">{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Optional filter bar */}
      {quickFilters && quickFilters.length > 0 && onFilterChange && (
        <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg border border-border/30 w-fit">
          {quickFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => onFilterChange(filter.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                activeFilter === filter.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              {filter.icon && <filter.icon className="h-3 w-3" />}
              <span>{filter.label}</span>
              {filter.count !== undefined && (
                <Badge
                  variant="secondary"
                  className={`h-4 min-w-4 px-1 text-[10px] leading-none ${
                    activeFilter === filter.key
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {filter.count}
                </Badge>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Optional extra content (search bars, etc.) */}
      {children}
    </motion.div>
  );
};
