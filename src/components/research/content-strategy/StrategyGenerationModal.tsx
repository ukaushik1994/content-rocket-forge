import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export type GenerationStep = {
  label: string;
  status: 'pending' | 'active' | 'done';
  hint?: string;
};

interface StrategyGenerationModalProps {
  open: boolean;
  steps: GenerationStep[];
  onCancel?: () => void;
}

export function StrategyGenerationModal({ open, steps, onCancel }: StrategyGenerationModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Enhanced backdrop with glassmorphism */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel} 
          />
          
          {/* Floating particles background effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-10, -20, -10],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Enhanced modal container */}
          <motion.div
            className="relative w-full max-w-xl mx-auto"
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="glass-card border-white/10 bg-gradient-to-br from-card/90 via-card/95 to-card/90 backdrop-blur-2xl shadow-2xl ring-1 ring-white/5 overflow-hidden">
              
              {/* Gradient border effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-transparent to-primary/20 p-[1px]">
                <div className="h-full w-full rounded-xl bg-card/90 backdrop-blur-xl" />
              </div>

              {/* Header with enhanced styling */}
              <div className="relative p-6 border-b border-white/10 bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center gap-4">
                  <motion.div 
                    className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-1 ring-primary/20"
                    animate={{ 
                      boxShadow: [
                        "0 0 20px hsl(var(--primary) / 0.3)",
                        "0 0 30px hsl(var(--primary) / 0.5)",
                        "0 0 20px hsl(var(--primary) / 0.3)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="h-6 w-6 text-primary" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      Generating AI Strategy
                    </h2>
                    <p className="text-sm text-muted-foreground/90 mt-1">
                      We're preparing proposals based on your market and goals
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced steps section */}
              <div className="relative p-6 bg-gradient-to-b from-transparent to-muted/20">
                <motion.ul className="space-y-4">
                  {steps.map((step, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      className="flex items-start gap-4 group"
                    >
                      {/* Enhanced step indicator */}
                      <div className="relative mt-1 flex-shrink-0">
                        {step.status === 'done' ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="relative"
                          >
                            <CheckCircle2 className="h-6 w-6 text-primary drop-shadow-lg" />
                            <motion.div
                              className="absolute inset-0 rounded-full bg-primary/20"
                              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </motion.div>
                        ) : step.status === 'active' ? (
                          <motion.div className="relative">
                            <motion.div
                              className="h-6 w-6 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center"
                              animate={{ 
                                boxShadow: [
                                  "0 0 10px hsl(var(--primary) / 0.4)",
                                  "0 0 20px hsl(var(--primary) / 0.6)",
                                  "0 0 10px hsl(var(--primary) / 0.4)"
                                ]
                              }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
                            </motion.div>
                            <motion.div
                              className="absolute inset-0 rounded-full border-2 border-primary/30"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            />
                          </motion.div>
                        ) : (
                          <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 bg-muted/20" />
                        )}
                      </div>

                      {/* Step content */}
                      <div className="flex-1 min-w-0">
                        <motion.div 
                          className={`text-sm leading-relaxed ${
                            step.status === 'active' 
                              ? 'font-medium text-foreground' 
                              : step.status === 'done'
                              ? 'text-foreground/90'
                              : 'text-muted-foreground'
                          }`}
                          animate={step.status === 'active' ? {
                            color: ["hsl(var(--foreground))", "hsl(var(--primary))", "hsl(var(--foreground))"]
                          } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {step.label}
                        </motion.div>
                        
                        {step.hint && (
                          <motion.div 
                            className="text-xs text-muted-foreground/80 mt-1 leading-relaxed"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ delay: 0.2 }}
                          >
                            {step.hint}
                          </motion.div>
                        )}
                        
                        {step.status === 'active' && (
                          <motion.div
                            className="mt-3 h-1.5 rounded-full bg-muted/50 overflow-hidden"
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                          >
                            <motion.div
                              className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full"
                              initial={{ width: '15%' }}
                              animate={{ width: '85%' }}
                              transition={{ 
                                duration: 1.8, 
                                repeat: Infinity, 
                                repeatType: 'reverse', 
                                ease: 'easeInOut' 
                              }}
                            />
                          </motion.div>
                        )}
                      </div>
                    </motion.li>
                  ))}
                </motion.ul>

                {/* Enhanced cancel button */}
                {onCancel && (
                  <motion.div 
                    className="mt-8 flex justify-end"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.button 
                      onClick={onCancel} 
                      className="px-4 py-2 text-sm rounded-lg border border-border/50 bg-muted/20 text-foreground/80 hover:bg-muted/40 hover:border-border transition-all duration-200 backdrop-blur-sm"
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}