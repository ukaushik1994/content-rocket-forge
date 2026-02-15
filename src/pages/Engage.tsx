import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { EngageLayout } from '@/components/engage/EngageLayout';
import { ContactsList } from '@/components/engage/contacts/ContactsList';
import { SegmentsList } from '@/components/engage/contacts/SegmentsList';
import { EmailDashboard } from '@/components/engage/email/EmailDashboard';
import { JourneysList } from '@/components/engage/journeys/JourneysList';
import { JourneyBuilder } from '@/components/engage/journeys/JourneyBuilder';
import { AutomationsList } from '@/components/engage/automations/AutomationsList';
import { SocialDashboard } from '@/components/engage/social/SocialDashboard';
import { ActivityLog } from '@/components/engage/activity/ActivityLog';
import { EngageSettings } from '@/components/engage/settings/EngageSettings';

const Engage = () => {
  return (
    <WorkspaceProvider>
      <EngageLayout>
        <Routes>
          <Route index element={<Navigate to="email" replace />} />
          <Route path="email/*" element={<EmailDashboard />} />
          <Route path="contacts" element={<ContactsList />} />
          <Route path="segments" element={<SegmentsList />} />
          <Route path="journeys" element={<JourneysList />} />
          <Route path="journeys/:id" element={<JourneyBuilder />} />
          <Route path="automations" element={<AutomationsList />} />
          <Route path="social" element={<SocialDashboard />} />
          <Route path="activity" element={<ActivityLog />} />
          <Route path="settings" element={<EngageSettings />} />
        </Routes>
      </EngageLayout>
    </WorkspaceProvider>
  );
};

export default Engage;