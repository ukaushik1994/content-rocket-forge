
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-900 to-black">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-neon-purple/30 border-t-neon-purple animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue animate-pulse"></div>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-2">Loading Approval Workspace</h3>
            <p className="text-white/60">Preparing your content review environment...</p>
          </div>
        </div>
      </div>
    );
  }

  return <ApprovalWorkspace contentItems={contentItems} />;
};

const ContentApproval = () => {
  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-900 to-black relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Helmet>
        <title>Content Approval | ContentRocketForge</title>
        <meta name="description" content="Review and approve content submissions with advanced workflow management" />
      </Helmet>
      
      <Navbar />
      
      {/* Header Section */}
      <motion.div 
        className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent mb-2">
                Content Approval Center
              </h1>
              <p className="text-white/70 text-lg">
                Review, approve, and manage your content with intelligent workflow automation
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-white/80 text-sm font-medium">Live Workspace</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Main Content */}
      <main className="flex-1 relative z-10">
        <motion.div 
          className="container mx-auto px-6 py-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <ContentProvider>
            <ContentApprovalContent />
          </ContentProvider>
        </motion.div>
      </main>
      
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-neon-purple/20 to-neon-pink/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 animate-float"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-neon-blue/20 to-neon-purple/10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-neon-pink/15 to-neon-orange/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-gradient-to-bl from-neon-green/15 to-neon-blue/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '6s' }}></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-futuristic-grid bg-grid opacity-5"></div>
        
        {/* Scanning Lines */}
        <div className="absolute inset-0">
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent animate-pulse" style={{ top: '25%', animationDelay: '1s' }}></div>
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-neon-purple/30 to-transparent animate-pulse" style={{ top: '75%', animationDelay: '3s' }}></div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContentApproval;
