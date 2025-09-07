import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { EnhancedStrategyGenerationModal } from './EnhancedStrategyGenerationModal';

export type GenerationStep = {
  label: string;
  status: 'pending' | 'active' | 'done';
  hint?: string;
};

interface StrategyGenerationModalProps {
  open: boolean;
  steps: GenerationStep[];
  sessionId?: string;
  onComplete?: (data?: any) => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
}

export function StrategyGenerationModal({ 
  open, 
  steps, 
  sessionId, 
  onComplete, 
  onCancel, 
  onError 
}: StrategyGenerationModalProps) {
  // If sessionId is provided, use the enhanced modal with real-time progress
  if (sessionId) {
    return (
      <EnhancedStrategyGenerationModal
        open={open}
        sessionId={sessionId}
        onComplete={onComplete}
        onCancel={onCancel}
        onError={onError}
      />
    );
  }

  // Fallback to original modal for backward compatibility
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onCancel} />
          <motion.div
            className="relative w-full max-w-lg mx-4 rounded-xl border border-border bg-card shadow-xl overflow-hidden"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-5 border-b border-border flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold">Generating AI Strategy</div>
                <div className="text-sm text-muted-foreground">We’re preparing proposals based on your market and goals</div>
              </div>
            </div>

            <div className="p-5">
              <ul className="space-y-3">
                {steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {s.status === 'done' ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : s.status === 'active' ? (
                        <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-border" />
                      )}
                    </div>
                    <div>
                      <div className={`text-sm ${s.status === 'active' ? 'font-medium' : ''}`}>{s.label}</div>
                      {s.hint && (
                        <div className="text-xs text-muted-foreground mt-0.5">{s.hint}</div>
                      )}
                      {s.status === 'active' && (
                        <motion.div
                          className="h-1 rounded bg-muted mt-2 overflow-hidden"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <motion.div
                            className="h-full bg-primary"
                            initial={{ width: '10%' }}
                            animate={{ width: '85%' }}
                            transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                          />
                        </motion.div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {onCancel && (
                <div className="mt-5 flex justify-end">
                  <button onClick={onCancel} className="text-sm px-3 py-1.5 rounded-md border border-border text-foreground/80 hover:bg-muted transition-colors">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
