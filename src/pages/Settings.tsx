
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { APISettings } from '@/components/settings/APISettings';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { AppearanceSettings } from '@/components/settings/AppearanceSettings';
import { ExportSettings } from '@/components/settings/ExportSettings';
import { BillingSettings } from '@/components/settings/BillingSettings';
import { AdvancedSettings } from '@/components/settings/AdvancedSettings';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { SettingsLayout } from '@/components/layout/SettingsLayout';
import { motion } from 'framer-motion';

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Navbar />
      
      <motion.main 
        className="flex-1 container py-8"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="space-y-6">
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold text-gradient">Settings</h1>
          </motion.div>
          
          <SettingsLayout activeTab={activeTab} onTabChange={handleTabChange}>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsContent value="profile" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <ProfileSettings />
              </TabsContent>
              
              <TabsContent value="api" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <APISettings />
              </TabsContent>
              
              <TabsContent value="notifications" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <NotificationSettings />
              </TabsContent>
              
              <TabsContent value="appearance" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <AppearanceSettings />
              </TabsContent>
              
              <TabsContent value="export" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <ExportSettings />
              </TabsContent>
              
              <TabsContent value="billing" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <BillingSettings />
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <AdvancedSettings />
              </TabsContent>
            </Tabs>
          </SettingsLayout>
        </div>
      </motion.main>
    </motion.div>
  );
};

export default Settings;
