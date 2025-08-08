import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileText, BookOpen, Mail, Globe, Edit, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface RepositoryHeaderProps {
  contentItems?: any[];
  loading?: boolean;
}

export const RepositoryHeader: React.FC<RepositoryHeaderProps> = ({ contentItems = [], loading = false }) => {
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

  return (
    <div className="mb-8">
      {/* Header Section */}
      <motion.div 
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-primary via-neon-blue to-neon-purple bg-clip-text text-transparent mb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Content Repository
          </motion.h1>
          <motion.p 
            className="text-muted-foreground text-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Manage all your content in one beautiful, organized space
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Button 
            onClick={() => navigate('/content-builder')}
            className="glass-button bg-gradient-to-r from-primary to-neon-blue hover:from-primary/80 hover:to-neon-blue/80 text-white border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Content
          </Button>
        </motion.div>
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        {quickActions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              onClick={action.action}
              className="h-auto p-4 flex flex-col items-center gap-3 bg-background/40 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300 group w-full"
            >
              <div className={`p-3 rounded-full bg-gradient-to-r ${action.gradient} text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                <action.icon className="h-5 w-5" />
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">{action.label}</div>
                <div className="text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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