import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { EnhancedEmbeddedKeywordLibrary } from '@/components/research/keyword/EnhancedEmbeddedKeywordLibrary';
import { Search, Database, TrendingUp } from 'lucide-react';

const KeywordsPage = () => {
  const canonicalUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/keywords` 
    : '/keywords';

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Helmet>
        <title>Keywords — Keyword Repository & Management</title>
        <meta name="description" content="Manage your keyword library with comprehensive metrics, remove duplicates, and organize keyword collections for SEO and content strategy." />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      
      <Navbar />
      
      {/* Animated Background */}
      <AnimatedBackground intensity="medium" />
      
      <main className="flex-1 container py-8 z-10 relative max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center"
            >
              <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20">
                <Database className="h-8 w-8 text-primary" />
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
            >
              Keyword Repository
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground max-w-2xl mx-auto text-lg"
            >
              Manage your complete keyword library with metrics, analytics, and organizational tools
            </motion.p>

            {/* Feature highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4 pt-4"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 bg-background/60 backdrop-blur-sm border border-border/50 rounded-full text-sm">
                <Search className="h-4 w-4 text-primary" />
                Search & Filter
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-background/60 backdrop-blur-sm border border-border/50 rounded-full text-sm">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Performance Metrics
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-background/60 backdrop-blur-sm border border-border/50 rounded-full text-sm">
                <Database className="h-4 w-4 text-purple-500" />
                Duplicate Management
              </div>
            </motion.div>
          </div>

          {/* Keyword Library */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassCard className="p-6">
              <EnhancedEmbeddedKeywordLibrary
                className="w-full"
                onKeywordSelect={(keyword) => {
                  // Optional: Handle keyword selection for any future functionality
                  console.log('Selected keyword:', keyword);
                }}
              />
            </GlassCard>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default KeywordsPage;