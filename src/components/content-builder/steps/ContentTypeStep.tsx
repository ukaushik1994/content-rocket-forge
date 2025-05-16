import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Solution } from '@/contexts/content-builder/types';
import { useSolutionsData } from '@/components/solutions/hooks/useSolutionsData';
import { Sparkles, FileText, LayoutGrid, Search, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ContentTypeCard } from '../content-type/ContentTypeCard';
import { ContentTypeSelector } from '../content-type/ContentTypeSelector';
import { SolutionSelector } from '../content-type/SolutionSelector';
import { ContentType, ContentFormat } from '@/contexts/content-builder/types';

// Content type definitions
const contentTypes = [
  {
    id: 'blog' as ContentType,
    title: 'Blog Post',
    description: 'Informative, educational content to attract and engage your audience',
    icon: <FileText className="h-5 w-5" />,
    formats: ['How-to Guide', 'List Post', 'Ultimate Guide', 'Case Study', 'Opinion Piece']
  },
  {
    id: 'landing' as ContentType,
    title: 'Landing Page',
    description: 'Conversion-focused content designed to drive specific actions',
    icon: <LayoutGrid className="h-5 w-5" />,
    formats: ['Product Page', 'Service Page', 'Lead Generation', 'Feature Highlight']
  },
  {
    id: 'seo' as ContentType,
    title: 'SEO Content',
    description: 'Keyword-optimized content designed to rank well in search results',
    icon: <Search className="h-5 w-5" />,
    formats: ['Pillar Page', 'Keyword-focused Article', 'FAQ Page', 'Resource Page']
  }
];

// Mock solutions until we integrate with backend
const mockSolutions: Solution[] = [
  {
    id: '1',
    name: 'Content Marketing Platform',
    description: 'All-in-one solution for content creation and distribution',
    features: ['AI content generation', 'SEO optimization', 'Content calendar'],
    useCases: ['Marketing teams', 'Content creators'],
    painPoints: ['Time-consuming content creation', 'Poor SEO performance'],
    targetAudience: ['Marketing managers', 'Content strategists'],
    category: 'Marketing',
    logoUrl: null,
    externalUrl: null,
    resources: []
  },
  {
    id: '2',
    name: 'SEO Analytics Suite',
    description: 'Comprehensive SEO tracking and optimization tools',
    features: ['Keyword tracking', 'Competitor analysis', 'Backlink monitoring'],
    useCases: ['SEO agencies', 'Marketing departments'],
    painPoints: ['Lack of visibility into SEO performance', 'Manual reporting'],
    targetAudience: ['SEO specialists', 'Digital marketers'],
    category: 'Analytics',
    logoUrl: null,
    externalUrl: null,
    resources: []
  },
  {
    id: '3',
    name: 'Social Media Manager',
    description: 'Streamline your social media presence across platforms',
    features: ['Content scheduling', 'Analytics dashboard', 'Engagement tracking'],
    useCases: ['Social media teams', 'Small businesses'],
    painPoints: ['Inconsistent posting', 'Poor engagement metrics'],
    targetAudience: ['Social media managers', 'Marketing coordinators'],
    category: 'Social Media',
    logoUrl: null,
    externalUrl: null,
    resources: []
  }
];

