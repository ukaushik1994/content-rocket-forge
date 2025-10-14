import React from 'react';
import { motion } from 'framer-motion';
import { Brain, BarChart, TrendingUp, Target, Lightbulb, Zap } from 'lucide-react';

export const BrainNetworkIllustration = () => {
  const learningSteps = [
    { 
      number: 1, 
      title: 'Analyzing Performance', 
      progress: 100, 
      Icon: BarChart, 
      gradient: 'from-neon-blue to-neon-pink',
      delay: 0.3 
    },
    { 
      number: 2, 
      title: 'Identifying Patterns', 
      progress: 100, 
      Icon: TrendingUp, 
      gradient: 'from-neon-pink to-primary',
      delay: 0.6 
    },
    { 
      number: 3, 
      title: 'Optimizing Strategy', 
      progress: 65, 
      Icon: Target, 
      gradient: 'from-primary to-neon-orange',
      delay: 0.9 
    }
  ];

  const dataParticles = Array.from({ length: 8 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: i * 0.5
  }));

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-8 overflow-hidden">
      
      {/* Central AI Brain */}
      <motion.div
        className="relative z-20 mb-12"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="w-28 h-28 rounded-full bg-gradient-to-r from-neon-pink to-neon-blue flex items-center justify-center shadow-2xl"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Brain className="h-14 w-14 text-white" />
        </motion.div>

        {/* Pulsing Glow Rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--neon-pink) / 0.4) 0%, transparent 70%)',
            }}
            animate={{ 
              scale: [1, 1.8, 2.2],
              opacity: [0.6, 0.3, 0]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              delay: i * 1,
              ease: "easeOut" 
            }}
          />
        ))}
      </motion.div>

      {/* Learning Progress Cards */}
      <div className="w-full max-w-md space-y-4 z-10">
        {learningSteps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: step.delay }}
          >
            {/* Outer glow */}
            <div className="relative">
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${step.gradient} rounded-xl blur opacity-40`} />
              
              {/* Card */}
              <div className="relative bg-card/80 backdrop-blur-xl border border-primary/20 rounded-xl p-4 shadow-2xl">
                <div className="flex items-center gap-4">
                  {/* Numbered Badge */}
                  <motion.div
                    className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.gradient} flex items-center justify-center font-bold text-white text-lg shrink-0 shadow-lg`}
                    animate={step.progress < 100 ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {step.number}
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <step.Icon className="h-4 w-4 text-primary shrink-0" />
                      <h4 className="text-sm font-semibold truncate">{step.title}</h4>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full bg-gradient-to-r ${step.gradient}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${step.progress}%` }}
                        transition={{ 
                          duration: 1.5, 
                          delay: step.delay + 0.3,
                          ease: "easeOut"
                        }}
                      />
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.progress}% Complete
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* New Insight Card */}
      <motion.div
        className="w-full max-w-md mt-6 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.5 }}
      >
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-orange to-neon-pink rounded-xl blur opacity-40" />
          
          <div className="relative bg-gradient-to-r from-neon-orange/10 to-neon-pink/10 backdrop-blur-xl border border-neon-orange/30 rounded-xl p-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-orange to-neon-pink flex items-center justify-center shrink-0">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">New Strategy Learned</p>
                <p className="text-xs text-muted-foreground">
                  AI detected optimization opportunity
                </p>
              </div>

              <motion.div
                className="text-neon-orange font-bold text-xl shrink-0"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                +12%
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Data Particles */}
      {dataParticles.map((particle, index) => (
        <motion.div
          key={index}
          className="absolute w-2 h-2 rounded-full bg-neon-blue/40 pointer-events-none"
          style={{ 
            left: `${particle.x}%`, 
            top: `${particle.y}%` 
          }}
          animate={{ 
            y: [0, -100],
            opacity: [0, 0.6, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            delay: particle.delay,
            ease: "linear" 
          }}
        />
      ))}
    </div>
  );
};
