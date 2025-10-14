import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Twitter, Video, Image, Newspaper, Mail, MessageCircle, CheckCircle2, Sparkles } from 'lucide-react';

export const ContentHubIllustration = () => {
  const contentFormats = [
    { Icon: Twitter, label: 'Tweet', gradient: 'from-neon-blue to-neon-pink', delay: 0.8 },
    { Icon: Video, label: 'Video', gradient: 'from-neon-pink to-primary', delay: 0.9 },
    { Icon: Image, label: 'Image', gradient: 'from-primary to-neon-orange', delay: 1.0 },
    { Icon: Newspaper, label: 'Blog', gradient: 'from-neon-orange to-neon-pink', delay: 1.1 },
    { Icon: Mail, label: 'Email', gradient: 'from-neon-blue to-primary', delay: 1.2 },
    { Icon: MessageCircle, label: 'Post', gradient: 'from-neon-pink to-neon-blue', delay: 1.3 }
  ];

  const versions = [
    { version: 'v1', status: 'completed', delay: 0 },
    { version: 'v2', status: 'completed', delay: 0.2 },
    { version: 'v3', status: 'in-progress', delay: 0.4 }
  ];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
      
      {/* Top Document Icon */}
      <motion.div
        className="relative z-20 mb-8"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="w-28 h-28 rounded-full bg-gradient-to-r from-neon-orange to-neon-pink flex items-center justify-center shadow-2xl"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <FileText className="h-14 w-14 text-white" />
        </motion.div>

        {/* Pulsing glow */}
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--neon-orange) / 0.4) 0%, transparent 70%)',
            }}
            animate={{ 
              scale: [1, 1.6, 2],
              opacity: [0.6, 0.3, 0]
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity,
              delay: i * 1.2,
              ease: "easeOut" 
            }}
          />
        ))}
      </motion.div>

      {/* Transformation Pipeline */}
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between gap-4 mb-8">
          
          {/* Original Content Card */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-blue to-neon-pink rounded-xl blur opacity-30" />
              
              <div className="relative bg-card/80 backdrop-blur-xl border border-primary/20 rounded-xl p-4 shadow-2xl">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-blue to-neon-pink flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-semibold">Original</span>
                  <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-primary/20">
                    1 Article
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Processing */}
          <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <motion.div
              className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-neon-orange flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-6 w-6 text-white" />
            </motion.div>
            
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    delay: i * 0.3
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Repurposed Content Card */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-neon-orange rounded-xl blur opacity-30" />
              
              <div className="relative bg-card/80 backdrop-blur-xl border border-primary/20 rounded-xl p-3 shadow-2xl">
                <div className="grid grid-cols-3 gap-1.5">
                  {contentFormats.map((format, index) => (
                    <motion.div
                      key={index}
                      className={`aspect-square rounded-lg bg-gradient-to-r ${format.gradient} p-0.5`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: format.delay
                      }}
                    >
                      <div className="w-full h-full bg-card/90 rounded-md flex items-center justify-center">
                        <format.Icon className="h-3 w-3 text-primary" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-orange to-neon-pink rounded-xl blur opacity-30" />
            
            <div className="relative bg-card/80 backdrop-blur-xl border border-primary/20 rounded-xl p-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="text-2xl font-bold bg-gradient-to-r from-neon-orange to-neon-pink bg-clip-text text-transparent"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    20+
                  </motion.div>
                  <div>
                    <p className="text-sm font-semibold">Formats Created</p>
                    <p className="text-xs text-muted-foreground">From 1 source</p>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.7 + i * 0.1 }}
                    >
                      <CheckCircle2 className="h-4 w-4 text-neon-orange" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Version History Panel */}
        <motion.div
          className="mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.8 }}
        >
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-blue to-neon-pink rounded-xl blur opacity-20" />
            
            <div className="relative bg-card/60 backdrop-blur-xl border border-primary/20 rounded-xl p-3 shadow-xl">
              <p className="text-xs font-semibold mb-2 text-center">Version History</p>
              <div className="flex justify-center gap-3">
                {versions.map((ver, index) => (
                  <motion.div
                    key={index}
                    className="flex flex-col items-center gap-1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: ver.delay + 2 }}
                  >
                    <motion.div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        ver.status === 'completed' 
                          ? 'bg-gradient-to-r from-neon-blue to-neon-pink' 
                          : 'bg-primary/20'
                      }`}
                      animate={ver.status === 'in-progress' ? { 
                        scale: [1, 1.15, 1]
                      } : {}}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity
                      }}
                    >
                      {ver.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      ) : (
                        <span className="text-xs font-bold text-primary">{ver.version}</span>
                      )}
                    </motion.div>
                    <span className="text-[10px] text-muted-foreground">{ver.version}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Transformation Counter (Top Right) */}
      <motion.div
        className="absolute top-8 right-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 2.2 }}
      >
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-orange to-neon-pink rounded-full blur opacity-60" />
          
          <div className="relative bg-gradient-to-r from-neon-orange to-neon-pink text-white px-4 py-2 rounded-full shadow-2xl">
            <motion.span
              className="text-xl font-bold"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                delay: 2.5
              }}
            >
              1 → 20+
            </motion.span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
