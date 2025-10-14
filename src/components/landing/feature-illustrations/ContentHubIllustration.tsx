import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Twitter, Video, Image, Newspaper, Mail, MessageCircle, CheckCircle2 } from 'lucide-react';

export const ContentHubIllustration = () => {
  const contentFormats = [
    { Icon: Twitter, label: 'Tweet', angle: 0, delay: 0, color: 'from-neon-blue to-primary' },
    { Icon: Video, label: 'Video', angle: 45, delay: 0.2, color: 'from-neon-pink to-neon-blue' },
    { Icon: Image, label: 'Image', angle: 90, delay: 0.4, color: 'from-neon-orange to-neon-pink' },
    { Icon: Newspaper, label: 'Article', angle: 135, delay: 0.6, color: 'from-primary to-neon-orange' },
    { Icon: Mail, label: 'Email', angle: 180, delay: 0.8, color: 'from-neon-blue to-neon-pink' },
    { Icon: MessageCircle, label: 'Post', angle: 225, delay: 1.0, color: 'from-neon-pink to-primary' }
  ];

  const floatingFiles = [
    { x: 10, y: 15, delay: 0, rotation: -15 },
    { x: 85, y: 20, delay: 0.5, rotation: 15 },
    { x: 15, y: 80, delay: 1, rotation: 10 },
    { x: 80, y: 75, delay: 1.5, rotation: -10 }
  ];

  const versions = [
    { version: 'v1', status: 'completed', delay: 0 },
    { version: 'v2', status: 'completed', delay: 0.3 },
    { version: 'v3', status: 'in-progress', delay: 0.6 }
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center p-8">
      
      {/* Central Document */}
      <motion.div
        className="relative z-20"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            rotateY: [0, 10, -10, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="bg-gradient-to-r from-neon-orange to-primary p-8 rounded-2xl shadow-2xl"
        >
          <FileText className="h-20 w-20 text-white" />
        </motion.div>

        {/* Pulse effect */}
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-2xl border-2 border-primary/30"
            animate={{ 
              scale: [1, 1.5, 2],
              opacity: [0.6, 0.3, 0]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              delay: i * 1.5,
              ease: "easeOut" 
            }}
          />
        ))}
      </motion.div>

      {/* Radiating Content Formats */}
      {contentFormats.map(({ Icon, label, angle, delay, color }, index) => {
        const radius = 180;
        const radian = (angle * Math.PI) / 180;
        const x = Math.cos(radian) * radius;
        const y = Math.sin(radian) * radius;

        return (
          <React.Fragment key={index}>
            {/* Connection Line */}
            <motion.div
              className="absolute left-1/2 top-1/2 origin-left"
              style={{ 
                width: radius,
                height: 2,
                rotate: `${angle}deg`,
                transformOrigin: 'left center'
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 0.3 }}
              transition={{ 
                duration: 0.6, 
                delay: delay,
                repeat: Infinity,
                repeatDelay: 4
              }}
            >
              <div className="w-full h-full bg-gradient-to-r from-primary/50 to-transparent" />
            </motion.div>

            {/* Content Format Card */}
            <motion.div
              className="absolute"
              style={{ 
                left: '50%',
                top: '50%',
                x: x,
                y: y,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: delay,
                repeat: Infinity,
                repeatDelay: 4
              }}
            >
              <motion.div
                className={`bg-gradient-to-r ${color} p-0.5 rounded-lg shadow-xl`}
                animate={{ 
                  y: [0, -8, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  delay: delay + 1,
                  ease: "easeInOut" 
                }}
              >
                <div className="bg-card rounded-lg p-3 flex flex-col items-center gap-1">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-xs font-medium">{label}</span>
                </div>
              </motion.div>
            </motion.div>
          </React.Fragment>
        );
      })}

      {/* Version Control Panel */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-card/80 backdrop-blur-sm border border-primary/30 rounded-xl p-4 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.5 }}
      >
        <p className="text-xs font-semibold mb-3 text-center">Version History</p>
        <div className="flex gap-3">
          {versions.map((ver, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center gap-1"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: ver.delay + 1.8 }}
            >
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  ver.status === 'completed' 
                    ? 'bg-primary text-white' 
                    : 'bg-primary/20 text-primary'
                }`}
                animate={ver.status === 'in-progress' ? { 
                  scale: [1, 1.1, 1]
                } : {}}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity
                }}
              >
                {ver.status === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-bold">{ver.version}</span>
                )}
              </motion.div>
              <span className="text-xs text-muted-foreground">{ver.version}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Floating File Icons */}
      {floatingFiles.map((file, index) => (
        <motion.div
          key={index}
          className="absolute pointer-events-none"
          style={{ 
            left: `${file.x}%`, 
            top: `${file.y}%`,
            rotate: file.rotation
          }}
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.2, 0.5, 0.2],
            rotate: [file.rotation, file.rotation + 10, file.rotation]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            delay: file.delay,
            ease: "easeInOut" 
          }}
        >
          <div className="bg-card/40 backdrop-blur-sm border border-primary/20 p-2 rounded-lg">
            <FileText className="h-4 w-4 text-primary/60" />
          </div>
        </motion.div>
      ))}

      {/* Repurposing Counter */}
      <motion.div
        className="absolute top-8 right-8 bg-gradient-to-r from-neon-orange to-primary text-white px-4 py-2 rounded-full shadow-xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 2 }}
      >
        <motion.span
          className="text-2xl font-bold"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            delay: 2.5
          }}
        >
          1 → 20+
        </motion.span>
      </motion.div>
    </div>
  );
};
