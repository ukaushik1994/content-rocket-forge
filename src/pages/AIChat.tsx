
import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { EnhancedChatInterface } from '@/components/ai-chat/EnhancedChatInterface';

const AIChat = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-neon-purple/5 via-transparent to-neon-blue/5" />
        <motion.div 
          className="absolute top-[20%] left-[10%] w-[600px] h-[600px] rounded-full bg-neon-blue opacity-[0.02] blur-[120px]"
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-neon-purple opacity-[0.02] blur-[120px]"
          animate={{ 
            x: [0, -80, 0],
            y: [0, -60, 0],
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <Navbar />
      
      <motion.main 
        className="flex-1 flex overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="flex-1 flex flex-col min-w-0">
          <EnhancedChatInterface />
        </div>
      </motion.main>
    </div>
  );
};

export default AIChat;
