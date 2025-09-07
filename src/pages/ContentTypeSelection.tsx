import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import {
  FileText,
  Bird,
  Linkedin,
  Facebook,
  Instagram,
  Film,
  Mail,
  Book,
  Ticket,
  ListTree,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface ContentTypeOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  route: string;
  category: 'blog' | 'social' | 'email' | 'advanced';
  popular?: boolean;
}

const contentTypeOptions: ContentTypeOption[] = [
  {
    id: 'blog',
    name: 'Blog Article',
    description: 'Long-form SEO-optimized content for your website',
    icon: FileText,
    route: '/content-builder?type=blog',
    category: 'blog',
    popular: true
  },
  {
    id: 'glossary',
    name: 'Glossary Entry',
    description: 'Create comprehensive glossaries for your domain',
    icon: Book,
    route: '/glossary-builder',
    category: 'advanced',
    popular: true
  },
  {
    id: 'social-twitter',
    name: 'Twitter Post',
    description: 'Engaging short-form content for Twitter (X)',
    icon: Bird,
    route: '/content-builder?type=social-twitter',
    category: 'social'
  },
  {
    id: 'social-linkedin',
    name: 'LinkedIn Post',
    description: 'Professional content for LinkedIn audiences',
    icon: Linkedin,
    route: '/content-builder?type=social-linkedin',
    category: 'social'
  },
  {
    id: 'social-facebook',
    name: 'Facebook Post',
    description: 'Engaging content for Facebook communities',
    icon: Facebook,
    route: '/content-builder?type=social-facebook',
    category: 'social'
  },
  {
    id: 'social-instagram',
    name: 'Instagram Caption',
    description: 'Captivating captions for Instagram posts',
    icon: Instagram,
    route: '/content-builder?type=social-instagram',
    category: 'social'
  },
  {
    id: 'video-script',
    name: 'Video Script',
    description: 'Scripts for videos, podcasts, and presentations',
    icon: Film,
    route: '/content-builder?type=script',
    category: 'advanced'
  },
  {
    id: 'email',
    name: 'Email Newsletter',
    description: 'Content formatted for email campaigns',
    icon: Mail,
    route: '/content-builder?type=email',
    category: 'email'
  },
  {
    id: 'carousel',
    name: 'Carousel Post',
    description: 'Multi-slide content for social platforms',
    icon: ListTree,
    route: '/content-builder?type=carousel',
    category: 'social'
  }
];

const categoryLabels = {
  blog: 'Blog Content',
  social: 'Social Media',
  email: 'Email Marketing',
  advanced: 'Advanced Content'
};

const categoryColors = {
  blog: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  social: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  email: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
  advanced: 'from-orange-500/20 to-red-500/20 border-orange-500/30'
};

const ContentTypeSelection = () => {
  const navigate = useNavigate();

  const handleSelectContentType = (option: ContentTypeOption) => {
    navigate(option.route);
  };

  const groupedOptions = contentTypeOptions.reduce((acc, option) => {
    if (!acc[option.category]) {
      acc[option.category] = [];
    }
    acc[option.category].push(option);
    return acc;
  }, {} as Record<string, ContentTypeOption[]>);

  return (
    <>
      <Helmet>
        <title>Content Builder - Choose Content Type | AI Content Platform</title>
        <meta name="description" content="Select the type of content you want to create with our AI-powered content builder. From blog articles to social media posts and glossaries." />
        <link rel="canonical" href="/content-type-selection" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 via-transparent to-neon-blue/5" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        
        <Navbar />
        
        <main className="relative pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <Badge className="bg-neon-purple/20 text-neon-purple border-neon-purple/30">
                  AI-Powered Builder
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gradient mb-6">
                Choose Your Content Type
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Select the type of content you want to create with our AI-powered tools. 
                Each format is optimized for its specific platform and audience.
              </p>
            </motion.div>

            {/* Content Type Grid */}
            <div className="space-y-12">
              {Object.entries(groupedOptions).map(([category, options], categoryIndex) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: categoryIndex * 0.1 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${categoryColors[category as keyof typeof categoryColors].split(' ')[0]}`} />
                    <h2 className="text-2xl font-semibold text-white">
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {options.map((option, index) => {
                      const IconComponent = option.icon;
                      
                      return (
                        <motion.div
                          key={option.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: categoryIndex * 0.1 + index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          className="group"
                        >
                          <Card className={`cursor-pointer transition-all duration-300 hover:shadow-xl bg-gradient-to-br ${categoryColors[option.category]} backdrop-blur-sm hover:backdrop-blur-md`}>
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    <IconComponent className="h-6 w-6 text-white" />
                                  </div>
                                  
                                  <div>
                                    <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                                      {option.name}
                                      {option.popular && (
                                        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                                          Popular
                                        </Badge>
                                      )}
                                    </h3>
                                    <p className="text-sm text-white/70">
                                      {option.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              <Button
                                onClick={() => handleSelectContentType(option)}
                                className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 transition-all group-hover:translate-x-1"
                              >
                                Create {option.name}
                                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center mt-20"
            >
              <Card className="bg-gradient-to-br from-neon-purple/10 to-neon-blue/10 border-white/10 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    Not sure which format to choose?
                  </h3>
                  <p className="text-white/70 mb-6 max-w-2xl mx-auto">
                    Our AI can recommend the best content format based on your goals and audience. 
                    Start with a blog article if you're new to content creation.
                  </p>
                  <Button
                    onClick={() => navigate('/content-builder')}
                    className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-purple/80 hover:to-neon-blue/80 text-white border-0"
                  >
                    Start with Blog Article
                    <Sparkles className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ContentTypeSelection;