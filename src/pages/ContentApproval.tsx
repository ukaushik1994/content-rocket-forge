
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import { ContentApprovalView } from '@/components/approval/ContentApprovalView';
import { ContentProvider } from '@/contexts/content';
import { motion } from 'framer-motion';


const ContentApproval = () => {
  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Helmet>
        <title>Content Approval | ContentRocketForge</title>
        <meta name="description" content="Review and approve content submissions with advanced workflow management" />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container px-6 pt-10 pb-12">
        <ContentProvider>
          <ContentApprovalView />
        </ContentProvider>
      </main>
      
      {/* Subtle Background Orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-muted/20 rounded-full blur-3xl animate-pulse" />
      </div>
    </motion.div>
  );
};

export default ContentApproval;
