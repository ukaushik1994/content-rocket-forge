import React from 'react';

import { NotificationDemo as NotificationDemoComponent } from '@/components/notifications/NotificationDemo';
import { Helmet } from 'react-helmet-async';

export default function NotificationDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Helmet>
        <title>Notification System Demo | Creaiter</title>
        <meta name="description" content="Try out the notification system with interactive demos" />
      </Helmet>
      
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <NotificationDemoComponent />
      </main>
    </div>
  );
}