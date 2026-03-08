import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, BookOpen, Mail, Globe, MessageSquare, Edit, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ContentType } from '@/contexts/content/types';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  contentType: ContentType | 'all';
  status: string;
  searchQuery: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  contentType, 
  status, 
  searchQuery 
}) => {
  const navigate = useNavigate();

  const getEmptyStateContent = () => {
    if (searchQuery) {
      return {
        icon: FileText,
        title: 'No matching content found',
        description: `No content matches your search for "${searchQuery}". Try adjusting your search terms or filters.`,
        actionLabel: 'Clear Search',
        action: () => window.location.reload()
      };
    }

    if (contentType !== 'all') {
      const typeConfig = {
        article: {
          icon: FileText,
          title: 'No articles yet',
          description: 'Start creating informative articles to build your content library.',
          actionLabel: 'Create Article',
          action: () => navigate('/ai-chat')
        },
        blog: {
          icon: Edit,
          title: 'No blog posts yet',
          description: 'Share your thoughts and insights by creating your first blog post.',
          actionLabel: 'Create Blog Post',
          action: () => navigate('/ai-chat')
        },
        glossary: {
          icon: BookOpen,
          title: 'No glossaries yet',
          description: 'Build comprehensive glossaries to explain key terms in your industry.',
          actionLabel: 'Build Glossary',
          action: () => navigate('/glossary-builder')
        },
        email: {
          icon: Mail,
          title: 'No email content yet',
          description: 'Create engaging email campaigns to connect with your audience.',
          actionLabel: 'Create Email',
          action: () => navigate('/ai-chat')
        },
        landing_page: {
          icon: Globe,
          title: 'No landing pages yet',
          description: 'Design compelling landing pages to convert visitors into customers.',
          actionLabel: 'Create Landing Page',
          action: () => navigate('/content-builder?type=landing_page')
        },
        social_post: {
          icon: MessageSquare,
          title: 'No social posts yet',
          description: 'Create engaging social media content to grow your online presence.',
          actionLabel: 'Create Social Post',
          action: () => navigate('/content-builder?type=social_post')
        }
      };

      return typeConfig[contentType];
    }

    if (status !== 'all') {
      return {
        icon: FileText,
        title: `No ${status} content`,
        description: `You don't have any ${status} content yet. Create some content and set its status to see it here.`,
        actionLabel: 'Create Content',
        action: () => navigate('/content-builder')
      };
    }

    return {
      icon: FileText,
      title: 'Welcome to your Content Repository',
      description: 'This is where all your content will live. Start by creating your first piece of content.',
      actionLabel: 'Create Your First Content',
      action: () => navigate('/content-builder')
    };
  };

  const config = getEmptyStateContent();
  const IconComponent = config?.icon || FileText;

  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-16 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="mb-6"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-neon-blue/20 rounded-full blur-2xl"></div>
          <div className="relative p-6 rounded-full bg-background/40 backdrop-blur-sm border border-white/10">
            <IconComponent className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
      </motion.div>
      
      <motion.h3 
        className="text-2xl font-semibold mb-3 bg-gradient-to-r from-primary to-neon-blue bg-clip-text text-transparent"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        {config?.title}
      </motion.h3>
      
      <motion.p 
        className="text-muted-foreground mb-8 max-w-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        {config?.description}
      </motion.p>
      
      {config?.action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Button 
            onClick={config.action}
            className="glass-button bg-gradient-to-r from-primary to-neon-blue hover:from-primary/80 hover:to-neon-blue/80 text-white border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            {config.actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};