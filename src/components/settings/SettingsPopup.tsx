import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSettings } from '@/contexts/SettingsContext';
import { MinimalAPISettings } from './MinimalAPISettings';
import { NotificationSettings } from './NotificationSettings';
import { FormatPromptSettings } from './FormatPromptSettings';
import { motion } from 'framer-motion';
import { Settings, Zap, Bell, MessageSquare } from 'lucide-react';

export const SettingsPopup = () => {
  const { isOpen, activeTab, closeSettings, setActiveTab } = useSettings();

  const tabs = [
    {
      id: 'api',
      label: 'API Settings',
      icon: <Zap className="h-4 w-4" />,
      description: 'Configure AI providers and API keys',
      component: <MinimalAPISettings />
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="h-4 w-4" />,
      description: 'Manage notification preferences',
      component: <NotificationSettings />
    },
    {
      id: 'promptTemplates',
      label: 'Format Prompts',
      icon: <MessageSquare className="h-4 w-4" />,
      description: 'Customize prompt templates',
      component: <FormatPromptSettings />
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={closeSettings}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex h-[calc(90vh-80px)]">
          {/* Sidebar Tabs */}
          <div className="w-64 bg-muted/30 border-r flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="flex-1">
              <TabsList className="flex-col h-auto gap-2 bg-transparent p-4 justify-start">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="w-full justify-start data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <motion.div 
                      className="flex items-center gap-3 w-full text-left"
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex-shrink-0">
                        {tab.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {tab.label}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {tab.description}
                        </div>
                      </div>
                    </motion.div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              {tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="mt-0 h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 h-full"
                  >
                    {tab.component}
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};