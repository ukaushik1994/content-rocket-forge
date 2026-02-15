import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplatesList } from './templates/TemplatesList';
import { CampaignsList } from './campaigns/CampaignsList';
import { EmailProviderSettings } from './settings/EmailProviderSettings';

export const EmailDashboard = () => {
  const [tab, setTab] = useState('templates');

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Email</h2>
        <p className="text-sm text-muted-foreground">Templates, campaigns, and delivery settings</p>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="templates" className="mt-4"><TemplatesList /></TabsContent>
        <TabsContent value="campaigns" className="mt-4"><CampaignsList /></TabsContent>
        <TabsContent value="settings" className="mt-4"><EmailProviderSettings /></TabsContent>
      </Tabs>
    </div>
  );
};
