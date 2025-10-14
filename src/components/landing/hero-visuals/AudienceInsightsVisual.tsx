import React from 'react';
import { motion } from 'framer-motion';
import { Users, Brain, Target, Clock, Heart, TrendingUp } from 'lucide-react';
export const AudienceInsightsVisual = () => {
  return <motion.div initial={{
    opacity: 0,
    scale: 0.95
  }} animate={{
    opacity: 1,
    scale: 1
  }} exit={{
    opacity: 0,
    scale: 0.95
  }} transition={{
    duration: 0.5,
    ease: [0.43, 0.13, 0.23, 0.96]
  }} className="space-y-6">
      {/* Personalized Strategy Badge */}
      <motion.div initial={{
      opacity: 0,
      y: 10
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.1,
      ease: "easeInOut"
    }} className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-neon-blue/20 border border-primary/30 w-fit mx-auto shadow-md shadow-primary/20">
        <motion.div animate={{
        scale: [1, 1.2, 1]
      }} transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }} className="drop-shadow-[0_0_8px_rgba(var(--primary),0.4)]">
          <Brain className="h-4 w-4 text-primary" />
        </motion.div>
        <span className="text-xs font-medium text-primary">Personalized for YOU</span>
      </motion.div>

      {/* Central User Avatar with Insights */}
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      duration: 0.6,
      delay: 0.2,
      ease: "easeInOut"
    }} className="bg-gradient-to-r from-background/50 to-background/20 rounded-lg border border-border/30 p-6 relative overflow-hidden shadow-lg">
        {/* Center avatar */}
        <motion.div initial={{
        scale: 0
      }} animate={{
        scale: 1
      }} transition={{
        delay: 0.35,
        type: 'spring',
        stiffness: 150,
        damping: 12
      }} className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-neon-blue mx-auto mb-6 flex items-center justify-center relative shadow-lg shadow-primary/30">
          <Users className="h-10 w-10 text-white" />
          
          {/* Radiating insight beams */}
          {[0, 1, 2, 3].map(index => {})}
        </motion.div>

        {/* Insight Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[{
          icon: Heart,
          label: 'Preferences',
          value: '94%',
          color: 'primary'
        }, {
          icon: Target,
          label: 'Targeting',
          value: '89%',
          color: 'neon-blue'
        }, {
          icon: TrendingUp,
          label: 'Engagement',
          value: '92%',
          color: 'neon-pink'
        }, {
          icon: Clock,
          label: 'Timing',
          value: '87%',
          color: 'primary'
        }].map((metric, index) => <motion.div key={index} initial={{
          opacity: 0,
          scale: 0.8
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          delay: 0.5 + index * 0.12,
          type: "spring",
          stiffness: 150,
          damping: 12
        }} className={`bg-gradient-to-br from-${metric.color}/20 to-${metric.color}/5 rounded-lg border border-${metric.color}/30 p-3 shadow-md`}>
              <div className="flex items-center gap-2 mb-2">
                <metric.icon className={`h-4 w-4 text-${metric.color}`} />
                <span className="text-xs text-muted-foreground">{metric.label}</span>
              </div>
              <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            delay: 0.7 + index * 0.12,
            ease: "easeInOut"
          }} className="text-lg font-bold text-foreground">
                {metric.value}
              </motion.div>
            </motion.div>)}
        </div>
      </motion.div>

      {/* Audience Understanding Panel */}
      <motion.div initial={{
      opacity: 0,
      y: 10
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.4,
      delay: 1.2,
      ease: "easeInOut"
    }} className="bg-gradient-to-r from-primary/10 via-neon-blue/10 to-neon-pink/10 rounded-lg border border-primary/30 p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">Audience Insights</span>
          <motion.div animate={{
          rotate: [0, 360]
        }} transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear'
        }} className="drop-shadow-[0_0_6px_rgba(var(--primary),0.4)]">
            <Brain className="h-4 w-4 text-primary" />
          </motion.div>
        </div>

        {[{
        label: 'Content Preferences',
        value: 85,
        color: 'primary'
      }, {
        label: 'Engagement Patterns',
        value: 78,
        color: 'neon-blue'
      }, {
        label: 'Best Publishing Times',
        value: 92,
        color: 'neon-pink'
      }].map((insight, index) => <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground">{insight.label}</span>
              <motion.span initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            delay: 1.4 + index * 0.18,
            ease: "easeInOut"
          }} className={`text-${insight.color} font-medium`}>
                {insight.value}%
              </motion.span>
            </div>
            <div className="h-1.5 bg-background/50 rounded-full overflow-hidden">
              <motion.div className={`h-full bg-gradient-to-r from-${insight.color} to-${insight.color}/60 rounded-full shadow-[0_0_6px_rgba(var(--${insight.color}),0.4)]`} initial={{
            width: 0
          }} animate={{
            width: `${insight.value}%`
          }} transition={{
            duration: 1.3,
            delay: 1.4 + index * 0.18,
            ease: "easeInOut"
          }} />
            </div>
          </div>)}
      </motion.div>
    </motion.div>;
};