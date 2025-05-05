
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, FileText, FileImage, Mail, Layout, ShoppingBag, FileSpreadsheet, Facebook } from 'lucide-react';
import { motion } from 'framer-motion';
import { ContentType } from '@/contexts/content-builder/types';

type ContentTypeOption = {
  id: ContentType;
  name: string;
  icon: React.ReactNode;
  description: string;
  formats: string[];
};

const contentTypes: ContentTypeOption[] = [
  {
    id: 'article',
    name: 'Blog Article',
    icon: <FileText className="h-6 w-6" />,
    description: 'In-depth informational content',
    formats: ['How-to Guide', 'Listicle', 'Ultimate Guide', 'Case Study', 'Opinion Piece']
  },
  {
    id: 'landingPage',
    name: 'Landing Page',
    icon: <Layout className="h-6 w-6" />,
    description: 'Conversion-focused sales page',
    formats: ['Product Launch', 'Lead Generation', 'Event Registration', 'Webinar Signup']
  },
  {
    id: 'productDescription',
    name: 'Product Description',
    icon: <ShoppingBag className="h-6 w-6" />,
    description: 'Sales-focused content for products',
    formats: ['Feature Highlight', 'Technical Specs', 'Benefits Focused', 'Comparative']
  },
  {
    id: 'email',
    name: 'Email Campaign',
    icon: <Mail className="h-6 w-6" />,
    description: 'Engaging email content',
    formats: ['Newsletter', 'Promotional', 'Onboarding Sequence', 'Abandoned Cart']
  },
  {
    id: 'social',
    name: 'Social Media',
    icon: <Facebook className="h-6 w-6" />,
    description: 'Content for social platforms',
    formats: ['Post Series', 'Campaign', 'Ad Copy', 'Profile Content']
  }
];

export const ContentTypeStep = () => {
  const { state, dispatch } = useContentBuilder();
  const { contentType, contentFormat } = state;
  const [selectedType, setSelectedType] = useState<ContentType>(contentType || 'article');
  const [selectedFormat, setSelectedFormat] = useState<string>(contentFormat || '');
  const [showFormats, setShowFormats] = useState(false);
  
  // Find the currently selected content type option
  const selectedTypeOption = contentTypes.find(type => type.id === selectedType);
  
  useEffect(() => {
    // Mark step as completed when both type and format are selected
    if (selectedType && selectedFormat) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 1 });
    }
  }, [selectedType, selectedFormat, dispatch]);
  
  // Handler for selecting content type
  const handleSelectType = (typeId: ContentType) => {
    setSelectedType(typeId);
    setSelectedFormat(''); // Reset format when changing type
    dispatch({ type: 'SET_CONTENT_TYPE', payload: typeId });
    // Show formats after a slight delay for animation
    setTimeout(() => setShowFormats(true), 300);
  };
  
  // Handler for selecting content format
  const handleSelectFormat = (format: string) => {
    setSelectedFormat(format);
    dispatch({ type: 'SET_CONTENT_FORMAT', payload: format });
  };
  
  // Content type selection animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <div className="space-y-8">
      {/* Content Type Selection */}
      <div>
        <h2 className="text-xl font-medium mb-6 flex items-center">
          <span className="bg-neon-purple/20 text-neon-purple p-1.5 rounded-full mr-3">
            <FileSpreadsheet className="h-5 w-5" />
          </span>
          Select Content Type
        </h2>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {contentTypes.map((type) => (
            <motion.div key={type.id} variants={itemVariants}>
              <Card 
                className={`cursor-pointer transition-all duration-300 hover:border-neon-purple/30 hover:shadow-md ${
                  selectedType === type.id 
                    ? 'border-neon-purple bg-neon-purple/10' 
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
                onClick={() => handleSelectType(type.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className={`p-2 rounded-lg ${
                      selectedType === type.id 
                        ? 'bg-neon-purple/20' 
                        : 'bg-white/10'
                    }`}>
                      {type.icon}
                    </div>
                    
                    {selectedType === type.id && (
                      <div className="bg-neon-purple/90 text-white p-1 rounded-full">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="mt-3">{type.name}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      {/* Content Format Selection */}
      {selectedTypeOption && showFormats && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-medium">Select Format for {selectedTypeOption.name}</h3>
          <div className="flex flex-wrap gap-2">
            {selectedTypeOption.formats.map((format) => (
              <Button
                key={format}
                variant={selectedFormat === format ? "default" : "outline"}
                className={`
                  ${selectedFormat === format 
                    ? 'bg-gradient-to-r from-neon-purple to-neon-blue border-none' 
                    : 'border-white/10 bg-white/5 hover:border-neon-purple/30'
                  }
                `}
                onClick={() => handleSelectFormat(format)}
              >
                {format}
                {selectedFormat === format && <Check className="ml-2 h-4 w-4" />}
              </Button>
            ))}
          </div>
          
          {selectedFormat && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-white/5 border border-white/10 p-4 rounded-lg"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Your Selection</h4>
                  <p className="text-muted-foreground text-sm">
                    {selectedTypeOption.name} - {selectedFormat}
                  </p>
                </div>
                
                <Check className="h-5 w-5 text-green-500" />
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};
