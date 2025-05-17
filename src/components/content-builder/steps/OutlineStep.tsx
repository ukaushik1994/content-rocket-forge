
import React, { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListIcon, Files, LayoutList, FileText, PlusCircle } from 'lucide-react';
import { ManualOutlineCreator } from '../outline/ManualOutlineCreator';
import { AIOutlineGenerator } from '../outline/AIOutlineGenerator';
import { TitleGenerator } from '../outline/TitleGenerator';
import { SelectedSerpItemsSidebar } from '../outline/SelectedSerpItemsSidebar';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export const OutlineStep = () => {
  const { state, setOutline } = useContentBuilder();
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('ai');
  
  // Handle submission of the outline
  const handleSubmitOutline = (outline: string[]) => {
    if (outline.length < 3) {
      toast.error("Outline must have at least 3 sections");
      return;
    }
    
    setOutline(outline);
    toast.success("Outline saved successfully");
  };
  
  // Content for each tab
  const tabContent = {
    manual: <ManualOutlineCreator onSubmit={handleSubmitOutline} />,
    ai: <AIOutlineGenerator />
  };

  return (
    <div className="space-y-6">
      {/* Title suggestions at the top */}
      <TitleGenerator />
      
      {/* Main content with sidebar layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SERP Items Sidebar */}
        <div className="lg:col-span-1">
          <SelectedSerpItemsSidebar />
        </div>
        
        {/* Outline Creator */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="border-b border-border/40">
                <Tabs 
                  value={activeTab} 
                  onValueChange={(v) => setActiveTab(v as 'manual' | 'ai')}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 rounded-none border-b border-border/20">
                    <TabsTrigger value="ai" className="data-[state=active]:bg-white/5">
                      <div className="flex items-center gap-2">
                        <Files className="h-4 w-4" />
                        <span>AI Generator</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="manual" className="data-[state=active]:bg-white/5">
                      <div className="flex items-center gap-2">
                        <ListIcon className="h-4 w-4" />
                        <span>Manual Creator</span>
                      </div>
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="p-4">
                    <TabsContent value="ai" className="mt-0">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {tabContent.ai}
                      </motion.div>
                    </TabsContent>
                    <TabsContent value="manual" className="mt-0">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {tabContent.manual}
                      </motion.div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
