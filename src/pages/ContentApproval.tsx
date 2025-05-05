
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import { ContentApprovalView } from '@/components/approval/ContentApprovalView';
import { ContentProvider } from '@/contexts/content';

const ContentApproval = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-950">
      <Helmet>
        <title>Content Approval | SEO Platform</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-8">
        <ContentProvider>
          <ContentApprovalView />
        </ContentProvider>
      </main>
      
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-neon-pink/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default ContentApproval;
