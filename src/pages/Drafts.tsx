
import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Calendar, Edit } from 'lucide-react';

const Drafts = () => {
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  const mockDrafts = [
    {
      id: 1,
      title: "10 Content Marketing Strategies for 2024",
      excerpt: "Discover the latest trends and tactics that will drive engagement...",
      lastModified: "2024-01-15",
      wordCount: 1200
    },
    {
      id: 2,
      title: "The Future of AI in Content Creation",
      excerpt: "Exploring how artificial intelligence is transforming the way we create...",
      lastModified: "2024-01-14",
      wordCount: 800
    },
    {
      id: 3,
      title: "SEO Best Practices Guide",
      excerpt: "A comprehensive guide to optimizing your content for search engines...",
      lastModified: "2024-01-13",
      wordCount: 2100
    }
  ];

  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-background futuristic-grid"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Helmet>
        <title>Drafts | ContentRocketForge</title>
        <meta name="description" content="Manage your content drafts and work in progress" />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-8 max-w-7xl">
        <motion.div variants={itemVariants} className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-4 text-gradient animate-pulse-glow">
              Drafts
            </h1>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
              Manage your work in progress and continue where you left off
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gradient">Your Drafts</h2>
            <Button className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-purple-600 hover:to-blue-600 shadow-neon">
              <Plus className="h-4 w-4 mr-2" />
              New Draft
            </Button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          {mockDrafts.map((draft, idx) => (
            <motion.div
              key={draft.id}
              variants={itemVariants}
              whileHover={{ scale: 1.01, y: -2 }}
              className="cursor-pointer"
            >
              <Card className="shadow-neon border-0 card-glass hover:shadow-neon-strong transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center shadow-neon">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gradient">{draft.title}</h3>
                      </div>
                      <p className="text-muted-foreground mb-4">{draft.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Modified {draft.lastModified}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{draft.wordCount} words</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="glass-panel border-white/20 hover:bg-white/10">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {mockDrafts.length === 0 && (
          <motion.div variants={itemVariants}>
            <Card className="shadow-neon border-0 card-glass">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center shadow-neon animate-float">
                  <FileText className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gradient">No drafts yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Start creating content and your drafts will appear here for easy access and editing.
                </p>
                <Button className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-purple-600 hover:to-blue-600 shadow-neon">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Draft
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </motion.div>
  );
};

export default Drafts;
