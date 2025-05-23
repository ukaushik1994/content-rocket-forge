
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard,
  Key, 
  User, 
  Bell, 
  Palette,
  Download,
  Settings as SettingsIcon,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface SettingsLayoutProps {
  children: React.ReactNode;
  onTabChange?: (tab: string) => void;
  activeTab: string;
}

export function SettingsLayout({ children, onTabChange, activeTab }: SettingsLayoutProps) {
  const handleValueChange = (value: string) => {
    if (onTabChange) {
      onTabChange(value);
    }
  };

  const tabs = [
    { value: "profile", label: "Profile", icon: User },
    { value: "api", label: "API Settings", icon: Key },
    { value: "notifications", label: "Notifications", icon: Bell },
    { value: "appearance", label: "Appearance", icon: Palette },
    { value: "promptTemplates", label: "Format Prompts", icon: FileText },
    { value: "billing", label: "Billing", icon: CreditCard },
    { value: "export", label: "Export", icon: Download },
    { value: "advanced", label: "Advanced", icon: SettingsIcon },
  ];

  return (
    <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
      <aside className="-mx-4 lg:w-1/5">
        <Tabs 
          value={activeTab} 
          onValueChange={handleValueChange}
          orientation="vertical"
          className="h-full"
        >
          <Card className="glass-panel bg-glass border border-white/10 backdrop-blur-sm">
            <TabsList className="flex flex-col h-full w-full bg-transparent space-y-1 p-3">
              {tabs.map((tab, index) => (
                <motion.div
                  key={tab.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="w-full"
                >
                  <TabsTrigger
                    value={tab.value}
                    className="justify-start gap-3 w-full py-3 px-4 data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple hover:bg-accent/50 transition-all duration-200"
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="font-medium">{tab.label}</span>
                  </TabsTrigger>
                </motion.div>
              ))}
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
