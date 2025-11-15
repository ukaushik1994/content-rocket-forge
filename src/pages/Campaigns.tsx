import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { CampaignsHero } from '@/components/campaigns/CampaignsHero';
import { CampaignInput } from '@/components/campaigns/CampaignInput';
import { StrategyTiles } from '@/components/campaigns/StrategyTiles';
import { StrategyEditModal } from '@/components/campaigns/StrategyEditModal';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { useAuth } from '@/contexts/AuthContext';
import { useCampaignStrategies } from '@/hooks/useCampaignStrategies';
import { CampaignStrategy, CampaignInput as CampaignInputType } from '@/types/campaign-types';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { solutionService } from '@/services/solutionService';
import { toast } from 'sonner';

const Campaigns = () => {
  const { user } = useAuth();
  const { generateStrategies, isGenerating } = useCampaignStrategies();
  
  const [showInput, setShowInput] = useState(false);
  const [currentInput, setCurrentInput] = useState<CampaignInputType | null>(null);
  const [strategies, setStrategies] = useState<CampaignStrategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [editingStrategy, setEditingStrategy] = useState<CampaignStrategy | null>(null);
  const [selectedSolution, setSelectedSolution] = useState<EnhancedSolution | null>(null);
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/campaigns` : '/campaigns';

  // Fetch solution when strategies are generated with a solution ID
  useEffect(() => {
    const fetchSolution = async () => {
      if (strategies.length > 0 && currentInput?.solutionId) {
        try {
          const solution = await solutionService.getSolutionById(currentInput.solutionId);
          setSelectedSolution(solution);
        } catch (error) {
          console.error('Failed to fetch solution:', error);
        }
      } else {
        setSelectedSolution(null);
      }
    };
    
    fetchSolution();
  }, [strategies, currentInput]);

  const handleGenerateStrategies = async (input: CampaignInputType) => {
    if (!user) {
      toast.error('Please sign in to generate campaigns');
      return;
    }

    setCurrentInput(input);
    setStrategies([]); // Clear previous strategies to show loading state

    try {
      // Fetch company info
      const { data: companyData } = await supabase
        .from('company_info')
        .select('name, description, industry')
        .eq('user_id', user.id)
        .single();

      const companyInfo = companyData ? {
        name: companyData.name,
        description: companyData.description,
        industry: companyData.industry,
      } : undefined;

      const newStrategies = await generateStrategies(input, user.id, companyInfo);
      setStrategies(newStrategies);
      setShowInput(false);
      toast.success('Campaign strategies generated!');
    } catch (error) {
      console.error('Error generating strategies:', error);
      // Error already shown by hook
    }
  };

  const handleRegenerateStrategies = async () => {
    if (!currentInput) return;
    await handleGenerateStrategies(currentInput);
  };

  const handleEditStrategy = (strategy: CampaignStrategy) => {
    setEditingStrategy(strategy);
  };

  const handleSaveEditedStrategy = (updatedStrategy: CampaignStrategy) => {
    setStrategies((prev) =>
      prev.map((s) => (s.id === updatedStrategy.id ? updatedStrategy : s))
    );
    setEditingStrategy(null);
    toast.success('Strategy updated');
  };

  const selectedStrategyData = strategies.find((s) => s.id === selectedStrategy);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Helmet>
        <title>Campaigns — AI-Powered Multi-Channel Campaign Builder</title>
        <meta 
          name="description" 
          content="Transform one idea into a complete multi-channel campaign strategy with AI-powered content generation across blogs, social media, landing pages, and more." 
        />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      
      <Navbar />
      
      {/* Animated Background */}
      <AnimatedBackground intensity="medium" />
      
      <main className="flex-1 container py-8 z-10 relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <CampaignsHero onCreateClick={() => setShowInput(true)} />
          
          <AnimatePresence mode="wait">
            {showInput && (
              <CampaignInput
                onGenerate={handleGenerateStrategies}
                onCancel={() => setShowInput(false)}
                isGenerating={isGenerating}
              />
            )}

            {isGenerating && strategies.length === 0 && !showInput && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-xl border bg-card/50 backdrop-blur-sm p-6 space-y-4 animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-5 bg-muted rounded w-20"></div>
                      <div className="h-5 bg-muted rounded w-16"></div>
                    </div>
                    <div className="h-7 bg-muted rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-5/6 mb-4"></div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="h-20 bg-muted rounded"></div>
                      <div className="h-20 bg-muted rounded"></div>
                      <div className="h-20 bg-muted rounded"></div>
                      <div className="h-20 bg-muted rounded"></div>
                    </div>
                    <div className="h-10 bg-muted rounded"></div>
                  </div>
                ))}
              </motion.div>
            )}

            {strategies.length > 0 && !showInput && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
              <StrategyTiles
                strategies={strategies}
                selectedId={selectedStrategy}
                onSelect={setSelectedStrategy}
                onEdit={handleEditStrategy}
                onRegenerate={handleRegenerateStrategies}
                isRegenerating={isGenerating}
                solution={selectedSolution}
              />

                {selectedStrategy && selectedStrategyData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center gap-4"
                  >
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-primary to-blue-500"
                    >
                      Generate Content for This Strategy
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Edit Modal */}
      {editingStrategy && (
        <StrategyEditModal
          open={!!editingStrategy}
          onOpenChange={(open) => !open && setEditingStrategy(null)}
          strategy={editingStrategy}
          onSave={handleSaveEditedStrategy}
        />
      )}
    </div>
  );
};

export default Campaigns;
