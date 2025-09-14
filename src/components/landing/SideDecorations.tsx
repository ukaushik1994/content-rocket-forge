import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Target, TrendingUp, BarChart3, Sparkles, Brain, 
  Globe, Users, Clock, Shield, Rocket, Star 
} from 'lucide-react';

const leftFeatures = [
  { icon: Brain, label: 'AI-Powered', description: 'Advanced algorithms' },
  { icon: Zap, label: 'Lightning Fast', description: '10x faster creation' },
  { icon: Target, label: 'Precision Targeting', description: 'Laser-focused content' },
  { icon: Shield, label: 'Enterprise Security', description: 'Bank-level protection' }
];

const rightStats = [
  { icon: Users, value: '50K+', label: 'Active Creators' },
  { icon: BarChart3, value: '2M+', label: 'Content Pieces' },
  { icon: Globe, value: '150+', label: 'Countries' },
  { icon: Rocket, value: '99.9%', label: 'Uptime' }
];

const workflowSteps = [
  { step: 1, label: 'Analyze', color: 'blue' },
  { step: 2, label: 'Generate', color: 'purple' },
  { step: 3, label: 'Optimize', color: 'cyan' },
  { step: 4, label: 'Publish', color: 'emerald' }
];

export const SideDecorations = () => {
  return (
    <>
      {/* Left Side - Feature Callouts */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 hidden lg:block">
        <div className="flex flex-col space-y-6 pl-8">
          {leftFeatures.map((feature, index) => (
            <motion.div
              key={feature.label}
              className="flex items-center space-x-4 group cursor-pointer"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: 1 + index * 0.2, 
                duration: 0.6,
                ease: "easeOut"
              }}
              whileHover={{ 
                x: 10,
                transition: { duration: 0.2 }
              }}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 backdrop-blur-sm flex items-center justify-center group-hover:border-white/30 transition-all duration-300">
                  <feature.icon className="h-6 w-6 text-blue-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
              </div>
              
              <div className="text-left">
                <div className="text-white font-semibold text-sm group-hover:text-blue-300 transition-colors duration-300">
                  {feature.label}
                </div>
                <div className="text-white/60 text-xs group-hover:text-white/80 transition-colors duration-300">
                  {feature.description}
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Floating workflow indicator */}
          <motion.div 
            className="mt-8 pl-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 0.6 }}
          >
            <div className="flex items-center space-x-2 text-xs text-white/50">
              <Sparkles className="h-3 w-3" />
              <span>Intelligent Workflow</span>
            </div>
            <div className="flex space-x-2 mt-2">
              {workflowSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  className={`w-2 h-2 rounded-full bg-${step.color}-400/60`}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.5
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Stats & Tech Badges */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden lg:block">
        <div className="flex flex-col space-y-6 pr-8">
          {rightStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-right group cursor-pointer"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: 1 + index * 0.2, 
                duration: 0.6,
                ease: "easeOut"
              }}
              whileHover={{ 
                x: -10,
                transition: { duration: 0.2 }
              }}
            >
              <div className="flex items-center justify-end space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors duration-300">
                    {stat.value}
                  </div>
                  <div className="text-white/60 text-xs group-hover:text-white/80 transition-colors duration-300 flex items-center justify-end space-x-1">
                    <stat.icon className="h-3 w-3" />
                    <span>{stat.label}</span>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-white/10 backdrop-blur-sm flex items-center justify-center group-hover:border-white/30 transition-all duration-300">
                    <stat.icon className="h-6 w-6 text-emerald-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Tech stack indicators */}
          <motion.div 
            className="mt-8 pr-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 0.6 }}
          >
            <div className="flex items-center justify-end space-x-2 text-xs text-white/50 mb-2">
              <span>Powered by AI</span>
              <Star className="h-3 w-3" />
            </div>
            <div className="flex justify-end space-x-2">
              {['GPT', 'BERT', 'T5', 'LLM'].map((tech, index) => (
                <motion.div
                  key={tech}
                  className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  animate={{
                    borderColor: ['rgba(255,255,255,0.1)', 'rgba(59,130,246,0.3)', 'rgba(255,255,255,0.1)']
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.7
                  }}
                >
                  {tech}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};