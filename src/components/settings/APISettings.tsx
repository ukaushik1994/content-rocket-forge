
import React, { useState, useEffect } from 'react';
import { ApiKeyInput } from './api/ApiKeyInput';
import { AvailableProviders } from './api/AvailableProviders';
import { CategoryTabs } from './api/CategoryTabs';
import { ApiStatusDashboard } from './api/ApiStatusDashboard';
import { QuickSetupWizard } from './api/QuickSetupWizard';
import { EnhancedSearch } from './api/EnhancedSearch';
import { API_PROVIDERS } from './api/types';
import { DefaultAiProviderSelector } from './api/DefaultAiProviderSelector';
import { getUserPreference, saveUserPreference } from '@/services/userPreferencesService';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, Sparkles, Settings, RefreshCw } from 'lucide-react';

export function APISettings() {
  const [selectedProviders, setSelectedProviders] = useState<string[]>(
    API_PROVIDERS.filter(p => p.required).map(p => p.id)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showQuickSetup, setShowQuickSetup] = useState(false);
  const [defaultAiProvider, setDefaultAiProvider] = useState<'openai' | 'anthropic' | 'gemini' | undefined>(
    undefined
  );
  
  // Load default AI provider from user preferences
  useEffect(() => {
    const savedProvider = getUserPreference('defaultAiProvider');
    if (savedProvider) {
      setDefaultAiProvider(savedProvider);
    } else {
      // Default to OpenAI if no preference is set
      setDefaultAiProvider('openai');
    }
  }, []);
  
  const handleProviderToggle = (providerId: string) => {
    setSelectedProviders(prev => 
      prev.includes(providerId) 
        ? prev.filter(id => id !== providerId) 
        : [...prev, providerId]
    );
  };

  const handleDisplayOptionChange = (value: string) => {
    if (value === "all") {
      setSelectedProviders(API_PROVIDERS.map(p => p.id));
    } else if (value === "none" || value === "required") {
      setSelectedProviders(API_PROVIDERS.filter(p => p.required).map(p => p.id));
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setActiveFilters([]);
  };

  const handleRefreshAll = () => {
    toast.info('Refreshing all API connections...');
    // In a real implementation, this would test all configured APIs
  };

  const handleQuickSetup = () => {
    setShowQuickSetup(true);
  };

  const handleDefaultAiProviderChange = async (provider: 'openai' | 'anthropic' | 'gemini') => {
    setDefaultAiProvider(provider);
    const success = await saveUserPreference('defaultAiProvider', provider);
    if (success) {
      toast.success(`Default AI provider set to ${provider}`);
    } else {
      toast.error('Failed to save default AI provider');
    }
  };

  const filteredProviders = API_PROVIDERS.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || provider.category === activeCategory;
    const isVisible = provider.required || selectedProviders.includes(provider.id);
    
    return matchesSearch && matchesCategory && isVisible;
  });

  const availableProviders = API_PROVIDERS.filter(p => 
    !p.required && !selectedProviders.includes(p.id)
  );

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

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-neon-purple/5">
      {/* Quick Setup Wizard */}
      <QuickSetupWizard
        isOpen={showQuickSetup}
        onClose={() => setShowQuickSetup(false)}
        providers={API_PROVIDERS}
        onProviderSelect={handleProviderToggle}
      />
      
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-neon-purple/10 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-neon-blue/10 blur-3xl animate-pulse"></div>
      </div>

      <motion.div 
        className="relative z-10 space-y-8 max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div 
          variants={cardVariants}
          className="relative overflow-hidden"
        >
          <Card className="border-0 bg-gradient-to-br from-neon-purple/20 via-background/80 to-neon-blue/10 backdrop-blur-xl shadow-2xl">
            <CardHeader className="pb-6 pt-8">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-neon-purple/30 blur-lg"></div>
                      <div className="relative rounded-full bg-neon-purple/20 p-3 border border-neon-purple/30">
                        <Settings className="h-6 w-6 text-neon-purple" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold bg-gradient-to-r from-neon-purple via-white to-neon-blue bg-clip-text text-transparent">
                        API Integration Hub
                      </CardTitle>
                      <CardDescription className="text-lg text-muted-foreground mt-2">
                        Connect and manage your third-party API integrations with ease
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>
        
        {/* Status Dashboard */}
        <ApiStatusDashboard
          providers={API_PROVIDERS}
          selectedProviders={selectedProviders}
          onRefreshAll={handleRefreshAll}
          onQuickSetup={handleQuickSetup}
        />

        {/* Enhanced Search */}
        <motion.div variants={itemVariants}>
          <Card className="border border-border/50 bg-background/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <EnhancedSearch
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                activeFilters={activeFilters}
                onClearFilters={handleClearFilters}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Default AI Provider Section */}
        <motion.div variants={itemVariants}>
          <Card className="border border-neon-purple/20 bg-gradient-to-r from-background/90 to-neon-purple/5 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-neon-blue/20 p-2 border border-neon-blue/30">
                  <Sparkles className="h-5 w-5 text-neon-blue" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold">Default AI Provider</CardTitle>
                  <CardDescription>
                    Choose your preferred AI provider for content generation tasks
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DefaultAiProviderSelector 
                defaultAiProvider={defaultAiProvider} 
                onDefaultAiProviderChange={handleDefaultAiProviderChange} 
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Categorized API Configuration */}
        <motion.div variants={itemVariants}>
          <Card className="border border-border/50 bg-background/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">API Configuration</CardTitle>
              <CardDescription>
                Organize and configure your API integrations by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryTabs
                providers={API_PROVIDERS}
                selectedProviders={selectedProviders}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCategory}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {filteredProviders.length > 0 ? (
                      <div className="grid gap-4">
                        {filteredProviders.map((provider, index) => (
                          <motion.div
                            key={provider.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ 
                              delay: index * 0.05,
                              type: "spring",
                              stiffness: 100,
                              damping: 15
                            }}
                          >
                            <ApiKeyInput provider={provider} />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No APIs match your current filters.</p>
                        <p className="text-sm">Try adjusting your search or category selection.</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </CategoryTabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Available Providers Section */}
        {availableProviders.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card className="border border-dashed border-neon-purple/30 bg-gradient-to-br from-background/50 to-neon-purple/5 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-neon-purple/20 p-2 border border-neon-purple/30">
                    <Key className="h-5 w-5 text-neon-purple" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold">Available Providers</CardTitle>
                    <CardDescription>
                      Additional API providers you can enable for enhanced functionality
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AvailableProviders 
                  providers={availableProviders} 
                  onToggleProvider={handleProviderToggle} 
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
