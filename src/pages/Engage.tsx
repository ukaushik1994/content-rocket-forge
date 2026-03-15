import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { ContactsList } from '@/components/engage/contacts/ContactsList';
import { SegmentsList } from '@/components/engage/contacts/SegmentsList';
import { EmailDashboard } from '@/components/engage/email/EmailDashboard';
import { JourneysList } from '@/components/engage/journeys/JourneysList';
import { JourneyBuilder } from '@/components/engage/journeys/JourneyBuilder';
import { AutomationsList } from '@/components/engage/automations/AutomationsList';
import { AutomationRuns } from '@/components/engage/automations/AutomationRuns';
import { SocialDashboard } from '@/components/engage/social/SocialDashboard';
import { ActivityLog } from '@/components/engage/activity/ActivityLog';

const Engage = () => {
  return (
    <WorkspaceProvider>
      <div className="min-h-screen relative">
        <div className="h-[calc(100vh-4rem)] overflow-auto relative">
          <div className="relative z-0 p-6">
            <Routes>
              <Route index element={<Navigate to="email" replace />} />
              <Route path="email/*" element={<EmailDashboard />} />
              <Route path="contacts" element={<ContactsList />} />
              <Route path="segments" element={<SegmentsList />} />
              <Route path="journeys" element={<JourneysList />} />
              <Route path="journeys/:id" element={<JourneyBuilder />} />
              <Route path="automations" element={<AutomationsList />} />
              <Route path="automations/runs" element={<AutomationRuns />} />
              <Route path="social" element={<SocialDashboard />} />
              <Route path="activity" element={<ActivityLog />} />
            </Routes>
          </div>
        </div>
      </div>
    </WorkspaceProvider>
  );
};

export default Engage;
