import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ExternalLink, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiProvider } from './types';

interface QuickSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  providers: ApiProvider[];
  onProviderSelect: (providerId: string) => void;
}

export const QuickSetupWizard = ({ isOpen, onClose, providers, onProviderSelect }: QuickSetupWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);

  const steps = [
    {
      title: 'Welcome to API Setup',
      description: 'Let\'s get you started with the essential API integrations for your content creation workflow.',
      content: 'welcome'
    },
    {
      title: 'Choose Your AI Provider',
      description: 'Select your primary AI service for content generation.',
      content: 'ai-providers'
    },
    {
      title: 'SEO & Analytics Setup',
      description: 'Configure search and analytics tools for content optimization.',
      content: 'seo-providers'
    },
    {
      title: 'Setup Complete',
      description: 'Review your selections and start configuring your APIs.',
      content: 'summary'
    }
  ];

  const aiProviders = providers.filter(p => p.category === 'AI Services');
  const seoProviders = providers.filter(p => p.category === 'SEO & Analytics');

  const handleProviderToggle = (providerId: string) => {
    setSelectedProviders(prev => 
      prev.includes(providerId) 
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  const handleFinish = () => {
    selectedProviders.forEach(providerId => {
      onProviderSelect(providerId);
    });
    onClose();
    setCurrentStep(0);
    setSelectedProviders([]);
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.content) {
      case 'welcome':
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-neon-purple/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-neon-purple" />
            </div>
            <p className="text-muted-foreground">
              This wizard will help you configure the most important API integrations for content creation, 
              SEO analysis, and workflow automation.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-muted/50 rounded-lg">
                <strong>Recommended:</strong> OpenRouter (AI), SERP API (SEO)
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <strong>Optional:</strong> Additional AI providers, analytics tools
              </div>
            </div>
          </div>
        );

      case 'ai-providers':
        return (
          <div className="space-y-4">
            <div className="grid gap-3">
              {aiProviders.map(provider => {
                const Icon = provider.icon;
                const isSelected = selectedProviders.includes(provider.id);
                
                return (
                  <Card 
                    key={provider.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-neon-purple/50 bg-neon-purple/10' 
                        : 'border-border hover:border-neon-purple/30'
                    }`}
                    onClick={() => handleProviderToggle(provider.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-background">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{provider.name}</h4>
                            {provider.required && (
                              <Badge variant="secondary" className="text-xs">Required</Badge>
                            )}
                            {isSelected && (
                              <CheckCircle2 className="h-4 w-4 text-neon-purple" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{provider.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(provider.link, '_blank');
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 'seo-providers':
        return (
          <div className="space-y-4">
            <div className="grid gap-3">
              {seoProviders.map(provider => {
                const Icon = provider.icon;
                const isSelected = selectedProviders.includes(provider.id);
                
                return (
                  <Card 
                    key={provider.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-neon-purple/50 bg-neon-purple/10' 
                        : 'border-border hover:border-neon-purple/30'
                    }`}
                    onClick={() => handleProviderToggle(provider.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-background">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{provider.name}</h4>
                            {provider.required && (
                              <Badge variant="secondary" className="text-xs">Required</Badge>
                            )}
                            {isSelected && (
                              <CheckCircle2 className="h-4 w-4 text-neon-purple" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{provider.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(provider.link, '_blank');
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <p className="text-muted-foreground mb-6">
                You've selected {selectedProviders.length} API provider{selectedProviders.length !== 1 ? 's' : ''} to configure.
              </p>
            </div>
            
            {selectedProviders.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Selected Providers:</h4>
                <div className="grid gap-2">
                  {selectedProviders.map(providerId => {
                    const provider = providers.find(p => p.id === providerId);
                    if (!provider) return null;
                    
                    const Icon = provider.icon;
                    
                    return (
                      <div key={providerId} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{provider.name}</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {provider.category}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-300">
                <strong>Next steps:</strong> You'll be taken to the API settings page where you can 
                configure each selected provider with your API keys.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {steps[currentStep].title}
            <Badge variant="outline" className="ml-auto">
              {currentStep + 1} of {steps.length}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {steps[currentStep].description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleFinish} className="bg-neon-purple hover:bg-neon-purple/80">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Start Configuration
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};