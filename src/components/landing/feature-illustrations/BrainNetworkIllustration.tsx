import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Users, FileText, BarChart } from 'lucide-react';

export const BrainNetworkIllustration = () => {
  const particles = Array.from({ length: 12 }, (_, i) => i);
  const nodes = [
    { x: 30, y: 20, delay: 0 },
    { x: 70, y: 15, delay: 0.3 },
    { x: 50, y: 50, delay: 0.6 },
    { x: 20, y: 70, delay: 0.9 },
    { x: 75, y: 75, delay: 1.2 }
  ];

  const orbitIcons = [
    { Icon: BarChart, angle: 0, radius: 140, delay: 0 },
    { Icon: FileText, angle: 90, radius: 140, delay: 1 },
    { Icon: Users, angle: 180, radius: 140, delay: 2 },
    { Icon: TrendingUp, angle: 270, radius: 140, delay: 3 }
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Central Brain */}
      <motion.div
        className="relative z-20"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="bg-gradient-to-r from-primary to-neon-pink p-6 rounded-full"
        >
          <Brain className="h-24 w-24 text-white" />
        </motion.div>

        {/* Pulse rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: [1, 2, 2.5], opacity: [0.6, 0.2, 0] }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              delay: i * 1,
              ease: "easeOut" 
            }}
          />
        ))}
      </motion.div>

      {/* Neural Network Nodes */}
      {nodes.map((node, index) => (
        <motion.div
          key={index}
          className="absolute w-4 h-4 rounded-full bg-primary/60"
          style={{ 
            left: `${node.x}%`, 
            top: `${node.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            delay: node.delay,
            ease: "easeInOut" 
          }}
        />
      ))}

      {/* Connecting Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {nodes.map((node, index) => {
          if (index < nodes.length - 1) {
            return (
              <motion.line
                key={index}
                x1={`${node.x}%`}
                y1={`${node.y}%`}
                x2={`${nodes[index + 1].x}%`}
                y2={`${nodes[index + 1].y}%`}
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeOpacity="0.3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ 
                  duration: 2, 
                  delay: index * 0.3,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              />
            );
          }
          return null;
        })}
      </svg>

      {/* Floating Data Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle}
          className="absolute w-2 h-2 rounded-full bg-neon-pink/40"
          style={{ 
            left: `${Math.random() * 100}%`, 
            top: `${Math.random() * 100}%` 
          }}
          animate={{ 
            x: [0, Math.random() * 100 - 50],
            y: [0, -100],
            opacity: [0, 1, 0]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            delay: particle * 0.4,
            ease: "linear" 
          }}
        />
      ))}

      {/* Orbiting Icons */}
      {orbitIcons.map(({ Icon, angle, radius, delay }, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{ left: '50%', top: '50%' }}
          animate={{ 
            rotate: 360
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            delay: delay,
            ease: "linear" 
          }}
        >
          <motion.div
            className="bg-card/80 backdrop-blur-sm border border-primary/30 p-3 rounded-lg shadow-lg"
            style={{ 
              transform: `translate(-50%, -50%) translateX(${radius}px) rotate(-360deg)` 
            }}
            animate={{ 
              y: [0, -10, 0]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              delay: delay,
              ease: "easeInOut" 
            }}
          >
            <Icon className="h-5 w-5 text-primary" />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};
