import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Globe, BarChart3, MessageCircle, Bot, Database, Zap, CheckCircle2 } from 'lucide-react';

export const IntegrationsIllustration = () => {
  const integrations = [
    { name: 'WordPress', icon: Globe, color: 'from-blue-400 to-blue-600', position: { x: -100, y: -70 } },
    { name: 'GA4', icon: BarChart3, color: 'from-orange-400 to-orange-600', position: { x: 100, y: -70 } },
    { name: 'Slack', icon: MessageCircle, color: 'from-purple-400 to-pink-500', position: { x: -100, y: 70 } },
    { name: 'AI APIs', icon: Bot, color: 'from-green-400 to-emerald-600', position: { x: 100, y: 70 } },
    { name: 'Wix', icon: Globe, color: 'from-cyan-400 to-cyan-600', position: { x: 0, y: -110 } },
    { name: 'SERP', icon: Database, color: 'from-amber-400 to-orange-500', position: { x: 0, y: 110 } },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Background sync waves */}
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="absolute w-32 h-32 rounded-full border border-neon-purple/20"
          animate={{
            scale: [1, 3, 4],
            opacity: [0.4, 0.1, 0],
          }}
          transition={{
            duration: 4,
            delay: i * 1,
            repeat: Infinity,
          }}
        />
      ))}

      {/* Central hub - Larger with rotating ring */}
      <motion.div
        className="relative z-20"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, type: 'spring' }}
      >
        {/* Rotating ring */}
        <motion.div
          className="absolute -inset-4 rounded-full border-2 border-dashed border-neon-purple/40"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        
        <motion.div
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-purple via-neon-blue to-pink-500 flex items-center justify-center"
          animate={{
            boxShadow: [
              '0 0 40px rgba(155, 135, 245, 0.4), 0 0 80px rgba(155, 135, 245, 0.2)',
              '0 0 60px rgba(155, 135, 245, 0.6), 0 0 120px rgba(155, 135, 245, 0.3)',
              '0 0 40px rgba(155, 135, 245, 0.4), 0 0 80px rgba(155, 135, 245, 0.2)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>
      </motion.div>

      {/* Integration nodes */}
      {integrations.map((integration, index) => (
        <motion.div
          key={integration.name}
          className="absolute z-10"
          style={{ x: integration.position.x, y: integration.position.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 + index * 0.12, type: 'spring', damping: 15 }}
        >
          {/* Connection line - SVG */}
          <svg
            className="absolute left-1/2 top-1/2 pointer-events-none"
            width="250"
            height="250"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <defs>
              <linearGradient id={`grad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9b87f5" />
                <stop offset="50%" stopColor="#1EAEDB" />
                <stop offset="100%" stopColor="#9b87f5" />
              </linearGradient>
            </defs>
            <motion.line
              x1="125"
              y1="125"
              x2={125 - integration.position.x}
              y2={125 - integration.position.y}
              stroke={`url(#grad-${index})`}
              strokeWidth="2"
              strokeDasharray="8 6"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ delay: 0.6 + index * 0.12, duration: 0.8 }}
            />
          </svg>

          {/* Node with glow */}
          <motion.div
            className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${integration.color} flex items-center justify-center cursor-pointer`}
            animate={{ 
              y: [0, -5, 0],
              boxShadow: [
                `0 0 20px rgba(155,135,245,0.3)`,
                `0 0 35px rgba(155,135,245,0.5)`,
                `0 0 20px rgba(155,135,245,0.3)`,
              ]
            }}
            transition={{
              y: { duration: 2 + index * 0.3, repeat: Infinity, ease: 'easeInOut' },
              boxShadow: { duration: 2, repeat: Infinity, delay: index * 0.2 }
            }}
            whileHover={{ scale: 1.15, y: -8 }}
          >
            <integration.icon className="w-6 h-6 text-white" />
            
            {/* Connected badge */}
            <motion.div
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center border-2 border-slate-900"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2 + index * 0.15, type: 'spring', stiffness: 500 }}
            >
              <CheckCircle2 className="w-3 h-3 text-white" />
            </motion.div>
          </motion.div>

          {/* Label */}
          <motion.div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 + index * 0.12 }}
          >
            <span className="text-[10px] text-white/70 font-medium">{integration.name}</span>
          </motion.div>

          {/* Bi-directional data particles */}
          {[0, 1].map((p) => (
            <motion.div
              key={p}
              className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue"
              animate={{
                x: p === 0 ? [-integration.position.x, 0] : [0, -integration.position.x],
                y: p === 0 ? [-integration.position.y, 0] : [0, -integration.position.y],
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1, 1, 0.5],
              }}
              transition={{
                duration: 2,
                delay: index * 0.4 + p * 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>
      ))}

      {/* Floating Zaps - More dynamic */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${15 + i * 14}%`,
            top: `${25 + (i % 3) * 25}%`,
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.7, 0],
            y: [0, -15, 0],
            x: [(i % 2 === 0 ? -5 : 5), (i % 2 === 0 ? 5 : -5)],
            rotate: [0, 15, 0, -15, 0],
          }}
          transition={{
            duration: 3 + i * 0.3,
            delay: i * 0.6,
            repeat: Infinity,
          }}
        >
          <Zap className="w-4 h-4 text-amber-400/70" />
        </motion.div>
      ))}
    </div>
  );
};
