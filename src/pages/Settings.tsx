
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileSettings } from '@/components/settings';
import { APISettings } from '@/components/settings';
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
        return <APISettings />;
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
      
      <main className="flex-1 container py-8">
        {/* Hero Section */}
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-neon-purple/20 via-background to-neon-blue/10 p-8 mb-8 border border-white/10"
        >
          {/* Enhanced background elements */}
          <div className="absolute inset-0 futuristic-grid opacity-10 z-0" />
          
          {/* Animated gradient background */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-neon-blue/5 z-0"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              background: [
                "linear-gradient(to bottom right, rgba(155, 135, 245, 0.1), rgba(51, 195, 240, 0.05))",
                "linear-gradient(to bottom right, rgba(155, 135, 245, 0.15), rgba(51, 195, 240, 0.07))",
                "linear-gradient(to bottom right, rgba(155, 135, 245, 0.1), rgba(51, 195, 240, 0.05))"
              ]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              repeatType: "reverse" 
            }}
          />
          
          {/* Animated particles */}
          <motion.div 
            className="absolute inset-0 z-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-neon-blue/20 blur-md"
                style={{
                  width: Math.random() * 100 + 50,
                  height: Math.random() * 100 + 50,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  x: [0, Math.random() * 50 - 25],
                  y: [0, Math.random() * 50 - 25],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: Math.random() * 10 + 15,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
              <div className="space-y-4 max-w-2xl">
                <motion.div variants={itemVariants} className="inline-block">
                  <div className="flex items-center space-x-2 bg-neon-purple/20 rounded-full px-3 py-1 text-sm font-medium text-neon-purple">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Account Configuration</span>
                  </div>
                </motion.div>
                
                <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-gradient">
                  Personalize Your Content Experience
                </motion.h1>
                
                <motion.p variants={itemVariants} className="text-muted-foreground text-lg">
                  Configure your account settings, API integrations, and preferences to optimize your content creation workflow.
                </motion.p>
              </div>
              
              <motion.div 
                variants={itemVariants} 
                className="bg-glass text-center p-4 rounded-xl border border-white/10 min-w-[140px] backdrop-blur-sm"
              >
                <h3 className="text-3xl md:text-4xl font-bold text-gradient mb-1">8</h3>
                <p className="text-muted-foreground text-sm">
                  Settings Categories
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
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
