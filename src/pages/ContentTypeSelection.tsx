import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Puzzle, Book, FileText, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';

const ContentTypeSelection = () => {
  const navigate = useNavigate();

  const contentTypes = [
    {
      id: 'content-builder',
      title: 'Content Builder',
      description: 'Create high-quality blog articles, social media posts, newsletters, and other engaging content types with AI-powered assistance',
      icon: Puzzle,
      path: '/content-builder',
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
        <title>Content Type Selection - Choose Your Builder</title>
        <meta name="description" content="Select the type of content you want to create" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <Navbar />
        
        <div className="max-w-6xl mx-auto px-4 pt-8 pb-12">
          <div className="space-y-8">
            {/* Enhanced Hero Section */}
            <div className="text-center space-y-6">
              <h1 className="text-4xl font-bold text-white">Choose Your Content Builder</h1>
              <p className="text-lg text-white/70 max-w-3xl mx-auto leading-relaxed">
                Select the type of content creation tool that best fits your needs. Each builder is optimized for specific content types and workflows.
              </p>
            </div>

            {/* Enhanced Content Type Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {contentTypes.map((contentType) => (
                <motion.div
                  key={contentType.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    className="cursor-pointer transition-all hover:bg-white/10 bg-white/5 border-white/10 hover:border-white/20 h-full"
                    onClick={() => handleSelectContentType(contentType)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 rounded-xl border border-white/20 flex-shrink-0">
                          <AvatarFallback className="rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-white font-bold text-lg">
                            <contentType.icon className="h-8 w-8" />
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0 space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-xl font-semibold text-white">{contentType.title}</h3>
                              <Badge className="bg-white/10 text-white/80 border-white/20">
                                {contentType.category}
                              </Badge>
                            </div>
                            <p className="text-white/70 text-sm leading-relaxed">
                              {contentType.description}
                            </p>
                          </div>

                          <div className="space-y-3">
                            {/* Features */}
                            <div>
                              <span className="text-xs font-medium text-purple-300 mb-2 block">Key Features:</span>
                              <div className="flex flex-wrap gap-1">
                                {contentType.features.slice(0, 3).map((feature, idx) => (
                                  <Badge 
                                    key={idx} 
                                    variant="outline" 
                                    className="text-xs bg-purple-500/10 text-purple-300 border-purple-500/30"
                                  >
                                    {feature}
                                  </Badge>
                                ))}
                                {contentType.features.length > 3 && (
                                  <span className="text-xs text-white/60">
                                    +{contentType.features.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Target Audience */}
                            <div>
                              <span className="text-xs font-medium text-blue-300 mb-1 block">Perfect for:</span>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3 text-blue-300" />
                                <span className="text-xs text-white/70">
                                  {contentType.targetAudience.slice(0, 2).join(', ')}
                                  {contentType.targetAudience.length > 2 ? '...' : ''}
                                </span>
                              </div>
                            </div>

                            {/* Use Cases */}
                            <div>
                              <span className="text-xs font-medium text-green-300 mb-1 block">Use Cases:</span>
                              <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3 text-green-300" />
                                <span className="text-xs text-white/70">
                                  {contentType.useCases.slice(0, 3).join(', ')}
                                  {contentType.useCases.length > 3 ? '...' : ''}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Call to Action */}
                          <div className="pt-2">
                            <div className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                              Click to start building →
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Additional Info Section */}
            <div className="text-center pt-6 border-t border-white/10">
              <p className="text-sm text-white/50">
                Need help choosing? Each builder includes guided workflows and AI assistance to help you create professional content.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContentTypeSelection;