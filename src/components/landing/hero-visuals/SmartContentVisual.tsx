import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Twitter, Mail, Video, Image as ImageIcon, Presentation, MessageSquare, Linkedin, BarChart3, CheckCircle2 } from 'lucide-react';

export const SmartContentVisual = () => {
  const contentFormats = [
    { icon: Twitter, angle: 0, delay: 0.3, color: 'from-blue-500 to-cyan-500' },
    { icon: Mail, angle: 45, delay: 0.4, color: 'from-red-500 to-orange-500' },
    { icon: Video, angle: 90, delay: 0.5, color: 'from-purple-500 to-pink-500' },
    { icon: ImageIcon, angle: 135, delay: 0.6, color: 'from-green-500 to-emerald-500' },
    { icon: Presentation, angle: 180, delay: 0.7, color: 'from-yellow-500 to-orange-500' },
    { icon: MessageSquare, angle: 225, delay: 0.8, color: 'from-indigo-500 to-purple-500' },
    { icon: Linkedin, angle: 270, delay: 0.9, color: 'from-blue-600 to-blue-400' },
    { icon: BarChart3, angle: 315, delay: 1.0, color: 'from-pink-500 to-rose-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="grid lg:grid-cols-[60%_40%] gap-8 min-h-[500px]"
    >
      {/* Left Side - Content Hub Visual */}
      <div className="relative flex items-center justify-center">
        {/* Central Document */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 15 }}
          className="relative z-10"
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/30 to-pink-500/30 rounded-full blur-2xl" />
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-orange-500/40"
          >
            <FileText className="h-12 w-12 text-white" />
          </motion.div>
        </motion.div>

        {/* Orbiting Format Icons */}
        {contentFormats.map((format, index) => {
          const radius = 120;
          const angleRad = (format.angle * Math.PI) / 180;
          const x = Math.cos(angleRad) * radius;
          const y = Math.sin(angleRad) * radius;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: format.delay, type: "spring", stiffness: 150, damping: 12 }}
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
                marginLeft: x - 20,
                marginTop: y - 20,
              }}
            >
              {/* Connection Line */}
              <svg
                className="absolute top-1/2 left-1/2 pointer-events-none"
                style={{
                  width: Math.abs(x) + 40,
                  height: Math.abs(y) + 40,
                  transform: `translate(${x > 0 ? '-100%' : '0'}, ${y > 0 ? '-100%' : '0'})`,
                }}
              >
                <motion.line
                  x1={x > 0 ? '100%' : '0'}
                  y1={y > 0 ? '100%' : '0'}
                  x2={x > 0 ? '0' : '100%'}
                  y2={y > 0 ? '0' : '100%'}
                  stroke="url(#lineGradient)"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: format.delay + 0.2, duration: 0.5 }}
                />
                <defs>
                  <linearGradient id="lineGradient">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>

              <motion.div
                whileHover={{ scale: 1.1 }}
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${format.color} flex items-center justify-center shadow-lg cursor-pointer`}
              >
                <format.icon className="h-5 w-5 text-white" />
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Right Side - Content Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="relative"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-xl blur opacity-50" />
        <div className="relative bg-card/60 backdrop-blur-xl border border-orange-500/20 rounded-xl p-6 shadow-2xl h-full flex flex-col">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-xs font-semibold text-orange-300 mb-4 w-fit"
          >
            <FileText className="h-3.5 w-3.5" />
            1 → 20+ FORMATS
          </motion.div>

          {/* Title */}
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-2xl font-bold text-white mb-3"
          >
            Smart Content Hub
          </motion.h3>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm text-gray-300 leading-relaxed mb-6"
          >
            Transform 1 piece of content into 20+ formats automatically. Each version optimized for its platform.
          </motion.p>

          {/* Feature List */}
          <div className="space-y-3 mb-6 flex-1">
            {[
              'Platform-optimized formatting',
              'Brand voice maintained across all',
              'Ready to publish immediately',
              'Automatic version control'
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="flex items-start gap-2 text-sm text-gray-300"
              >
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-orange-500/50 transition-all w-full justify-center"
          >
            Explore Content Hub
            <span>→</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
