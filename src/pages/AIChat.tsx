
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { EnhancedChatInterface } from '@/components/ai-chat/EnhancedChatInterface';
import { EnhancedChatIntegration } from '@/components/ai-chat/EnhancedChatIntegration';
import { useSettings } from '@/contexts/SettingsContext';

const AIChat = () => {
  const [showIntegration, setShowIntegration] = useState(false);
  const { openSettings } = useSettings();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Handle join parameter for collaboration
  useEffect(() => {
    const joinId = searchParams.get('join');
    if (joinId) {
      console.log('Joining conversation:', joinId);
      // The chat interface will handle loading the conversation
    }
  }, [searchParams]);
  
  // Listen for settings event from sidebar
  useEffect(() => {
    const handleOpenSettings = (event: CustomEvent) => {
      const tab = event.detail?.tab || 'api';
      openSettings(tab);
    };
    
    window.addEventListener('openSettings', handleOpenSettings as EventListener);
    return () => window.removeEventListener('openSettings', handleOpenSettings as EventListener);
  }, [openSettings]);
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
      {/* Refined Background Effects - Calmer, more premium */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-32 right-32 w-80 h-80 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.35, 0.2],
            x: [0, -20, 0],
            y: [0, 15, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-32 left-32 w-96 h-96 bg-gradient-to-r from-purple-500/8 to-pink-500/8 rounded-full blur-3xl"
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.25, 0.4, 0.25],
            x: [0, 25, 0],
            y: [0, -15, 0]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Refined floating particles - fewer, subtler */}
        {Array.from({ length: 8 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/25 rounded-full"
            style={{
              left: `${(i * 12) + 10}%`,
              top: `${(i * 11) + 5}%`,
            }}
            animate={{
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0],
              y: [0, -80],
            }}
            transition={{
              duration: 6 + (i * 0.5),
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      <motion.main 
        className="flex-1 flex overflow-hidden pt-4"
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
