import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface EngageDialogHeaderProps {
  icon?: LucideIcon;
  title: string;
  gradientFrom?: string;
  gradientTo?: string;
  iconColor?: string;
}

export const EngageDialogHeader: React.FC<EngageDialogHeaderProps> = ({
  icon: Icon,
  title,
  gradientFrom = 'from-primary',
  gradientTo = 'to-primary/70',
  iconColor = 'text-primary',
}) => {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2.5">
        {Icon && (
          <div className="relative">
            <div className={cn('absolute inset-0 rounded-lg blur-md opacity-40 bg-gradient-to-br', gradientFrom, gradientTo)} />
            <div className={cn('relative p-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08]')}>
              <Icon className={cn('h-4 w-4', iconColor)} />
            </div>
          </div>
        )}
        <span className={cn('bg-gradient-to-r bg-clip-text text-transparent font-semibold', gradientFrom, gradientTo)}>
          {title}
        </span>
      </DialogTitle>
      <div className={cn('h-px mt-2 bg-gradient-to-r opacity-20', gradientFrom, gradientTo)} />
    </DialogHeader>
  );
};
