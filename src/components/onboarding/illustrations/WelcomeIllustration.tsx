import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Search, FileText, BarChart3, Rocket, MessageSquare, Sparkles } from 'lucide-react';

export const WelcomeIllustration = () => {
  const orbitingIcons = [
    { Icon: Brain, color: 'from-purple-400 to-purple-600', delay: 0 },
    { Icon: Search, color: 'from-blue-400 to-cyan-500', delay: 0.5 },
    { Icon: FileText, color: 'from-emerald-400 to-green-500', delay: 1 },
    { Icon: BarChart3, color: 'from-orange-400 to-amber-500', delay: 1.5 },
    { Icon: Rocket, color: 'from-pink-400 to-rose-500', delay: 2 },
    { Icon: MessageSquare, color: 'from-cyan-400 to-blue-500', delay: 2.5 },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Galaxy background particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute w-0.5 h-0.5 rounded-full bg-white"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}

      {/* Central logo area */}
      <motion.div
        className="relative"
        initial={{ scale: 0, opacity: 0, rotateY: -180 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ duration: 1, type: 'spring', damping: 12 }}
      >
        {/* Pulse rings - 6 rings for depth */}
        {[1, 2, 3, 4, 5, 6].map((ring) => (
          <motion.div
            key={ring}
            className="absolute rounded-full"
            style={{
              width: 100 + ring * 50,
              height: 100 + ring * 50,
              left: -(ring * 25),
              top: -(ring * 25),
              border: `1px solid rgba(155, 135, 245, ${0.4 - ring * 0.05})`,
              boxShadow: ring <= 3 ? `0 0 ${ring * 10}px rgba(155, 135, 245, ${0.2 - ring * 0.03})` : 'none',
            }}
            animate={{
              scale: [1, 1.05 + ring * 0.02, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + ring * 0.5,
              delay: ring * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Central logo - larger with 3D effect */}
        <motion.div
          className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-neon-purple via-neon-blue to-pink-500 flex items-center justify-center"
          animate={{
            boxShadow: [
              '0 0 40px rgba(155, 135, 245, 0.4), 0 0 80px rgba(155, 135, 245, 0.2)',
              '0 0 60px rgba(155, 135, 245, 0.6), 0 0 120px rgba(155, 135, 245, 0.3)',
              '0 0 40px rgba(155, 135, 245, 0.4), 0 0 80px rgba(155, 135, 245, 0.2)',
            ],
            rotateY: [0, 5, 0, -5, 0],
          }}
          transition={{ 
            boxShadow: { duration: 3, repeat: Infinity },
            rotateY: { duration: 6, repeat: Infinity, ease: 'easeInOut' }
          }}
          style={{ perspective: 1000 }}
        >
          {/* Inner shine */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent" />
          
          <Sparkles className="w-12 h-12 text-white drop-shadow-lg" />
          
          {/* Floating sparkles around logo */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                top: `${20 + (i % 2) * 60}%`,
                left: `${20 + Math.floor(i / 2) * 60}%`,
              }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Infinity,
              }}
            >
              <Sparkles className="w-3 h-3 text-white/60" />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Orbiting icons - larger with trails */}
      {orbitingIcons.map(({ Icon, color, delay }, index) => {
        const angle = (index * 60) * (Math.PI / 180);
        const radius = 160;
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
              x: [x, x + 15, x],
              y: [y, y - 10, y],
            }}
            transition={{
              opacity: { duration: 0.6, delay: delay },
              scale: { duration: 0.6, delay: delay },
              x: { duration: 4, delay: delay, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: 3, delay: delay, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{ x, y }}
          >
            {/* Icon container with glow */}
            <motion.div
              className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center`}
              animate={{
                boxShadow: [
                  `0 0 20px rgba(155, 135, 245, 0.3)`,
                  `0 0 35px rgba(155, 135, 245, 0.5)`,
                  `0 0 20px rgba(155, 135, 245, 0.3)`,
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
            >
              <Icon className="w-7 h-7 text-white drop-shadow-md" />
            </motion.div>

            {/* Connection particle trail */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-neon-purple/60"
                animate={{
                  x: [0, -x * (0.2 + i * 0.2)],
                  y: [0, -y * (0.2 + i * 0.2)],
                  opacity: [0, 0.6, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  delay: delay + i * 0.3,
                  repeat: Infinity,
                }}
              />
            ))}
          </motion.div>
        );
      })}

      {/* Circuit lines connecting nodes */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9b87f5" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#1EAEDB" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {orbitingIcons.map((_, index) => {
          const angle = (index * 60) * (Math.PI / 180);
          const x = Math.cos(angle) * 160;
          const y = Math.sin(angle) * 160;
          return (
            <motion.line
              key={index}
              x1="50%"
              y1="50%"
              x2={`calc(50% + ${x}px)`}
              y2={`calc(50% + ${y}px)`}
              stroke="url(#circuitGradient)"
              strokeWidth="1"
              strokeDasharray="6 6"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
            />
          );
        })}
      </svg>

      {/* Ambient particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0],
            x: [(Math.random() - 0.5) * 100],
            y: [(Math.random() - 0.5) * 100],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 3,
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
};
