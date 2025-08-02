
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_PROVIDERS, ApiProvider } from './api/types';
import { getConfiguredServices } from '@/services/apiKeyService';
import { getUserPreference, saveUserPreference } from '@/services/userPreferencesService';
import { toast } from 'sonner';

// New minimal components
import { CompactStatusBar } from './api/CompactStatusBar';
import { InteractiveProviderGrid } from './api/InteractiveProviderGrid';
import { SlideoutConfigPanel } from './api/SlideoutConfigPanel';
import { FloatingSearch } from './api/FloatingSearch';

// Existing components for fallback
import { QuickSetupWizard } from './api/QuickSetupWizard';
import { DefaultAiProviderSelector } from './api/DefaultAiProviderSelector';

export function APISettings() {
  // State management
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [connectedProviders, setConnectedProviders] = useState<string[]>([]);
  const [errorProviders, setErrorProviders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showQuickSetup, setShowQuickSetup] = useState(false);
  const [defaultAiProvider, setDefaultAiProvider] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<ApiProvider | null>(null);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [showFloatingSearch, setShowFloatingSearch] = useState(false);
  
  // Load preferences and configured services
  useEffect(() => {
    const loadData = async () => {
      // Load default AI provider
      const savedProvider = getUserPreference('defaultAiProvider');
      if (savedProvider) {
        setDefaultAiProvider(savedProvider);
      } else {
        setDefaultAiProvider('openai');
      }
      
      // Load configured services
      try {
        const configured = await getConfiguredServices();
        setSelectedProviders(configured);
        setConnectedProviders(configured); // For now, assume configured = connected
      } catch (error) {
        console.error('Failed to load configured services:', error);
      }
    };
    
    loadData();
  }, []);
  
  // Event handlers
  const handleProviderToggle = (providerId: string) => {
    setSelectedProviders(prev => 
      prev.includes(providerId) 
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  const handleDefaultAiProviderChange = async (providerId: any) => {
    try {
      setDefaultAiProvider(providerId);
      const success = await saveUserPreference('defaultAiProvider', providerId);
      if (success) {
        toast.success(`${API_PROVIDERS.find(p => p.id === providerId)?.name} set as default AI provider`);
      } else {
        toast.error('Failed to save default AI provider');
      }
    } catch (error) {
      toast.error('Failed to update default AI provider');
      console.error('Error setting default AI provider:', error);
    }
  };

  const handleProviderClick = (provider: ApiProvider) => {
    setSelectedProvider(provider);
    setShowConfigPanel(true);
  };

  const handleRefreshAll = async () => {
    try {
      // Reload configured services
      const configured = await getConfiguredServices();
      setSelectedProviders(configured);
      setConnectedProviders(configured);
      toast.success('Provider statuses refreshed');
    } catch (error) {
      toast.error('Failed to refresh statuses');
    }
  };

  // Get available categories for filtering
  const availableCategories = Array.from(new Set(API_PROVIDERS.map(p => p.category).filter(Boolean)));

  // Filtered providers based on search and filters
  const filteredProviders = API_PROVIDERS.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilters = selectedFilters.length === 0 || 
                          selectedFilters.some(filter => {
                            switch (filter) {
                              case 'connected':
                                return connectedProviders.includes(provider.id);
                              case 'configured':
                                return selectedProviders.includes(provider.id);
                              case 'unconfigured':
                                return !selectedProviders.includes(provider.id);
                              case 'required':
                                return provider.required;
                              default:
                                return provider.category === filter;
                            }
                          });
    
    return matchesSearch && matchesFilters;
  });

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
    <motion.div 
      className="relative space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Quick Setup Wizard */}
      <QuickSetupWizard 
        isOpen={showQuickSetup}
        onClose={() => setShowQuickSetup(false)}
        providers={API_PROVIDERS}
        onProviderSelect={handleProviderToggle}
      />

      {/* Compact Status Bar */}
      <motion.div variants={itemVariants}>
        <CompactStatusBar
          totalProviders={API_PROVIDERS.length}
          connectedProviders={connectedProviders.length}
          errorProviders={errorProviders.length}
          onRefresh={handleRefreshAll}
          onQuickSetup={() => setShowQuickSetup(true)}
        />
      </motion.div>

      {/* Default AI Provider Selector */}
      {connectedProviders.some(id => API_PROVIDERS.find(p => p.id === id)?.category === 'AI') && (
        <motion.div variants={itemVariants}>
          <DefaultAiProviderSelector
            defaultAiProvider={defaultAiProvider as any}
            onDefaultAiProviderChange={handleDefaultAiProviderChange}
          />
        </motion.div>
      )}

      {/* Interactive Provider Grid */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">API Integrations</h3>
            <p className="text-sm text-muted-foreground">
              Click any provider to configure
            </p>
          </div>
          {(searchQuery || selectedFilters.length > 0) && (
            <p className="text-sm text-muted-foreground">
              {filteredProviders.length} of {API_PROVIDERS.length} providers
            </p>
          )}
        </div>

        <InteractiveProviderGrid
          selectedProviders={selectedProviders}
          connectedProviders={connectedProviders}
          errorProviders={errorProviders}
          defaultAiProvider={defaultAiProvider}
          onProviderClick={handleProviderClick}
          onSetDefault={handleDefaultAiProviderChange}
        />
      </motion.div>

      {/* Slideout Configuration Panel */}
      <SlideoutConfigPanel
        provider={selectedProvider}
        isOpen={showConfigPanel}
        onClose={() => {
          setShowConfigPanel(false);
          setSelectedProvider(null);
        }}
        onSetDefault={handleDefaultAiProviderChange}
        defaultAiProvider={defaultAiProvider}
      />

      {/* Floating Search */}
      <FloatingSearch
        isOpen={showFloatingSearch}
        onToggle={() => setShowFloatingSearch(!showFloatingSearch)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedFilters={selectedFilters}
        onFilterChange={setSelectedFilters}
        availableCategories={availableCategories}
      />
    </motion.div>
  );
}
