import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSettings } from '@/contexts/SettingsContext';
import { ApiSettings } from './api/ApiSettings';
import { NotificationSettings } from './NotificationSettings';
import { FormatPromptSettings } from './FormatPromptSettings';
import { Settings, Zap, Bell, MessageSquare } from 'lucide-react';

export const SettingsPopup = () => {
  const { isOpen, activeTab, closeSettings, setActiveTab } = useSettings();

  const tabs = [
    {
      id: 'api',
      label: 'API Keys',
      icon: <Zap className="h-4 w-4" />,
      component: <ApiSettings />
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="h-4 w-4" />,
      component: <NotificationSettings />
    },
    {
      id: 'promptTemplates',
      label: 'Prompts',
      icon: <MessageSquare className="h-4 w-4" />,
      component: <FormatPromptSettings />
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={closeSettings}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex h-[calc(80vh-80px)]">
          {/* Simplified Sidebar */}
          <div className="w-48 bg-muted/20 border-r">
            <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="flex-1">
              <TabsList className="flex-col h-auto gap-1 bg-transparent p-3 justify-start w-full">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="w-full justify-start data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <div className="flex items-center gap-2 w-full">
                      {tab.icon}
                      <span className="font-medium text-sm">
                        {tab.label}
                      </span>
                    </div>
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
                  <div className="p-6 h-full">
                    {tab.component}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};