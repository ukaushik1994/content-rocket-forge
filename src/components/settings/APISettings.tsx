
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
import { Key } from 'lucide-react';

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

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Card className="glass-panel bg-glass border border-white/10 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-neon-purple/20 p-2">
                <Key className="h-5 w-5 text-neon-purple" />
              </div>
              <div>
                <CardTitle className="text-gradient">API Configuration</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage your API keys and provider settings for content generation.
                </CardDescription>
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
      
      <motion.div variants={itemVariants}>
        <DefaultAiProviderSelector 
          defaultAiProvider={defaultAiProvider} 
          onDefaultAiProviderChange={handleDefaultAiProviderChange} 
        />
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4">
        {filteredProviders.map((provider, index) => (
          <motion.div
            key={provider.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ApiKeyInput provider={provider} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <AvailableProviders 
          providers={availableProviders} 
          onToggleProvider={handleProviderToggle} 
        />
      </motion.div>
    </motion.div>
  );
}
