
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomBadge } from '@/components/ui/custom-badge';
import { motion } from 'framer-motion';
import { BookmarkIcon, CheckCircle, ExternalLink, Target, Trash2, Users, Zap } from 'lucide-react';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';

interface EnhancedSolutionCardProps {
  solution: EnhancedSolution;
  onUseInContent: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const EnhancedSolutionCard: React.FC<EnhancedSolutionCardProps> = ({ 
  solution,
  onUseInContent,
  onEdit,
  onDelete
}) => {
  const { name, features, useCases, painPoints, targetAudience, logoUrl, externalUrl, resources } = solution;

  // Get background gradient based on solution name (for visual variety)
  const getGradient = (name: string) => {
    const charCode = name.charCodeAt(0) % 5;
    const gradients = [
      'from-neon-purple/20 to-neon-blue/10',
      'from-neon-blue/20 to-neon-pink/10',
      'from-neon-pink/20 to-neon-purple/10',
      'from-neon-orange/20 to-neon-purple/10',
      'from-neon-blue/20 to-neon-orange/10'
    ];
    return gradients[charCode];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      whileHover={{ 
        y: -5,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
      className="group relative"
    >
      <Card className={`card-3d overflow-hidden border border-white/10 bg-gradient-to-br ${getGradient(name)} h-full`}>
        <div className="absolute inset-0 bg-glass backdrop-blur-sm" />
        
        <CardContent className="relative z-10 p-6 space-y-5">
          <div className="flex justify-between items-start">
            <div className="flex gap-3 items-center">
              {logoUrl ? (
                <div className="h-10 w-10 rounded-md overflow-hidden bg-white/20 flex items-center justify-center">
                  <img 
                    src={logoUrl} 
                    alt={`${name} logo`} 
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Logo';
                    }} 
                  />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-md bg-white/10 flex items-center justify-center">
                  <BookmarkIcon className="h-5 w-5 text-white/70" />
                </div>
              )}
              <h3 className="text-gradient text-xl font-bold truncate pr-4 flex-1">{name}</h3>
            </div>
            
            {externalUrl && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-60 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(externalUrl, '_blank');
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-1.5 mb-2 text-sm font-medium text-muted-foreground">
                <Zap className="h-4 w-4 text-neon-purple" />
                <span>Key Features</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-1">
                {features.slice(0, 3).map((feature, i) => (
                  <CustomBadge key={i} className="bg-neon-purple/10 text-foreground border border-neon-purple/30">
                    {feature}
                  </CustomBadge>
                ))}
                {features.length > 3 && (
                  <CustomBadge className="bg-background/70 text-muted-foreground">
                    +{features.length - 3} more
                  </CustomBadge>
                )}
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-1.5 mb-2 text-sm font-medium text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Use Cases</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-1">
                {useCases.slice(0, 2).map((useCase, i) => (
                  <CustomBadge key={i} className="bg-green-500/10 text-foreground border border-green-500/30">
                    {useCase}
                  </CustomBadge>
                ))}
                {useCases.length > 2 && (
                  <CustomBadge className="bg-background/70 text-muted-foreground">
                    +{useCases.length - 2} more
                  </CustomBadge>
                )}
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-1.5 mb-2 text-sm font-medium text-muted-foreground">
                <Target className="h-4 w-4 text-neon-blue" />
                <span>Target Audience</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {targetAudience.slice(0, 2).map((audience, i) => (
                  <CustomBadge key={i} className="bg-neon-blue/10 text-foreground border border-neon-blue/30">
                    {audience}
                  </CustomBadge>
                ))}
                {targetAudience.length > 2 && (
                  <CustomBadge className="bg-background/70 text-muted-foreground">
                    +{targetAudience.length - 2} more
                  </CustomBadge>
                )}
              </div>
            </div>
            
            {resources && resources.length > 0 && (
              <div className="border-t border-white/10 pt-3 mt-3">
                <div className="text-sm font-medium mb-2">Resources</div>
                <div className="space-y-1.5">
                  {resources.slice(0, 2).map((resource, index) => (
                    <a 
                      key={index} 
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm flex items-center gap-2 text-neon-blue hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {resource.title}
                    </a>
                  ))}
                  {resources.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{resources.length - 2} more resources
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="relative z-10 border-t border-white/10 p-6 pt-4 flex justify-between">
          <Button 
            size="sm" 
            variant="outline"
            onClick={onEdit}
            className="bg-background/50 backdrop-blur-sm"
          >
            Edit
          </Button>
          
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
            onClick={onUseInContent}
          >
            Use in Content
          </Button>
        </CardFooter>
      </Card>
      
      {/* Admin actions that appear on hover */}
      <motion.div 
        className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
      >
        <Button 
          variant="destructive" 
          size="sm" 
          className="h-8 w-8 rounded-full shadow-lg"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
};
