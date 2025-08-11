
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileSettings } from '@/components/settings';
import { MinimalAPISettings } from '@/components/settings/MinimalAPISettings';
import { NotificationSettings } from '@/components/settings';
import { AdvancedSettings } from '@/components/settings';
import { BillingSettings } from '@/components/settings';
import { ExportSettings } from '@/components/settings';
import { AppearanceSettings } from '@/components/settings';
import { FormatPromptSettings } from '@/components/settings';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { SettingsLayout } from '@/components/layout/SettingsLayout';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Sparkles } from 'lucide-react';
import SettingsTopBar from '@/components/settings/SettingsTopBar';
export default function Settings() {
  const { loading } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-neon-purple/30 border-t-neon-purple animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <SettingsIcon className="h-8 w-8 text-neon-purple animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Render the appropriate content based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSettings />;
      case "api":
        return <MinimalAPISettings />;
      case "notifications":
        return <NotificationSettings />;
      case "appearance":
        return <AppearanceSettings />;
      case "promptTemplates":
        return <FormatPromptSettings />;
      case "billing":
        return <BillingSettings />;
      case "export":
        return <ExportSettings />;
      case "advanced":
        return <AdvancedSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  // Animation variants
  const pageVariants = {
    initial: {
      opacity: 0
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  };
  
  const itemVariants = {
    initial: {
      y: 20,
      opacity: 0
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-background" 
      variants={pageVariants} 
      initial="initial" 
      animate="animate" 
      exit="exit"
    >
      <Helmet>
        <title>Settings | ContentRocketForge</title>
        <meta name="description" content="Manage your account settings and preferences" />
      </Helmet>
      
      <Navbar />
      
      {/* Full-width immersive hero section */}
      <section className="relative min-h-[40vh] w-full overflow-hidden bg-gradient-to-br from-neon-purple/30 via-background/90 to-neon-blue/20 border-b border-white/10">
        {/* Multi-layer animated background */}
        <div className="absolute inset-0 futuristic-grid opacity-20 bg-grid animate-pulse"></div>
        
        {/* Floating gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full blur-2xl"
              style={{
                width: Math.random() * 300 + 100,
                height: Math.random() * 300 + 100,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: i % 3 === 0 
                  ? 'linear-gradient(45deg, rgba(155, 135, 245, 0.4), rgba(217, 70, 239, 0.2))' 
                  : i % 3 === 1 
                  ? 'linear-gradient(45deg, rgba(51, 195, 240, 0.3), rgba(155, 135, 245, 0.2))'
                  : 'linear-gradient(45deg, rgba(217, 70, 239, 0.3), rgba(249, 115, 22, 0.2))',
              }}
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: Math.random() * 20 + 20,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Static mesh background */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(155, 135, 245, 0.1) 50%, transparent 70%)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Content container */}
<div className="relative z-10 container mx-auto px-8 py-16 lg:py-24">
          <div className="mb-6">
            <SettingsTopBar />
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              variants={itemVariants}
              className="space-y-8"
            >
              <motion.div variants={itemVariants} className="inline-block">
                <div className="flex items-center space-x-3 bg-gradient-to-r from-neon-purple/30 to-neon-blue/20 rounded-full px-6 py-3 border border-white/20 backdrop-blur-xl">
                  <Sparkles className="h-5 w-5 text-neon-purple animate-pulse" />
                  <span className="text-neon-purple font-semibold tracking-wide">ADVANCED CONFIGURATION</span>
                </div>
              </motion.div>
              
              <motion.h1 
                variants={itemVariants} 
                className="text-5xl lg:text-7xl font-black leading-tight"
              >
                <span className="bg-gradient-to-r from-white via-neon-purple to-neon-blue bg-clip-text text-transparent animate-gradient-shift bg-300%">
                  Transform
                </span>
                <br />
                <span className="text-white">Your Workflow</span>
              </motion.h1>
              
              <motion.p 
                variants={itemVariants} 
                className="text-xl text-muted-foreground leading-relaxed max-w-lg"
              >
                Unlock the full potential of your content creation with advanced API integrations, personalized settings, and intelligent automation.
              </motion.p>

              <motion.div 
                variants={itemVariants}
                className="flex flex-wrap gap-4 pt-4"
              >
                {['8 Categories', 'Real-time Status', 'Auto-sync', 'Cloud Backup'].map((feature, index) => (
                  <motion.div
                    key={feature}
                    className="flex items-center space-x-2 bg-glass/20 rounded-full px-4 py-2 border border-white/10 backdrop-blur-sm"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-neon-purple animate-pulse"></div>
                    <span className="text-sm font-medium text-white/90">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Stats section */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-2 gap-6"
            >
              {[
                { number: '8', label: 'Settings Categories', icon: SettingsIcon },
                { number: '25+', label: 'API Integrations', icon: Sparkles },
                { number: '99.9%', label: 'Uptime Guaranteed', icon: SettingsIcon },
                { number: '24/7', label: 'Real-time Sync', icon: Sparkles },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="relative group"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 100 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 to-neon-blue/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative bg-glass/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center group-hover:bg-glass/20 transition-all duration-300">
                    <stat.icon className="h-8 w-8 text-neon-purple mx-auto mb-3 animate-float" />
                    <h3 className="text-3xl lg:text-4xl font-bold text-gradient mb-2">{stat.number}</h3>
                    <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Full-width main content */}
      <main className="w-full">
        <motion.div variants={itemVariants} className="w-full">
          <SettingsLayout
            activeTab={activeTab}
            onTabChange={handleTabChange}
          >
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {renderTabContent()}
            </motion.div>
          </SettingsLayout>
        </motion.div>
      </main>
    </motion.div>
  );
}
