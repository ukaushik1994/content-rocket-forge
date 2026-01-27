import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Globe, BarChart3, MessageCircle, Bot, Database, Zap } from 'lucide-react';

export const IntegrationsIllustration = () => {
  const integrations = [
    { name: 'WordPress', icon: Globe, color: 'from-blue-400 to-blue-600', position: { x: -100, y: -60 } },
    { name: 'GA4', icon: BarChart3, color: 'from-orange-400 to-orange-600', position: { x: 100, y: -60 } },
    { name: 'Slack', icon: MessageCircle, color: 'from-purple-400 to-pink-500', position: { x: -100, y: 60 } },
    { name: 'AI APIs', icon: Bot, color: 'from-green-400 to-emerald-600', position: { x: 100, y: 60 } },
    { name: 'Wix', icon: Globe, color: 'from-cyan-400 to-cyan-600', position: { x: 0, y: -100 } },
    { name: 'SERP', icon: Database, color: 'from-yellow-400 to-orange-500', position: { x: 0, y: 100 } },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Central hub */}
      <motion.div
        className="relative z-10"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
      >
        <motion.div
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center shadow-lg shadow-neon-purple/30"
          animate={{
            boxShadow: [
              '0 0 30px rgba(155, 135, 245, 0.3)',
              '0 0 50px rgba(155, 135, 245, 0.5)',
              '0 0 30px rgba(155, 135, 245, 0.3)',
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
          className="absolute"
          style={{ x: integration.position.x, y: integration.position.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + index * 0.15, type: 'spring', damping: 15 }}
        >
          {/* Connection line */}
          <svg
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            width="200"
            height="200"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <motion.line
              x1="100"
              y1="100"
              x2={100 - integration.position.x}
              y2={100 - integration.position.y}
              stroke="url(#gradient)"
              strokeWidth="1"
              strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ delay: 0.5 + index * 0.15, duration: 0.8 }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9b87f5" />
                <stop offset="100%" stopColor="#1EAEDB" />
              </linearGradient>
            </defs>
          </svg>

          {/* Node */}
          <motion.div
            className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center shadow-lg`}
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 2 + Math.random(),
              repeat: Infinity,
              delay: index * 0.3,
            }}
            whileHover={{ scale: 1.1 }}
          >
            <integration.icon className="w-5 h-5 text-white" />
          </motion.div>

          {/* Label */}
          <motion.div
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 + index * 0.15 }}
          >
            <span className="text-[9px] text-white/60">{integration.name}</span>
          </motion.div>

          {/* Data flow particles */}
          <motion.div
            className="absolute w-1.5 h-1.5 rounded-full bg-neon-purple/80"
            animate={{
              x: [-integration.position.x, 0],
              y: [-integration.position.y, 0],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              delay: index * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      ))}

      {/* Activity pulses */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-20 h-20 rounded-full border border-neon-purple/20"
          animate={{
            scale: [1, 2, 3],
            opacity: [0.5, 0.2, 0],
          }}
          transition={{
            duration: 3,
            delay: i * 1,
            repeat: Infinity,
          }}
        />
      ))}

      {/* Floating Zaps */}
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
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 2 + Math.random(),
            delay: i * 0.5,
            repeat: Infinity,
          }}
        >
          <Zap className="w-3 h-3 text-yellow-400/60" />
        </motion.div>
      ))}
    </div>
  );
};
