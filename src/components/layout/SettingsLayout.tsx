
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard,
  Key, 
  User, 
  Bell, 
  Palette,
  Download,
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
          <Card>
            <TabsList className="flex flex-col h-full w-full bg-transparent space-y-1 p-2">
              <TabsTrigger
                value="profile"
                className="justify-start gap-2"
              >
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="api"
                className="justify-start gap-2"
              >
                <Key className="h-4 w-4" />
                API Settings
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="justify-start gap-2"
              >
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="justify-start gap-2"
              >
                <Palette className="h-4 w-4" />
                Appearance
              </TabsTrigger>
              <TabsTrigger
                value="billing"
                className="justify-start gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Billing
              </TabsTrigger>
              <TabsTrigger
                value="export"
                className="justify-start gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="justify-start gap-2"
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
          {children}
        </motion.div>
      </div>
    </div>
  );
}
