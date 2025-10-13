
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { EnhancedChatInterface } from '@/components/ai-chat/EnhancedChatInterface';
import { EnhancedChatIntegration } from '@/components/ai-chat/EnhancedChatIntegration';

const AIChat = () => {
  const [showIntegration, setShowIntegration] = useState(false);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.8 }
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Interactive Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-32 right-32 w-80 h-80 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, -30, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-32 left-32 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
            x: [0, 40, 0],
            y: [0, -25, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Floating particles */}
        {Array.from({ length: 20 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              y: [0, -100],
            }}
            transition={{
              duration: Math.random() * 4 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <Navbar />
      
      <motion.main 
        className="flex-1 flex overflow-hidden pt-20"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="flex-1 flex flex-col min-w-0">
          <EnhancedChatInterface />
        </div>
        
        {/* Phase 4 Integration Overlay */}
        <EnhancedChatIntegration 
          isVisible={showIntegration}
          onClose={() => setShowIntegration(false)}
        />
      </motion.main>
    </motion.div>
  );
};

export default AIChat;
