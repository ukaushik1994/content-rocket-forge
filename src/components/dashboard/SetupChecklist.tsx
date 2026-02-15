import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Building2, Package, Key, Search, 
  CheckCircle2, Circle, ArrowRight, X, Rocket 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  route: string;
  completed: boolean;
}

export function SetupChecklist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const dismissed = localStorage.getItem('creAiter-setup-checklist-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      setIsLoading(false);
      return;
    }

    checkSetupStatus();
  }, [user]);

  const checkSetupStatus = async () => {
    if (!user) return;
    
    try {
      const [companyRes, solutionsRes, apiKeysRes] = await Promise.all([
        supabase.from('company_info').select('id').eq('user_id', user.id).limit(1),
        supabase.from('solutions').select('id').eq('user_id', user.id).limit(1),
        supabase.from('ai_service_providers').select('id').eq('user_id', user.id).eq('status', 'active').limit(1),
      ]);

      const checklist: ChecklistItem[] = [
        {
          id: 'company',
          label: 'Set up your company',
          description: 'Add your company name, website, and industry',
          icon: Building2,
          route: '/offerings',
          completed: (companyRes.data?.length ?? 0) > 0,
        },
        {
          id: 'solutions',
          label: 'Add your offerings',
          description: 'Define the products or services you offer',
          icon: Package,
          route: '/offerings',
          completed: (solutionsRes.data?.length ?? 0) > 0,
        },
        {
          id: 'api-keys',
          label: 'Configure AI API keys',
          description: 'Connect OpenAI or another AI provider',
          icon: Key,
          route: '/ai-settings',
          completed: (apiKeysRes.data?.length ?? 0) > 0,
        },
        {
          id: 'research',
          label: 'Run your first research',
          description: 'Start with keyword or competitor research',
          icon: Search,
          route: '/research/research-hub',
          completed: false, // Always show as incomplete to encourage exploration
        },
      ];

      setItems(checklist);
    } catch (error) {
      console.error('Error checking setup status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completedCount = items.filter(i => i.completed).length;
  const allDone = completedCount >= 3; // 3 of 4 (research is always "incomplete")

  const handleDismiss = () => {
    localStorage.setItem('creAiter-setup-checklist-dismissed', 'true');
    setIsDismissed(true);
  };

  if (isLoading || isDismissed || items.length === 0) return null;
  // Don't show if user already completed most steps
  if (allDone) return null;

  const progress = Math.round((completedCount / items.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative overflow-hidden rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-sm p-6"
    >
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
          <Rocket className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Get Started</h3>
          <p className="text-sm text-muted-foreground">Complete these steps to unlock the full platform</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>{completedCount} of {items.length} completed</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate(item.route)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left group ${
              item.completed 
                ? 'bg-muted/20 text-muted-foreground' 
                : 'bg-background/50 hover:bg-background/80 border border-border/30 hover:border-primary/30'
            }`}
          >
            {item.completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            )}
            <item.icon className={`h-4 w-4 flex-shrink-0 ${item.completed ? 'text-muted-foreground' : 'text-primary'}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${item.completed ? 'line-through' : ''}`}>{item.label}</p>
              <p className="text-xs text-muted-foreground truncate">{item.description}</p>
            </div>
            {!item.completed && (
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}