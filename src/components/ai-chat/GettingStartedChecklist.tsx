import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Building2, Target, FileText, Sparkles, Rocket } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Milestone {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  action?: () => void;
}

export const GettingStartedChecklist: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('creaiter-getting-started-dismissed') === 'true');

  useEffect(() => {
    if (!user || dismissed) return;
    const check = async () => {
      const [companyRes, solutionsRes, proposalsRes, contentRes] = await Promise.all([
        supabase.from('company_info').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('solutions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('ai_strategy_proposals').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('content_items').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);

      const items: Milestone[] = [
        {
          id: 'company',
          label: 'Set up your company',
          description: 'Add your company name and website',
          icon: <Building2 className="h-4 w-4" />,
          completed: (companyRes.count ?? 0) > 0,
          action: () => navigate('/settings'),
        },
        {
          id: 'solutions',
          label: 'Add your first offering',
          description: 'Define a product or service you want to promote',
          icon: <Target className="h-4 w-4" />,
          completed: (solutionsRes.count ?? 0) > 0,
          action: () => navigate('/solutions'),
        },
        {
          id: 'proposals',
          label: 'Generate AI proposals',
          description: 'Ask the AI to create content proposals for you',
          icon: <Sparkles className="h-4 w-4" />,
          completed: (proposalsRes.count ?? 0) > 0,
        },
        {
          id: 'content',
          label: 'Create your first content',
          description: 'Use the Content Wizard to write your first article',
          icon: <FileText className="h-4 w-4" />,
          completed: (contentRes.count ?? 0) > 0,
        },
      ];

      setMilestones(items);
    };
    check();
  }, [user, dismissed]);

  if (dismissed || milestones.length === 0) return null;

  const completedCount = milestones.filter(m => m.completed).length;
  const allDone = completedCount === milestones.length;
  const progress = (completedCount / milestones.length) * 100;

  if (allDone) {
    // Auto-dismiss when all done after a delay
    setTimeout(() => {
      localStorage.setItem('creaiter-getting-started-dismissed', 'true');
      setDismissed(true);
    }, 3000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="w-full max-w-3xl"
    >
      <div className="rounded-xl border border-border/30 bg-background/40 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Rocket className="h-4 w-4 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">
                {allDone ? 'All set! 🎉' : 'Getting Started'}
              </p>
              <p className="text-xs text-muted-foreground">
                {completedCount}/{milestones.length} completed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Progress bar */}
            <div className="w-24 h-1.5 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {/* Milestones */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-3 space-y-1">
                {milestones.map((milestone, index) => (
                  <motion.button
                    key={milestone.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={milestone.action}
                    disabled={!milestone.action || milestone.completed}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                      milestone.completed
                        ? "opacity-60"
                        : milestone.action
                        ? "hover:bg-accent/5 cursor-pointer"
                        : "opacity-80"
                    )}
                  >
                    {milestone.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm",
                        milestone.completed ? "line-through text-muted-foreground" : "text-foreground"
                      )}>
                        {milestone.label}
                      </p>
                      {!milestone.completed && (
                        <p className="text-xs text-muted-foreground truncate">{milestone.description}</p>
                      )}
                    </div>
                    {!milestone.completed && milestone.action && (
                      <span className="text-xs text-primary font-medium shrink-0">Go →</span>
                    )}
                  </motion.button>
                ))}
              </div>
              {!allDone && (
                <div className="px-4 pb-3">
                  <button
                    onClick={() => {
                      localStorage.setItem('creaiter-getting-started-dismissed', 'true');
                      setDismissed(true);
                    }}
                    className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
