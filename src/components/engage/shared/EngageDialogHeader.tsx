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
}) => {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2.5">
        {Icon && (
          <div className="p-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08]">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <span className="text-foreground font-semibold">
          {title}
        </span>
      </DialogTitle>
      <div className="h-px mt-2 bg-border/20" />
    </DialogHeader>
  );
};
