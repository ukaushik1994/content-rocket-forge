import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileText, BookOpen, Mail, Globe, Edit, MessageSquare, BarChart3, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ContentItemType } from '@/contexts/content/types';
import { CustomBadge } from '@/components/ui/custom-badge';

interface RepositoryHeaderProps {
  contentItems: ContentItemType[];
  loading: boolean;
}

export const RepositoryHeader: React.FC<RepositoryHeaderProps> = ({ contentItems, loading }) => {
  const navigate = useNavigate();

  const quickActions = [
    {
      label: 'New Article',
      icon: FileText,
      action: () => navigate('/content-builder'),
      gradient: 'from-blue-500 to-blue-600',
      description: 'Create blog posts and articles'
    },
    {
      label: 'Build Glossary',
      icon: BookOpen,
      action: () => navigate('/glossary-builder'),
      gradient: 'from-purple-500 to-purple-600',
      description: 'Generate comprehensive glossaries'
    },
    {
      label: 'Email Content',
      icon: Mail,
      action: () => navigate('/content-builder?type=email'),
      gradient: 'from-green-500 to-green-600',
      description: 'Create email campaigns'
    },
    {
      label: 'Landing Page',
      icon: Globe,
      action: () => navigate('/content-builder?type=landing_page'),
      gradient: 'from-orange-500 to-orange-600',
      description: 'Build landing pages'
    },
    {
      label: 'Social Post',
      icon: MessageSquare,
      action: () => navigate('/content-builder?type=social_post'),
      gradient: 'from-pink-500 to-pink-600',
      description: 'Create social media content'
    }
  ];

  // Calculate stats
  const stats = React.useMemo(() => {
    if (loading) return { total: 0, published: 0, drafts: 0 };
    return {
      total: contentItems.length,
      published: contentItems.filter(item => item.status === 'published').length,
      drafts: contentItems.filter(item => item.status === 'draft').length
    };
  }, [contentItems, loading]);

  return (
    <div className="mb-8">
      {/* Hero Header Section */}
      <motion.div 
        className="glass-panel p-8 rounded-2xl border border-white/10 backdrop-blur-xl bg-background/80 shadow-2xl mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-6 lg:mb-0">
            <motion.h1 
              className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-neon-blue to-neon-purple bg-clip-text text-transparent mb-4"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Content Repository
            </motion.h1>
            <motion.p 
              className="text-muted-foreground text-xl mb-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Manage all your solution-integrated content in one beautiful workspace
            </motion.p>
            
            {/* Stats Row */}
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Total</span>
                <CustomBadge className="bg-primary/20 text-primary">{stats.total}</CustomBadge>
              </div>
              <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Published</span>
                <CustomBadge className="bg-green-500/20 text-green-600">{stats.published}</CustomBadge>
              </div>
              <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Drafts</span>
                <CustomBadge className="bg-yellow-500/20 text-yellow-600">{stats.drafts}</CustomBadge>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Button 
              onClick={() => navigate('/content-builder')}
              className="glass-button bg-gradient-to-r from-primary to-neon-blue hover:from-primary/80 hover:to-neon-blue/80 text-white border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              size="lg"
            >
              <Plus className="mr-2 h-6 w-6" />
              Create New Content
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        {quickActions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
            whileHover={{ y: -4, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              variant="outline"
              onClick={action.action}
              className="h-auto p-5 flex flex-col items-center gap-3 bg-background/40 backdrop-blur-sm border-white/10 hover:border-white/30 transition-all duration-300 group w-full shadow-lg hover:shadow-xl"
            >
              <div className={`p-3 rounded-xl bg-gradient-to-r ${action.gradient} text-white shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110`}>
                <action.icon className="h-5 w-5" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-sm mb-1">{action.label}</div>
                <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {action.description}
                </div>
              </div>
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};