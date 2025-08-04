
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
    <div className="flex w-full min-h-screen">
      {/* Fixed Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-80 z-40 border-r border-white/10 bg-gradient-to-b from-background/95 via-background/90 to-neon-purple/5 backdrop-blur-xl">
        <div className="p-6 h-full">
          {/* Sidebar Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-neon-purple/30 blur-lg"></div>
                <div className="relative rounded-xl bg-gradient-to-br from-neon-purple/30 to-neon-blue/20 p-3 border border-white/20">
                  <SettingsIcon className="h-6 w-6 text-neon-purple" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gradient">Settings Hub</h2>
                <p className="text-xs text-muted-foreground">Customize your experience</p>
              </div>
            </div>
          </motion.div>

          <Tabs 
            value={activeTab} 
            onValueChange={handleValueChange}
            orientation="vertical"
            className="h-full"
          >
            <TabsList className="flex flex-col h-auto w-full bg-transparent space-y-2 p-0">
              {tabs.map((tab, index) => (
                <motion.div
                  key={tab.value}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="w-full"
                >
                  <TabsTrigger
                    value={tab.value}
                    className="group relative justify-start gap-4 w-full py-4 px-5 h-auto data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple/20 data-[state=active]:to-neon-blue/10 data-[state=active]:text-neon-purple hover:bg-glass/20 transition-all duration-300 rounded-xl border border-transparent data-[state=active]:border-neon-purple/30 data-[state=active]:shadow-lg data-[state=active]:shadow-neon-purple/20"
                  >
                    <div className="relative">
                      <tab.icon className="h-5 w-5 group-data-[state=active]:animate-pulse" />
                      <div className="absolute inset-0 rounded-full bg-neon-purple/30 blur-md opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-sm block">{tab.label}</span>
                      <span className="text-xs text-muted-foreground group-data-[state=active]:text-neon-purple/70 transition-colors">
                        {getTabDescription(tab.value)}
                      </span>
                    </div>
                    <div className="ml-auto opacity-0 group-data-[state=active]:opacity-100 transition-opacity">
                      <div className="w-2 h-2 rounded-full bg-neon-purple animate-pulse"></div>
                    </div>
                  </TabsTrigger>
                </motion.div>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <div className="flex-1 ml-80 min-h-screen">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="w-full p-8"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );

  function getTabDescription(tabValue: string): string {
    const descriptions: Record<string, string> = {
      profile: "Personal info & avatar",
      api: "Integrations & keys", 
      notifications: "Alerts & updates",
      appearance: "Theme & layout",
      promptTemplates: "Content templates",
      billing: "Plans & payments",
      export: "Data & backups",
      advanced: "System & debug"
    };
    return descriptions[tabValue] || "Configure settings";
  }
}
