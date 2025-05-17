
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import { SettingsLayout } from '@/components/layout/SettingsLayout';
import { APISettings } from '@/components/settings/APISettings';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { AppearanceSettings } from '@/components/settings/AppearanceSettings';
import { BillingSettings } from '@/components/settings/BillingSettings';
import { AdvancedSettings } from '@/components/settings/AdvancedSettings';
import { ExportSettings } from '@/components/settings/ExportSettings';

const SettingsPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Settings | SEO Platform</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-8">
        <SettingsLayout>
          <APISettings />
          <ProfileSettings />
          <NotificationSettings />
          <AppearanceSettings />
          <BillingSettings />
          <ExportSettings />
          <AdvancedSettings />
        </SettingsLayout>
      </main>
    </div>
  );
};

export default SettingsPage;
