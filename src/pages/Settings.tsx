
import React from 'react';
import Navbar from '@/components/layout/Navbar';

const Settings = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gradient">Settings</h1>
          <div className="bg-glass rounded-lg p-6 border border-white/10">
            <p className="text-muted-foreground">
              This page is currently under development. Please check back later for account and application settings.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
