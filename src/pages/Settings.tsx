
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileSettings } from '@/components/settings';
import { APISettings } from '@/components/settings';
import { NotificationSettings } from '@/components/settings';
import { AdvancedSettings } from '@/components/settings';
import { ExportSettings } from '@/components/settings';
import { Helmet } from 'react-helmet-async';
import { SettingsLayout } from '@/components/layout/SettingsLayout';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Settings() {
  const { loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract tab from URL path
  const getTabFromPath = () => {
    const path = location.pathname.split('/');
    return path.length > 2 ? path[2] : "profile";
  };
  
  const [activeTab, setActiveTab] = useState(getTabFromPath());
  
  // Update tab when location changes
  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location]);
  
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
    navigate(`/settings/${tab}`);
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
          <h2 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Settings</h2>
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
