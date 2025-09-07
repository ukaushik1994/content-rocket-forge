import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Puzzle, Book } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';

const ContentTypeSelection = () => {
  const navigate = useNavigate();

  const contentTypes = [
    {
      id: 'content-builder',
      title: 'Content Builder',
      description: 'Create blog articles, social posts, and other content types',
      icon: <Puzzle className="h-8 w-8 text-white" />,
      path: '/content-builder'
    },
    {
      id: 'glossary-builder',
      title: 'Glossary Builder',
      description: 'Build comprehensive glossaries and term definitions',
      icon: <Book className="h-8 w-8 text-white" />,
      path: '/glossary-builder'
    }
  ];

  const handleSelectContentType = (path: string) => {
    navigate(path);
  };

  return (
    <>
      <Helmet>
        <title>Content Type Selection - Choose Your Builder</title>
        <meta name="description" content="Select the type of content you want to create" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <Navbar />
        
        <div className="max-w-4xl mx-auto px-4 pt-8 pb-12">
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-white">Choose Your Content Type</h1>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Select the type of content you want to create
              </p>
            </div>

            {/* Content Type Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {contentTypes.map((contentType) => (
                <motion.div
                  key={contentType.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    className="cursor-pointer transition-all hover:bg-white/10 bg-white/5 border-white/10 hover:border-white/20"
                    onClick={() => handleSelectContentType(contentType.path)}
                  >
                    <CardContent className="p-8 text-center space-y-4">
                      <div className="flex justify-center">
                        {contentType.icon}
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-white">
                          {contentType.title}
                        </h3>
                        <p className="text-white/70 text-sm leading-relaxed">
                          {contentType.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContentTypeSelection;