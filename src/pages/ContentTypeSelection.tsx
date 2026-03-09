import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Puzzle, Book, FileText, Users, Sparkles, Zap, Target, TrendingUp, BarChart3, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ContentTypeSelection = () => {
  const navigate = useNavigate();

  const contentTypes = [
    {
      id: 'content-wizard',
      title: 'Content Wizard',
      description: 'Create high-quality blog articles, social media posts, newsletters, and other engaging content types with AI-powered assistance',
      icon: Puzzle,
      path: '/ai-chat',
      features: ['Multi-format', 'AI-powered', 'SEO optimized', 'Template library'],
      targetAudience: ['Content creators', 'Marketers', 'Social media managers'],
      category: 'Content Creation',
      useCases: ['Blog posts', 'Social media', 'Newsletters', 'Marketing copy']
    },
    {
      id: 'glossary-builder',
      title: 'Glossary Builder',
      description: 'Build comprehensive glossaries and term definitions with auto-linking, export capabilities, and intelligent organization',
      icon: Book,
      path: '/glossary-builder',
      features: ['Terminology management', 'Auto-linking', 'Export ready', 'Search & filter'],
      targetAudience: ['Technical writers', 'Educators', 'Documentation teams'],
      category: 'Knowledge Management',
      useCases: ['Documentation', 'Training materials', 'Knowledge bases', 'Reference guides']
    }
  ];

  const handleSelectContentType = (contentType: any) => {
    navigate(contentType.path);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <Helmet>
        <title>Content Creation Hub - Choose Your Builder</title>
        <meta name="description" content="Select from our advanced content creation tools powered by AI intelligence" />
      </Helmet>
      
      <motion.div 
        className="min-h-screen w-full bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Interactive Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Animated gradient orbs */}
          <motion.div 
            className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-40 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.5, 0.2],
              x: [0, -40, 0],
              y: [0, 40, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          
          {/* Interactive floating particles */}
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/40 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -200, 0],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 6,
                repeat: Infinity,
                delay: Math.random() * 8,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <Navbar />
        
        <div className="relaw-full px-6 pt-24 pb-12">
          {/* Hero Section */}
          <motion.div 
            className="text-center mb-16 relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 rounded-3xl blur-3xl"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            
            <div className="relative">
              <motion.div 
                className="inline-flex items-center gap-3 px-6 py-3 bg-background/60 backdrop-blur-xl rounded-full border border-border/50 mb-8"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Content Creation Hub</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </motion.div>
              
              <motion.h1 
                className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-blue-500 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Choose Your
                <br />
                <span className="text-primary">Content Builder</span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Select from our advanced content creation tools powered by AI intelligence. 
                Each builder is optimized for specific content types and workflows.
              </motion.p>

              {/* Quick Stats */}
              <motion.div 
                className="flex justify-center gap-8 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {[
                  { icon: Target, label: "Content Types", value: "10+" },
                  { icon: Zap, label: "AI Powered", value: "100%" },
                  { icon: Rocket, label: "Time Saved", value: "80%" }
                ].map((stat, index) => (
                  <motion.div 
                    key={stat.label}
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-background/60 backdrop-blur-xl rounded-xl border border-border/50 mb-2">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-sm font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Content Type Cards */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {contentTypes.map((contentType, index) => (
              <motion.div
                key={contentType.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 300
                }}
              >
                <Card 
                  className="cursor-pointer bg-background/60 backdrop-blur-xl rounded-2xl border border-border/50 overflow-hidden group relative"
                  onClick={() => handleSelectContentType(contentType)}
                >
                  {/* Gradient overlay that appears on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ opacity: 1 }}
                  />
                  
                  <CardContent className="p-8 relative z-10">
                    <div className="flex items-start gap-6">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Avatar className="h-20 w-20 rounded-2xl border border-border/50 flex-shrink-0">
                          <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 text-primary">
                            <contentType.icon className="h-10 w-10" />
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                      
                      <div className="flex-1 min-w-0 space-y-6">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                              {contentType.title}
                            </h3>
                            <Badge className="bg-background/80 backdrop-blur-sm text-primary border-border/50">
                              {contentType.category}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">
                            {contentType.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Features */}
                          <div>
                            <span className="text-sm font-semibold text-primary mb-2 block">Features</span>
                            <div className="space-y-1">
                              {contentType.features.slice(0, 2).map((feature, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="outline" 
                                  className="text-xs bg-primary/10 text-primary border-primary/30 block w-fit"
                                >
                                  {feature}
                                </Badge>
                              ))}
                              {contentType.features.length > 2 && (
                                <span className="text-xs text-muted-foreground">
                                  +{contentType.features.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Target Audience */}
                          <div>
                            <span className="text-sm font-semibold text-blue-500 mb-2 block">Perfect for</span>
                            <div className="space-y-1">
                              {contentType.targetAudience.slice(0, 2).map((audience, idx) => (
                                <div key={idx} className="flex items-center gap-1">
                                  <Users className="h-3 w-3 text-blue-500" />
                                  <span className="text-xs text-muted-foreground">{audience}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Use Cases */}
                          <div>
                            <span className="text-sm font-semibold text-green-500 mb-2 block">Use Cases</span>
                            <div className="space-y-1">
                              {contentType.useCases.slice(0, 2).map((useCase, idx) => (
                                <div key={idx} className="flex items-center gap-1">
                                  <FileText className="h-3 w-3 text-green-500" />
                                  <span className="text-xs text-muted-foreground">{useCase}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Call to Action */}
                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            Start creating content
                          </span>
                          <motion.div
                            className="flex items-center gap-1 text-primary"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <span className="text-sm font-medium">Get Started</span>
                            <Zap className="h-4 w-4" />
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Additional Info Section */}
          <motion.div 
            className="text-center pt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <div className="max-w-2xl mx-auto p-8 bg-background/60 backdrop-blur-xl rounded-2xl border border-border/50">
              <motion.div
                className="inline-flex items-center gap-2 mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">AI-Powered Assistance</span>
              </motion.div>
              <p className="text-muted-foreground">
                Each builder includes guided workflows, intelligent suggestions, and real-time optimization 
                to help you create professional, high-performing content with ease.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default ContentTypeSelection;