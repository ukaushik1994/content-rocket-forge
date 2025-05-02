
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { APISettings } from '@/components/settings/APISettings';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { AppearanceSettings } from '@/components/settings/AppearanceSettings';
import { ExportSettings } from '@/components/settings/ExportSettings';
import { BillingSettings } from '@/components/settings/BillingSettings';
import { AdvancedSettings } from '@/components/settings/AdvancedSettings';
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

const Settings = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gradient">Settings</h1>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-64 space-y-6">
              <Tabs defaultValue="profile" orientation="vertical" className="w-full">
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
              <Tabs defaultValue="profile">
                <TabsContent value="profile" className="space-y-6">
                  <ProfileSettings />
                </TabsContent>
                
                <TabsContent value="api">
                  <APISettings />
                </TabsContent>
                
                <TabsContent value="notifications" className="space-y-6">
                  <NotificationSettings />
                </TabsContent>
                
                <TabsContent value="appearance" className="space-y-6">
                  <AppearanceSettings />
                </TabsContent>
                
                <TabsContent value="export" className="space-y-6">
                  <ExportSettings />
                </TabsContent>
                
                <TabsContent value="billing" className="space-y-6">
                  <BillingSettings />
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-6">
                  <AdvancedSettings />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
