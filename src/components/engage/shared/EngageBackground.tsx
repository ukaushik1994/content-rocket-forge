import React from 'react';
import { motion } from 'framer-motion';

export const EngageBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
    {/* Gradient orbs – muted version of homepage */}
    <motion.div
      className="absolute top-[5%] left-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-primary/8 via-blue-500/6 to-transparent blur-[100px]"
      animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.08, 1], opacity: [0.6, 0.9, 0.6] }}
      transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-gradient-to-l from-purple-500/6 via-pink-500/4 to-transparent blur-[80px]"
      animate={{ x: [0, -25, 0], y: [0, 20, 0], scale: [1, 0.95, 1], opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 25, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: 5 }}
    />
    {/* Grid overlay */}
    <div className="absolute inset-0 opacity-[0.015]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(155,135,245,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(155,135,245,0.15)_1px,transparent_1px)] bg-[size:40px_40px]" />
    </div>
    {/* Particles */}
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-0.5 h-0.5 bg-primary/20 rounded-full"
        style={{ left: `${15 + Math.random() * 70}%`, top: `${10 + Math.random() * 80}%` }}
        animate={{ y: [0, -60, 0], opacity: [0, 0.6, 0], scale: [0, 1.2, 0] }}
        transition={{ duration: 6 + Math.random() * 8, repeat: Infinity, delay: Math.random() * 6, ease: 'easeInOut' }}
      />
    ))}
  </div>
);
