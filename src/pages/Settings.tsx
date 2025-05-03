
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
import { SettingsLayout } from '@/components/layout/SettingsLayout';

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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Render the appropriate content based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSettings />;
      case "api":
        return <APISettings />;
      case "notifications":
        return <NotificationSettings />;
      case "appearance":
        return <AppearanceSettings />;
      case "billing":
        return <BillingSettings />;
      case "export":
        return <ExportSettings />;
      case "advanced":
        return <AdvancedSettings />;
      default:
        return <ProfileSettings />;
    }
  };

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

        <SettingsLayout
          activeTab={activeTab}
          onTabChange={handleTabChange}
        >
          {renderTabContent()}
        </SettingsLayout>
      </main>
    </div>
  );
}
