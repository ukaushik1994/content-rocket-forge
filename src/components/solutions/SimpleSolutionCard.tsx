import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Edit, FileText } from 'lucide-react';
import { Solution } from '@/contexts/content-builder/types';

interface SimpleSolutionCardProps {
  solution: Solution;
  onEdit: () => void;
}

export const SimpleSolutionCard: React.FC<SimpleSolutionCardProps> = ({ 
  solution,
  onEdit
}) => {
  const { name, logoUrl } = solution;

  // Get initials from name for fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      whileHover={{ 
        y: -2,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
      className="group relative h-full"
    >
      <Card className="glass-card h-full bg-background/40 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer">
        <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px] space-y-4">
          {/* Logo or Initials */}
          <div className="relative">
            {logoUrl ? (
              <div className="h-16 w-16 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center border border-white/20 shadow-lg">
                <img 
                  src={logoUrl} 
                  alt={`${name} logo`} 
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `
                      <div class="h-full w-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <span class="text-lg font-bold text-foreground">${getInitials(name)}</span>
                      </div>
                    `;
                  }}
                />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-white/20 shadow-lg">
                <span className="text-lg font-bold text-foreground">
                  {getInitials(name)}
                </span>
              </div>
            )}
          </div>

          {/* Solution Name */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground line-clamp-2 mb-2">
              {name}
            </h3>
          </div>

          {/* Edit Button */}
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-all duration-200 shadow-sm group-hover:shadow-md"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};