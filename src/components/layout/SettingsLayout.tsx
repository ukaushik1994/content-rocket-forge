
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { User, Key, Bell, Palette, FileText, CreditCard, FileOutput, Settings, BookText } from 'lucide-react';

interface SettingsLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange 
}) => {
  const tabItems = [
    { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { id: 'api', label: 'API Keys', icon: <Key className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="h-4 w-4" /> },
    { id: 'promptTemplates', label: 'Prompt Templates', icon: <FileText className="h-4 w-4" /> },
    { id: 'brandGuidelines', label: 'Brand Guidelines', icon: <BookText className="h-4 w-4" /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'export', label: 'Export', icon: <FileOutput className="h-4 w-4" /> },
    { id: 'advanced', label: 'Advanced', icon: <Settings className="h-4 w-4" /> },
  ];
  
  return (
    <Tabs
      defaultValue={activeTab}
      value={activeTab}
      onValueChange={onTabChange}
      className="space-y-4"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sidebar */}
        <Card className="p-2 lg:min-w-[240px] lg:max-w-[240px] flex-shrink-0">
          <TabsList className="flex flex-col h-auto p-0 bg-transparent">
            {tabItems.map(item => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                className="justify-start py-2 px-3 w-full rounded-md text-sm"
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </Card>

        {/* Main Content */}
        <div className="flex-1 max-w-full">
          <TabsContent value={activeTab} className="m-0 outline-none">
            {children}
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
};
