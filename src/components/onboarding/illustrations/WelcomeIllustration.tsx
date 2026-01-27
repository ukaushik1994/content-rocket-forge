import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Search, FileText, BarChart3, Rocket, MessageSquare } from 'lucide-react';

export const WelcomeIllustration = () => {
  const orbitingIcons = [
    { Icon: Brain, color: 'from-purple-400 to-purple-600', delay: 0 },
    { Icon: Search, color: 'from-blue-400 to-blue-600', delay: 0.5 },
    { Icon: FileText, color: 'from-green-400 to-green-600', delay: 1 },
    { Icon: BarChart3, color: 'from-orange-400 to-orange-600', delay: 1.5 },
    { Icon: Rocket, color: 'from-pink-400 to-pink-600', delay: 2 },
    { Icon: MessageSquare, color: 'from-cyan-400 to-cyan-600', delay: 2.5 },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Central logo area */}
      <motion.div
        className="relative"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: 'spring', damping: 15 }}
      >
        {/* Pulse rings */}
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            className="absolute inset-0 rounded-full border border-neon-purple/30"
            style={{
              width: 80 + ring * 60,
              height: 80 + ring * 60,
              left: -(ring * 30),
              top: -(ring * 30),
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              delay: ring * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Central logo */}
        <motion.div
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center shadow-lg shadow-neon-purple/30"
          animate={{
            boxShadow: [
              '0 10px 40px rgba(155, 135, 245, 0.3)',
              '0 10px 60px rgba(155, 135, 245, 0.5)',
              '0 10px 40px rgba(155, 135, 245, 0.3)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <span className="text-2xl font-bold text-white">CA</span>
        </motion.div>
      </motion.div>

      {/* Orbiting icons */}
      {orbitingIcons.map(({ Icon, color, delay }, index) => {
        const angle = (index * 60) * (Math.PI / 180);
        const radius = 120;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <motion.div
            key={index}
            className="absolute"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: [x, x + 10, x],
              y: [y, y - 8, y],
            }}
            transition={{
              opacity: { duration: 0.5, delay: delay },
              scale: { duration: 0.5, delay: delay },
              x: { duration: 4, delay: delay, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: 3, delay: delay, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{ x, y }}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </motion.div>
        );
      })}

      {/* Connecting particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-neon-purple/60"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: [0, (Math.random() - 0.5) * 200],
            y: [0, (Math.random() - 0.5) * 200],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 2,
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
};
