import React from 'react';
import { LucideIcon, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Status Badge ──────────────────────────────────────────
// Colored dot + text. Used for content/campaign/journey status.
const statusColors: Record<string, { dot: string; text: string; bg: string }> = {
  draft:          { dot: 'bg-muted-foreground', text: 'text-muted-foreground', bg: 'bg-muted/40' },
  pending:        { dot: 'bg-amber-500',        text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
  pending_review: { dot: 'bg-amber-500',        text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
  needs_changes:  { dot: 'bg-orange-500',       text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10' },
  approved:       { dot: 'bg-emerald-500',      text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  published:      { dot: 'bg-emerald-500',      text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  active:         { dot: 'bg-emerald-500',      text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  rejected:       { dot: 'bg-destructive',      text: 'text-destructive', bg: 'bg-destructive/10' },
  paused:         { dot: 'bg-muted-foreground', text: 'text-muted-foreground', bg: 'bg-muted/40' },
  completed:      { dot: 'bg-primary',          text: 'text-primary', bg: 'bg-primary/10' },
  scheduled:      { dot: 'bg-blue-500',         text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
  posted:         { dot: 'bg-emerald-500',      text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  failed:         { dot: 'bg-destructive',      text: 'text-destructive', bg: 'bg-destructive/10' },
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className }) => {
  const colors = statusColors[status.toLowerCase()] || statusColors.draft;
  const displayLabel = label || status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium',
      colors.bg, colors.text, className
    )}>
      <span className={cn('h-1.5 w-1.5 rounded-full', colors.dot)} />
      {displayLabel}
    </span>
  );
};

// ─── Feature Badge ─────────────────────────────────────────
// Icon + text pill. Use sparingly for feature labels.
interface FeatureBadgeProps {
  icon: LucideIcon;
  label: string;
  className?: string;
}

export const FeatureBadge: React.FC<FeatureBadgeProps> = ({ icon: Icon, label, className }) => (
  <span className={cn(
    'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary',
    className
  )}>
    <Icon className="h-3 w-3" />
    {label}
  </span>
);

// ─── Warning Badge ─────────────────────────────────────────
// Outlined with icon. For STALE, Error, etc.
interface WarningBadgeProps {
  label: string;
  icon?: LucideIcon;
  variant?: 'warning' | 'error' | 'info';
  className?: string;
}

const warningVariants = {
  warning: 'border-amber-500/40 text-amber-600 dark:text-amber-400',
  error:   'border-destructive/40 text-destructive',
  info:    'border-blue-500/40 text-blue-600 dark:text-blue-400',
};

export const WarningBadge: React.FC<WarningBadgeProps> = ({ label, icon: Icon = AlertTriangle, variant = 'warning', className }) => (
  <span className={cn(
    'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border',
    warningVariants[variant], className
  )}>
    <Icon className="h-3 w-3" />
    {label}
  </span>
);
