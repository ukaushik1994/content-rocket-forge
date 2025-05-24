
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import { ContentApprovalDashboard } from '@/components/approval/ContentApprovalDashboard';
import { ContentProvider } from '@/contexts/content';
import { ApprovalProvider } from '@/components/approval/context/ApprovalContext';
import { motion } from 'framer-motion';

const ContentApproval = () => {
  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-900 to-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Helmet>
        <title>Content Approval Center | ContentRocketForge</title>
        <meta name="description" content="Comprehensive content approval with AI scoring, SEO analysis, and interlinking recommendations" />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 w-full">
        <ContentProvider>
          <ApprovalProvider>
            <ContentApprovalDashboard />
          </ApprovalProvider>
        </ContentProvider>
      </main>
      
      {/* Enhanced Background Effects */}
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
