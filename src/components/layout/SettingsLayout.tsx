
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Key, 
  User, 
  Bell, 
  Settings as SettingsIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Link, useLocation } from 'react-router-dom';

interface SettingsLayoutProps {
  children: React.ReactNode;
  onTabChange?: (tab: string) => void;
  activeTab: string;
}

export function SettingsLayout({ children, onTabChange, activeTab }: SettingsLayoutProps) {
  const location = useLocation();
  
  const handleValueChange = (value: string) => {
    if (onTabChange) {
      onTabChange(value);
    }
  };

  return (
    <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
      <aside className="-mx-4 lg:w-1/5">
        <Tabs 
          value={activeTab} 
          onValueChange={handleValueChange}
          orientation="vertical"
          className="h-full"
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/30 shadow-lg">
            <TabsList className="flex flex-col h-full w-full bg-transparent space-y-1 p-2">
              <TabsTrigger
                value="profile"
                className="justify-start gap-2 w-full"
              >
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="api"
                className="justify-start gap-2 w-full"
              >
                <Key className="h-4 w-4" />
                API Settings
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="justify-start gap-2 w-full"
              >
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="export"
                className="justify-start gap-2 w-full"
              >
                <Download className="h-4 w-4" />
                Export
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="justify-start gap-2 w-full"
              >
                <SettingsIcon className="h-4 w-4" />
                Advanced
              </TabsTrigger>
            </TabsList>
          </Card>
        </Tabs>
      </aside>
      
      <div className="flex-1 lg:max-w-3xl">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <Card className="p-6 border-border/30 shadow-lg bg-card/50 backdrop-blur-sm">
            {children}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
