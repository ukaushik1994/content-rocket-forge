
import React from 'react';
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

const Settings = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gradient">Settings</h1>
          </div>
          
          <SettingsLayout>
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
          </SettingsLayout>
        </div>
      </main>
    </div>
  );
};

export default Settings;
