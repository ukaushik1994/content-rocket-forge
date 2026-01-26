import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Brain, Sparkles, Zap, Database, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export type LoadingVariant = 'default' | 'ai' | 'search' | 'data' | 'generating';

interface LoadingOverlayProps {
  isLoading: boolean;
  variant?: LoadingVariant;
  message?: string;
  subMessage?: string;
  progress?: number;
  className?: string;
  fullScreen?: boolean;
}

const variantConfig = {
  default: {
    icon: Loader2,
    color: 'text-primary',
    bgColor: 'from-primary/5 to-primary/10',
    defaultMessage: 'Loading...',
  },
  ai: {
    icon: Brain,
    color: 'text-purple-500',
    bgColor: 'from-purple-500/5 to-blue-500/10',
    defaultMessage: 'AI is processing...',
  },
  search: {
    icon: Search,
    color: 'text-blue-500',
    bgColor: 'from-blue-500/5 to-cyan-500/10',
    defaultMessage: 'Searching...',
  },
  data: {
    icon: Database,
    color: 'text-emerald-500',
    bgColor: 'from-emerald-500/5 to-teal-500/10',
    defaultMessage: 'Fetching data...',
  },
  generating: {
    icon: Sparkles,
    color: 'text-amber-500',
    bgColor: 'from-amber-500/5 to-orange-500/10',
    defaultMessage: 'Generating content...',
  },
};

export function LoadingOverlay({
  isLoading,
  variant = 'default',
  message,
  subMessage,
  progress,
  className,
  fullScreen = false,
}: LoadingOverlayProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;
  const displayMessage = message || config.defaultMessage;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "flex items-center justify-center",
            fullScreen 
              ? "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              : "absolute inset-0 z-10 bg-background/60 backdrop-blur-sm rounded-lg",
            className
          )}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ delay: 0.1 }}
            className={cn(
              "flex flex-col items-center gap-4 p-6 rounded-xl",
              "bg-gradient-to-br",
              config.bgColor,
              "border border-border/50 backdrop-blur-md"
            )}
          >
            {/* Animated Icon */}
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: variant === 'default' ? 360 : 0,
                }}
                transition={{
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 1, repeat: Infinity, ease: "linear" },
                }}
              >
                <Icon className={cn("w-10 h-10", config.color)} />
              </motion.div>
              
              {/* Pulse effect */}
              <motion.div
                className={cn(
                  "absolute inset-0 rounded-full",
                  config.color.replace('text-', 'bg-'),
                  "opacity-20"
                )}
                animate={{
                  scale: [1, 2, 1],
                  opacity: [0.2, 0, 0.2],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>

            {/* Message */}
            <div className="text-center">
              <motion.p
                className="text-sm font-medium text-foreground"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {displayMessage}
              </motion.p>
              
              {subMessage && (
                <motion.p
                  className="text-xs text-muted-foreground mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {subMessage}
                </motion.p>
              )}
            </div>

            {/* Progress bar */}
            {progress !== undefined && (
              <motion.div
                className="w-48 h-1.5 bg-muted/50 rounded-full overflow-hidden"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "12rem" }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    config.color.replace('text-', 'bg-')
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            )}

            {/* Animated dots for indeterminate state */}
            {progress === undefined && (
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className={cn(
                      "w-2 h-2 rounded-full",
                      config.color.replace('text-', 'bg-')
                    )}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
