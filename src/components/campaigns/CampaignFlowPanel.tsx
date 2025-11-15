import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCampaignFlow } from '@/contexts/CampaignFlowContext';
import { CampaignFlowDiagram } from './CampaignFlowDiagram';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const TILE_TITLES = {
  'summary': 'Campaign Overview',
  'content-mix': 'Content Mix Strategy',
  'effort': 'Content Effort & Timeline',
  'audience': 'Audience Intelligence',
  'seo': 'SEO Intelligence',
  'distribution': 'Distribution Strategy',
  'assets': 'Asset Requirements',
  'addons': 'Optional Add-ons',
};

export const CampaignFlowPanel = () => {
  const { isFlowPanelOpen, closeFlowPanel, selectedTile, selectedTileData } = useCampaignFlow();
  const [activeTab, setActiveTab] = useState<'workflow' | 'timeline' | 'dependencies'>('workflow');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFlowPanelOpen) {
        closeFlowPanel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isFlowPanelOpen, closeFlowPanel]);

  useEffect(() => {
    if (isFlowPanelOpen) {
      setActiveTab('workflow');
    }
  }, [isFlowPanelOpen, selectedTile]);

  if (!selectedTile || !selectedTileData) return null;

  return (
    <AnimatePresence>
      {isFlowPanelOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={closeFlowPanel}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 top-0 bottom-0 w-full lg:w-1/2 bg-background border-l border-border shadow-2xl z-50 flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-bold">{TILE_TITLES[selectedTile]}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeFlowPanel}
                aria-label="Close flow panel"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
              <TabsList className="mx-6 mt-4">
                <TabsTrigger value="workflow">Workflow</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
              </TabsList>

              <TabsContent value="workflow" className="flex-1 overflow-hidden mt-0">
                <CampaignFlowDiagram
                  tileId={selectedTile}
                  tileData={selectedTileData}
                  activeTab="workflow"
                />
              </TabsContent>

              <TabsContent value="timeline" className="flex-1 overflow-hidden mt-0">
                <CampaignFlowDiagram
                  tileId={selectedTile}
                  tileData={selectedTileData}
                  activeTab="timeline"
                />
              </TabsContent>

              <TabsContent value="dependencies" className="flex-1 overflow-hidden mt-0">
                <CampaignFlowDiagram
                  tileId={selectedTile}
                  tileData={selectedTileData}
                  activeTab="dependencies"
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
