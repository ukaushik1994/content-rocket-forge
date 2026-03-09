import React from 'react';
import { motion } from 'framer-motion';

import { OpenRouterSettings } from '@/components/ai-chat/OpenRouterSettings';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Brain, Zap, Shield } from 'lucide-react';

const AISettings = () => {
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
          className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-neon-orange opacity-[0.02] blur-[120px]"
          animate={{ 
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <Navbar />
      
      <motion.main 
        className="flex-1 pt-24 p-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 mb-6"
            >
              <Settings className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              AI Settings
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto">
              Configure your AI providers, models, and preferences for enhanced content creation and analysis.
            </p>
          </div>

          {/* Settings Grid */}
          <div className="grid gap-6">
            {/* OpenRouter Configuration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <OpenRouterSettings />
            </motion.div>

            {/* AI Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Card className="p-6 bg-white/5 border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">AI Preferences</h3>
                    <p className="text-sm text-white/60">Customize AI behavior and response style</p>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 ml-auto">
                    Coming Soon
                  </Badge>
                </div>
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 text-white/30 mx-auto mb-3" />
                  <p className="text-white/60 text-sm">
                    Advanced AI customization options will be available soon
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Security Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Card className="p-6 bg-white/5 border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-white/10">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Security & Privacy</h3>
                    <p className="text-sm text-white/60">Manage data protection and API key security</p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 ml-auto">
                    <Shield className="h-3 w-3 mr-1" />
                    Secured
                  </Badge>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-green-300">API Key Encryption</p>
                      <p className="text-xs text-green-400/70">Your API keys are encrypted at rest</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-blue-300">Data Processing</p>
                      <p className="text-xs text-blue-400/70">Conversations are processed securely</p>
                    </div>
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                      Enabled
                    </Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default AISettings;