
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileSettings } from '@/components/settings';
import { APISettings } from '@/components/settings';
import { NotificationSettings } from '@/components/settings';
import { AdvancedSettings } from '@/components/settings';
import { BillingSettings } from '@/components/settings';
import { ExportSettings } from '@/components/settings';
import { AppearanceSettings } from '@/components/settings';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';

export default function Settings() {
  const { loading } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-primary"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Settings | ContentRocketForge</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="space-y-0.5 mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <Card>
              <TabsList className="flex flex-col h-full w-full bg-transparent space-y-1 p-2">
                <TabsTrigger
                  value="profile"
                  className={`justify-start ${activeTab === "profile" ? "bg-muted" : ""}`}
                  onClick={() => setActiveTab("profile")}
                >
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="api"
                  className={`justify-start ${activeTab === "api" ? "bg-muted" : ""}`}
                  onClick={() => setActiveTab("api")}
                >
                  API Settings
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className={`justify-start ${activeTab === "notifications" ? "bg-muted" : ""}`}
                  onClick={() => setActiveTab("notifications")}
                >
                  Notifications
                </TabsTrigger>
                <TabsTrigger
                  value="appearance"
                  className={`justify-start ${activeTab === "appearance" ? "bg-muted" : ""}`}
                  onClick={() => setActiveTab("appearance")}
                >
                  Appearance
                </TabsTrigger>
                <TabsTrigger
                  value="billing"
                  className={`justify-start ${activeTab === "billing" ? "bg-muted" : ""}`}
                  onClick={() => setActiveTab("billing")}
                >
                  Billing
                </TabsTrigger>
                <TabsTrigger
                  value="export"
                  className={`justify-start ${activeTab === "export" ? "bg-muted" : ""}`}
                  onClick={() => setActiveTab("export")}
                >
                  Export
                </TabsTrigger>
                <TabsTrigger
                  value="advanced"
                  className={`justify-start ${activeTab === "advanced" ? "bg-muted" : ""}`}
                  onClick={() => setActiveTab("advanced")}
                >
                  Advanced
                </TabsTrigger>
              </TabsList>
            </Card>
          </aside>
          
          <div className="flex-1 lg:max-w-3xl">
            <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="profile" className="space-y-6">
                <ProfileSettings />
              </TabsContent>
              <TabsContent value="api" className="space-y-6">
                <APISettings />
              </TabsContent>
              <TabsContent value="notifications" className="space-y-6">
                <NotificationSettings />
              </TabsContent>
              <TabsContent value="appearance" className="space-y-6">
                <AppearanceSettings />
              </TabsContent>
              <TabsContent value="billing" className="space-y-6">
                <BillingSettings />
              </TabsContent>
              <TabsContent value="export" className="space-y-6">
                <ExportSettings />
              </TabsContent>
              <TabsContent value="advanced" className="space-y-6">
                <AdvancedSettings />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
