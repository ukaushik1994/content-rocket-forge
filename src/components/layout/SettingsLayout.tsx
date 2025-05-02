
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

interface SettingsLayoutProps {
  defaultTab?: string;
  children: React.ReactNode;
}

export function SettingsLayout({ defaultTab = "profile", children }: SettingsLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-64 space-y-6">
        <Tabs defaultValue={defaultTab} orientation="vertical" className="w-full">
          <TabsList className="bg-secondary/30 flex flex-col h-auto space-y-1 rounded-xl p-2">
            <TabsTrigger value="profile" className="justify-start gap-2 px-3">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="api" className="justify-start gap-2 px-3">
              <Key className="h-4 w-4" />
              API Settings
            </TabsTrigger>
            <TabsTrigger value="notifications" className="justify-start gap-2 px-3">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="justify-start gap-2 px-3">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="export" className="justify-start gap-2 px-3">
              <Download className="h-4 w-4" />
              Export Data
            </TabsTrigger>
            <TabsTrigger value="billing" className="justify-start gap-2 px-3">
              <CreditCard className="h-4 w-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="advanced" className="justify-start gap-2 px-3">
              <SettingsIcon className="h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex-1 space-y-6">
        {children}
      </div>
    </div>
  );
}
