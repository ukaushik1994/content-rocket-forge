import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { LucideIcon, Sparkles, Target, BarChart3 } from 'lucide-react';

interface SmartLoadingStateProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  steps?: string[];
  progress?: number;
  className?: string;
}

export const SmartLoadingState: React.FC<SmartLoadingStateProps> = ({
  title,
  subtitle,
  icon: Icon = Target,
  steps = ['Initializing...', 'Loading data...', 'Preparing interface...'],
  progress = 0,
  className = ""
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      <Card className="glass-card border border-white/20 shadow-2xl">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-white">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="p-3 rounded-xl glass-panel border border-white/20"
            >
              <Icon className="h-6 w-6 text-primary" />
            </motion.div>
            <div>
              <div className="text-xl font-semibold">{title}</div>
              {subtitle && (
                <div className="text-sm text-white/60 font-normal">{subtitle}</div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          {progress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white/80">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 glass-panel rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary to-blue-500"
                />
              </div>
            </div>
          )}
          
          {/* Loading Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <motion.div 
                key={step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: index * 0.2,
                  duration: 0.4,
                  ease: "easeOut"
                }}
                className="flex items-center gap-3"
              >
                {/* Animated Dots */}
                <div className="flex gap-1">
                  {[0, 1, 2].map((dotIndex) => (
                    <motion.div
                      key={dotIndex}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 1.2,
                        repeat: Infinity,
                        delay: dotIndex * 0.2 + index * 0.1,
                        ease: "easeInOut"
                      }}
                      className="w-2 h-2 bg-primary rounded-full"
                    />
                  ))}
                </div>
                
                <span className="text-white/80 text-sm">{step}</span>
              </motion.div>
            ))}
          </div>
          
          {/* Floating Particles Effect */}
          <div className="relative h-16 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: -10, 
                  y: Math.random() * 60,
                  opacity: 0
                }}
                animate={{ 
                  x: 400, 
                  y: Math.random() * 60,
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "linear"
                }}
                className="absolute w-1 h-1 bg-primary rounded-full"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};