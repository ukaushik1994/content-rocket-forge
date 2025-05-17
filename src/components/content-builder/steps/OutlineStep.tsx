
import React, { useEffect, useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { AIOutlineGenerator } from '../outline/AIOutlineGenerator';
import { ContentTitleCard } from '../outline/ContentTitleCard';
import { SelectedSerpItemsCard } from '../outline/SelectedSerpItemsCard';
import { OutlineTable } from '../outline/OutlineTable';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ContentTypeOptions } from './content-type/ContentTypeOptions';
import { ContentFormatOptions } from './content-type/ContentFormatOptions';
import { TitleGenerator } from '../outline/TitleGenerator';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListChecks, Sparkles, Layout, Wand2 } from 'lucide-react';

export const OutlineStep = () => {
  const { state, dispatch, setContentType, setContentFormat } = useContentBuilder();
  const { 
    outline, 
    serpSelections, 
    contentType, 
    contentFormat, 
    contentTitle 
  } = state;
  
  const [activeTab, setActiveTab] = useState('outline');
  
  useEffect(() => {
    // Mark as complete if we have an outline with at least 3 sections
    if (outline.length >= 3) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 3 });
    }
  }, [outline, dispatch]);
  
  const handleSaveOutline = (updatedOutline: string[]) => {
    dispatch({ type: 'SET_OUTLINE', payload: updatedOutline });
  };

  const hasSerpSelections = serpSelections.some(item => item.selected);
  
  // Handle content type selection
  const handleContentTypeSelect = (value: string) => {
    setContentType(value as any);
    toast.success(`Content type set to ${value}`);
  };
  
  // Handle content format selection
  const handleFormatSelect = (value: string) => {
    setContentFormat(value as any);
    toast.success(`Content format set to ${value}`);
  };
  
  return (
    <div className="space-y-6">
      <motion.div 
        className="flex flex-col md:flex-row md:justify-between md:items-center gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-neon-purple" />
            Content Structure & Outline
          </h3>
          <p className="text-sm text-muted-foreground">
            Define your content structure, type and outline
          </p>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4 bg-white/5 border border-white/10">
          <TabsTrigger value="outline" className="data-[state=active]:bg-white/10">
            <ListChecks className="h-4 w-4 mr-2" />
            Content Outline
          </TabsTrigger>
          <TabsTrigger value="format" className="data-[state=active]:bg-white/10">
            <Layout className="h-4 w-4 mr-2" />
            Content Format
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="outline" className="space-y-6">
          {/* Content title with edit option */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ContentTitleCard />
            <TitleGenerator />
          </div>

          {/* Selected Items Summary */}
          <SelectedSerpItemsCard />

          {/* AI Outline Generator */}
          <AIOutlineGenerator />

          {/* Outline Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-white/5 border border-white/10">
              <CardContent className="pt-6">
                <OutlineTable 
                  outline={outline} 
                  onSave={handleSaveOutline} 
                />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="format" className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Content Type Selection */}
            <Card className="bg-white/5 border border-white/10">
              <CardContent className="pt-6">
                <ContentTypeOptions 
                  selectedContentType={contentType} 
                  onContentTypeSelect={handleContentTypeSelect} 
                />
              </CardContent>
            </Card>
            
            {/* Content Format Selection */}
            <Card className="bg-white/5 border border-white/10">
              <CardContent className="pt-6">
                <ContentFormatOptions 
                  selectedContentFormat={contentFormat} 
                  onFormatSelect={handleFormatSelect} 
                />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