export const ContentTypeStep = () => {
  const { state, dispatch, setContentType, setSelectedSolution } = useContentBuilder();
  const { solutions, isLoading, fetchSolutions } = useSolutionsData();
  
  const [selectedType, setSelectedType] = useState<ContentType | ''>(state.contentType || '');
  const [selectedFormat, setSelectedFormat] = useState<string>(state.contentFormat || '');
  const [activeTab, setActiveTab] = useState('type');
  const [availableSolutions, setAvailableSolutions] = useState<Solution[]>([]);
  
  // Load solutions on component mount
  useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);
  
  // Set available solutions based on loaded data or fallback to mock data
  useEffect(() => {
    if (solutions && solutions.length > 0) {
      setAvailableSolutions(solutions);
    } else if (!isLoading) {
      // If no solutions loaded and not loading, use mock data
      setAvailableSolutions(mockSolutions);
    }
  }, [solutions, isLoading]);
  
  // Update local state when context state changes
  useEffect(() => {
    if (state.contentType) {
      setSelectedType(state.contentType);
    }
    if (state.contentFormat) {
      setSelectedFormat(state.contentFormat);
    }
  }, [state.contentType, state.contentFormat]);
  
  // Handle content type selection
  const handleTypeSelect = (typeId: ContentType) => {
    setSelectedType(typeId);
    setContentType(typeId);
    
    // Find the selected type to get available formats
    const selectedTypeObj = contentTypes.find(type => type.id === typeId);
    
    // If the current format is not available in the new type, reset it
    if (selectedTypeObj && !selectedTypeObj.formats.includes(selectedFormat)) {
      setSelectedFormat('');
    }
  };
  
  // Handle format selection
  const handleFormatSelect = (format: string) => {
    setSelectedFormat(format);
    dispatch({
      type: 'SET_CONTENT_FORMAT',
      payload: format as ContentFormat
    });
  };
  
  // Handle solution selection
  const handleSolutionSelect = (solution: Solution | null) => {
    setSelectedSolution(solution);
    
    if (solution) {
      toast.success(`Selected solution: ${solution.name}`);
    } else {
      toast.info('No solution selected');
    }
  };
  
  // Check if we can proceed to the next step
  const canProceed = selectedType !== '';
  
  // Mark step as completed if we have a content type
  useEffect(() => {
    if (canProceed) {
      dispatch({
        type: 'MARK_STEP_COMPLETED',
        payload: 1
      });
    }
  }, [canProceed, dispatch]);
  
  // Get formats for the selected type
  const getFormatsForSelectedType = () => {
    const selectedTypeObj = contentTypes.find(type => type.id === selectedType);
    return selectedTypeObj ? selectedTypeObj.formats : [];
  };
  
  return (
    <div className="space-y-8">
      {/* Header with animation */}
      <motion.div 
        className="relative overflow-hidden rounded-lg glass-panel border border-white/10 p-5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-2xl rounded-full"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <h3 className="text-lg font-semibold">Content Configuration</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Select your content type and business solution to optimize your content
          </p>
        </div>
      </motion.div>
      
      {/* Content Type Selection Tabs */}
      <Tabs defaultValue="type" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="type" className="text-sm">Content Type</TabsTrigger>
          <TabsTrigger value="solution" className="text-sm">Business Solution</TabsTrigger>
        </TabsList>
        
        {/* Content Type Tab */}
        <TabsContent value="type" className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base">Select Content Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {contentTypes.map(type => (
                <ContentTypeCard
                  key={type.id}
                  type={type}
                  isSelected={selectedType === type.id}
                  onSelect={() => handleTypeSelect(type.id)}
                />
              ))}
            </div>
          </div>
          
          {/* Content Format Selection */}
          {selectedType && (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <Label className="text-base">Select Content Format</Label>
              <ContentTypeSelector
                formats={getFormatsForSelectedType()}
                selectedFormat={selectedFormat}
                onFormatSelect={handleFormatSelect}
              />
            </motion.div>
          )}
          
          <div className="flex justify-end">
            <Button 
              onClick={() => setActiveTab('solution')}
              disabled={!selectedType}
              className="bg-gradient-to-r from-neon-purple to-neon-blue"
            >
              Continue <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
        
        {/* Business Solution Tab */}
        <TabsContent value="solution" className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base">Select Business Solution (Optional)</Label>
            <p className="text-sm text-muted-foreground">
              Choose a business solution to incorporate into your content
            </p>
            
            <SolutionSelector
              solutions={availableSolutions}
              selectedSolution={state.selectedSolution}
              onSolutionSelect={handleSolutionSelect}
              isLoading={isLoading}
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={() => setActiveTab('type')}
              variant="outline"
              className="mr-2 bg-glass border border-white/10"
            >
              Back
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
