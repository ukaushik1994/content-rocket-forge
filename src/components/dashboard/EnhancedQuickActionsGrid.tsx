
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { useQuickActions } from '@/hooks/dashboard/useQuickActions';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100
    }
  }
};

export function EnhancedQuickActionsGrid() {
  const { quickActions } = useQuickActions();

  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-3 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {quickActions.map((action, index) => {
        const IconComponent = LucideIcons[action.icon as keyof typeof LucideIcons] as LucideIcon;
        
        return (
          <motion.div key={action.id} variants={itemVariants} custom={index}>
            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-border bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-4">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full h-auto flex flex-col items-center gap-3 p-4 text-center hover:bg-transparent group-hover:scale-105 transition-transform duration-200",
                    action.variant === 'primary' && "bg-primary/10 hover:bg-primary/20"
                  )}
                  onClick={action.action}
                >
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200",
                    action.variant === 'primary' 
                      ? "bg-primary text-primary-foreground group-hover:bg-primary/90" 
                      : "bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground"
                  )}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-medium text-sm mb-1">{action.title}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      {action.description}
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
