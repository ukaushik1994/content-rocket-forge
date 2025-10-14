import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, BarChart, Sparkles, CheckCircle2, MousePointer2 } from 'lucide-react';

export const StrategyDashboardIllustration = () => {
  const metrics = [
    { label: 'Engagement', value: 85, gradient: 'from-neon-blue to-neon-pink', delay: 0.4 },
    { label: 'Reach', value: 72, gradient: 'from-neon-pink to-primary', delay: 0.6 },
    { label: 'Quality Score', value: 94, gradient: 'from-primary to-neon-orange', delay: 0.8 }
  ];

  const barData = [
    { height: 55, label: 'Mon', delay: 0.5 },
    { height: 70, label: 'Tue', delay: 0.6 },
    { height: 50, label: 'Wed', delay: 0.7 },
    { height: 90, label: 'Thu', delay: 0.8 },
    { height: 65, label: 'Fri', delay: 0.9 }
  ];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
      
      {/* Top Strategy Icon */}
      <motion.div
        className="mb-8"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="w-24 h-24 rounded-full bg-gradient-to-r from-neon-orange to-neon-pink flex items-center justify-center shadow-2xl"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <MessageSquare className="h-12 w-12 text-white" />
        </motion.div>

        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(var(--neon-orange) / 0.4) 0%, transparent 70%)',
          }}
          animate={{ 
            scale: [1, 1.5, 1.8],
            opacity: [0.6, 0.3, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeOut" 
          }}
        />
      </motion.div>

      <div className="w-full max-w-md space-y-4">
        
        {/* Performance Metrics Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-blue to-neon-pink rounded-xl blur opacity-30" />
            
            <div className="relative bg-card/80 backdrop-blur-xl border border-primary/20 rounded-xl p-5 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <BarChart className="h-5 w-5 text-primary" />
                <h4 className="text-sm font-semibold">Performance Metrics</h4>
              </div>
              
              <div className="flex items-end justify-between gap-2 h-28">
                {barData.map((bar, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      className="w-full bg-gradient-to-t from-neon-blue to-neon-pink rounded-t"
                      initial={{ height: 0 }}
                      animate={{ height: `${bar.height}%` }}
                      transition={{ 
                        duration: 1, 
                        delay: bar.delay,
                        ease: "easeOut" 
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground">{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Analysis Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-pink to-primary rounded-xl blur opacity-30" />
            
            <div className="relative bg-card/80 backdrop-blur-xl border border-primary/20 rounded-xl p-5 shadow-2xl">
              <h4 className="text-sm font-semibold mb-4">Content Analysis</h4>
              
              <div className="space-y-3">
                {metrics.map((metric, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-muted-foreground">{metric.label}</span>
                      <span className="text-xs font-semibold">{metric.value}%</span>
                    </div>
                    <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full bg-gradient-to-r ${metric.gradient}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.value}%` }}
                        transition={{ 
                          duration: 1.5, 
                          delay: metric.delay,
                          ease: "easeOut"
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Recommendation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-neon-orange rounded-xl blur opacity-30" />
            
            <div className="relative bg-gradient-to-r from-primary/10 to-neon-orange/10 backdrop-blur-xl border border-primary/30 rounded-xl p-4 shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-neon-orange flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold mb-1">AI Recommendation</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Post on Thursdays for +85% reach
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {['Optimized', 'High Impact', 'Ready'].map((tag, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 border border-primary/30"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.2 + index * 0.1 }}
                      >
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-medium">{tag}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Strategy Updated Notification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3 }}
        >
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-orange to-neon-pink rounded-xl blur opacity-30" />
            
            <div className="relative bg-card/80 backdrop-blur-xl border border-primary/20 rounded-xl p-3 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-neon-orange" />
                  <span className="text-xs font-semibold">Strategy Updated</span>
                </div>
                
                <motion.div
                  className="text-neon-orange font-bold text-sm"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  +3 insights
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Animated Cursor */}
      <motion.div
        className="absolute pointer-events-none"
        animate={{ 
          x: [0, 80, 80, 0, 0],
          y: [0, 0, 120, 120, 0]
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
        style={{ left: '15%', top: '15%' }}
      >
        <MousePointer2 className="h-6 w-6 text-primary drop-shadow-lg" />
      </motion.div>

      {/* Floating Sparkles */}
      {[{ x: 15, y: 20 }, { x: 85, y: 30 }, { x: 50, y: 80 }].map((pos, index) => (
        <motion.div
          key={index}
          className="absolute pointer-events-none"
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          animate={{ 
            scale: [0, 1, 0],
            rotate: [0, 180, 360],
            opacity: [0, 0.8, 0]
          }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity,
            delay: index * 0.8,
            ease: "easeInOut" 
          }}
        >
          <Sparkles className="h-4 w-4 text-neon-pink" />
        </motion.div>
      ))}
    </div>
  );
};
