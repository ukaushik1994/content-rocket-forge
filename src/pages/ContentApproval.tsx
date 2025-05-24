
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import { ApprovalWorkspace } from '@/components/approval/ApprovalWorkspace';
import { ContentProvider, useContent } from '@/contexts/content';
import { motion } from 'framer-motion';

const ContentApprovalContent = () => {
  const { contentItems, loading } = useContent();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-neon-purple/30 border-t-neon-purple animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-neon-purple/50 animate-pulse"></div>
            </div>
          </div>
          <span className="text-lg font-medium text-gradient">Loading approval workspace...</span>
        </div>
      </div>
    );
  }

  return <ApprovalWorkspace contentItems={contentItems} />;
};

const ContentApproval = () => {
  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-900 to-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Helmet>
        <title>Content Approval | ContentRocketForge</title>
        <meta name="description" content="Review and approve content submissions with advanced workflow management" />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-8">
        <ContentProvider>
          <ContentApprovalContent />
        </ContentProvider>
      </main>
      
      {/* Enhanced Decorative Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-neon-pink/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-neon-green/10 rounded-full blur-3xl animate-pulse"></div>
      </div>
    </motion.div>
  );
};

export default ContentApproval;
