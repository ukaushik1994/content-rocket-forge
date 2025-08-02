import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_PROVIDERS, ApiProvider } from './types';
import { CheckCircle, AlertTriangle, XCircle, Settings, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface InteractiveProviderGridProps {
  selectedProviders: string[];
  connectedProviders: string[];
  errorProviders: string[];
  defaultAiProvider?: string;
  onProviderClick: (provider: ApiProvider) => void;
  onSetDefault?: (providerId: string) => void;
}

export const InteractiveProviderGrid: React.FC<InteractiveProviderGridProps> = ({
  selectedProviders,
  connectedProviders,
  errorProviders,
  defaultAiProvider,
  onProviderClick,
  onSetDefault
}) => {
  const [hoveredProvider, setHoveredProvider] = useState<string | null>(null);

  const getProviderStatus = (providerId: string) => {
    if (connectedProviders.includes(providerId)) return 'connected';
    if (errorProviders.includes(providerId)) return 'error';
    if (selectedProviders.includes(providerId)) return 'configured';
    return 'unconfigured';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'configured':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'border-emerald-500/50 bg-emerald-500/10';
      case 'error':
        return 'border-red-500/50 bg-red-500/10';
      case 'configured':
        return 'border-amber-500/50 bg-amber-500/10';
      default:
        return 'border-white/10 bg-white/5';
    }
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {API_PROVIDERS.map((provider) => {
          const status = getProviderStatus(provider.id);
          const isDefault = defaultAiProvider === provider.id;
          const isHovered = hoveredProvider === provider.id;

          return (
            <Tooltip key={provider.id}>
              <TooltipTrigger asChild>
                <motion.div
                  className={`relative cursor-pointer rounded-lg border transition-all duration-200 ${getStatusColor(status)}`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onHoverStart={() => setHoveredProvider(provider.id)}
                  onHoverEnd={() => setHoveredProvider(null)}
                  onClick={() => onProviderClick(provider)}
                >
                  {/* Provider Icon */}
                  <div className="p-4 flex flex-col items-center space-y-2">
                    <div className="relative">
                      <provider.icon className="h-8 w-8 text-foreground" />
                      
                      {/* Status Badge */}
                      <div className="absolute -top-1 -right-1">
                        {getStatusIcon(status)}
                      </div>
                      
                      {/* Default AI Badge */}
                      {isDefault && (
                        <div className="absolute -bottom-1 -right-1">
                          <Star className="h-3 w-3 text-neon-purple fill-current" />
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs font-medium text-center truncate w-full">
                      {provider.name}
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-glass backdrop-blur-sm rounded-lg border border-neon-purple/30 flex items-center justify-center"
                      >
                        <Settings className="h-5 w-5 text-neon-purple" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Required Badge */}
                  {provider.required && (
                    <div className="absolute top-1 left-1">
                      <div className="w-2 h-2 rounded-full bg-neon-purple animate-pulse" />
                    </div>
                  )}
                </motion.div>
              </TooltipTrigger>
              
              <TooltipContent side="bottom" className="max-w-xs">
                <div className="space-y-2">
                  <div className="font-medium">{provider.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {provider.description}
                  </div>
                  <div className="text-xs">
                    Status: <span className="capitalize font-medium">{status}</span>
                  </div>
                  {provider.category && (
                    <div className="text-xs">
                      Category: <span className="font-medium">{provider.category}</span>
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};