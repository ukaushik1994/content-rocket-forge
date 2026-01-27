import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Globe, BarChart3, MessageCircle, Bot, Database, Zap, CheckCircle2 } from 'lucide-react';

export const IntegrationsIllustration = () => {
  const integrations = [
    { name: 'WordPress', icon: Globe, color: 'from-blue-400 to-blue-600', position: { x: -80, y: -55 } },
    { name: 'GA4', icon: BarChart3, color: 'from-orange-400 to-orange-600', position: { x: 80, y: -55 } },
    { name: 'Slack', icon: MessageCircle, color: 'from-purple-400 to-pink-500', position: { x: -80, y: 55 } },
    { name: 'AI APIs', icon: Bot, color: 'from-green-400 to-emerald-600', position: { x: 80, y: 55 } },
    { name: 'Wix', icon: Globe, color: 'from-cyan-400 to-cyan-600', position: { x: 0, y: -90 } },
    { name: 'SERP', icon: Database, color: 'from-amber-400 to-orange-500', position: { x: 0, y: 90 } },
  ];

  return (
    <div className="relative w-full h-full max-h-full flex items-center justify-center overflow-hidden">
      {/* Background sync waves */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute w-24 h-24 rounded-full border border-neon-purple/20"
          animate={{
            scale: [1, 2.5, 3],
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
          className="absolute -inset-3 rounded-full border-2 border-dashed border-neon-purple/40"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        
        <motion.div
          className="w-16 h-16 rounded-xl bg-gradient-to-br from-neon-purple via-neon-blue to-pink-500 flex items-center justify-center"
          animate={{
            boxShadow: [
              '0 0 30px rgba(155, 135, 245, 0.4), 0 0 60px rgba(155, 135, 245, 0.2)',
              '0 0 50px rgba(155, 135, 245, 0.6), 0 0 100px rgba(155, 135, 245, 0.3)',
              '0 0 30px rgba(155, 135, 245, 0.4), 0 0 60px rgba(155, 135, 245, 0.2)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Sparkles className="w-8 h-8 text-white" />
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
          transition={{ delay: 0.4 + index * 0.1, type: 'spring', damping: 15 }}
        >
          {/* Connection line - SVG */}
          <svg
            className="absolute left-1/2 top-1/2 pointer-events-none"
            width="200"
            height="200"
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
              x1="100"
              y1="100"
              x2={100 - integration.position.x}
              y2={100 - integration.position.y}
              stroke={`url(#grad-${index})`}
              strokeWidth="1.5"
              strokeDasharray="6 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
            />
          </svg>

          {/* Node with glow */}
          <motion.div
            className={`relative w-11 h-11 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center cursor-pointer`}
            animate={{ 
              y: [0, -4, 0],
              boxShadow: [
                `0 0 15px rgba(155,135,245,0.3)`,
                `0 0 25px rgba(155,135,245,0.5)`,
                `0 0 15px rgba(155,135,245,0.3)`,
              ]
            }}
            transition={{
              y: { duration: 2 + index * 0.2, repeat: Infinity, ease: 'easeInOut' },
              boxShadow: { duration: 2, repeat: Infinity, delay: index * 0.15 }
            }}
            whileHover={{ scale: 1.1 }}
          >
            <integration.icon className="w-5 h-5 text-white" />
            
            {/* Connected badge */}
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center border-2 border-slate-900"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1 + index * 0.12, type: 'spring', stiffness: 500 }}
            >
              <CheckCircle2 className="w-2.5 h-2.5 text-white" />
            </motion.div>
          </motion.div>

          {/* Label */}
          <motion.div
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 + index * 0.1 }}
          >
            <span className="text-[9px] text-white/70 font-medium">{integration.name}</span>
          </motion.div>

          {/* Bi-directional data particles - reduced */}
          {[0].map((p) => (
            <motion.div
              key={p}
              className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue"
              animate={{
                x: [-integration.position.x, 0],
                y: [-integration.position.y, 0],
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1, 1, 0.5],
              }}
              transition={{
                duration: 2,
                delay: index * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>
      ))}

      {/* Floating Zaps - reduced */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${20 + i * 20}%`,
            top: `${30 + (i % 2) * 40}%`,
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.6, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3 + i * 0.3,
            delay: i * 0.5,
            repeat: Infinity,
          }}
        >
          <Zap className="w-3 h-3 text-amber-400/70" />
        </motion.div>
      ))}
    </div>
  );
};
