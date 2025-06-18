
import React, { useState, useEffect } from 'react';
import { ApiKeyInput } from './api/ApiKeyInput';
import { AvailableProviders } from './api/AvailableProviders';
import { ApiSettingsHeader } from './api/ApiSettingsHeader';
import { API_PROVIDERS } from './api/types';
import { DefaultAiProviderSelector } from './api/DefaultAiProviderSelector';
import { getUserPreference, saveUserPreference } from '@/services/userPreferencesService';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, Zap, Shield, Sparkles } from 'lucide-react';

export function APISettings() {
  const [selectedProviders, setSelectedProviders] = useState<string[]>(
    API_PROVIDERS.filter(p => p.required).map(p => p.id)
  );
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleDefaultAiProviderChange = async (provider: 'openai' | 'anthropic' | 'gemini') => {
    setDefaultAiProvider(provider);
    const success = await saveUserPreference('defaultAiProvider', provider);
    if (success) {
      toast.success(`Default AI provider set to ${provider}`);
    } else {
      toast.error('Failed to save default AI provider');
    }
  };

  const filteredProviders = API_PROVIDERS.filter(provider => 
    (provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     provider.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (provider.required || selectedProviders.includes(provider.id))
  );

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
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-neon-purple/10 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-neon-blue/10 blur-3xl animate-pulse"></div>
      </div>

      <motion.div 
        className="relative z-10 space-y-8 max-w-6xl mx-auto"
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
            <CardHeader className="pb-8 pt-8">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-neon-purple/30 blur-lg"></div>
                      <div className="relative rounded-full bg-neon-purple/20 p-3 border border-neon-purple/30">
                        <Key className="h-6 w-6 text-neon-purple" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold bg-gradient-to-r from-neon-purple via-white to-neon-blue bg-clip-text text-transparent">
                        API Integration Hub
                      </CardTitle>
                      <CardDescription className="text-lg text-muted-foreground mt-2">
                        Connect and manage your third-party API integrations to unlock powerful content generation capabilities.
                      </CardDescription>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-neon-blue/20 px-3 py-1 rounded-full border border-neon-blue/30">
                    <Shield className="h-4 w-4 text-neon-blue" />
                    <span className="text-sm font-medium text-neon-blue">Secure</span>
                  </div>
                  <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                    <Zap className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-green-400">Live</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ApiSettingsHeader 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onDisplayOptionChange={handleDisplayOptionChange}
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

        {/* API Keys Grid */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-8 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full"></div>
            <h3 className="text-lg font-semibold text-foreground">API Keys Configuration</h3>
          </div>
          
          <div className="grid gap-6">
            {filteredProviders.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                className="transform transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <ApiKeyInput provider={provider} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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
