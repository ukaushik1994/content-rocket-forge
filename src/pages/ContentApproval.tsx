
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import { ContentApprovalView } from '@/components/approval/ContentApprovalView';
import { ContentProvider } from '@/contexts/content';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { useContent } from '@/contexts/content'; // Added: import the hook that's being used

const ContentApproval = () => {
  return (
    <motion.div 
      className="min-h-screen flex flex-col relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatedBackground />
      
      <Helmet>
        <title>Content Approval | Cr3ate</title>
        <meta name="description" content="Review and approve content submissions with advanced workflow management" />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container px-6 pt-10 pb-12 relative z-10">
        <ContentProvider>
          <ContentApprovalView />
        </ContentProvider>
      </main>
    </motion.div>
  );
};

export default ContentApproval;

