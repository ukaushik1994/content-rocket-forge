
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Plus } from 'lucide-react';

export interface SerpInteractiveCardProps {
  title: string;
  icon: React.ReactNode;
  variant?: string;
  children: React.ReactNode;
  onSelectAll?: () => void;
  onClearAll?: () => void;
}

export function SerpInteractiveCard({
  title,
  icon,
  variant = 'purple',
  children,
  onSelectAll,
  onClearAll
}: SerpInteractiveCardProps) {
  const getBgColor = () => {
    switch(variant) {
      case 'blue': return 'from-blue-900/20 via-black/20 to-black/30 border-blue-500/20';
      case 'green': return 'from-green-900/20 via-black/20 to-black/30 border-green-500/20';
      case 'amber': return 'from-amber-900/20 via-black/20 to-black/30 border-amber-500/20';
      default: return 'from-purple-900/20 via-black/20 to-black/30 border-purple-500/20';
    }
  };
  
  const getHeaderColor = () => {
    switch(variant) {
      case 'blue': return 'from-blue-500/10 to-blue-800/10 border-blue-500/10';
      case 'green': return 'from-green-500/10 to-green-800/10 border-green-500/10';
      case 'amber': return 'from-amber-500/10 to-amber-800/10 border-amber-500/10';
      default: return 'from-purple-500/10 to-purple-800/10 border-purple-500/10';
    }
  };
  
  const getButtonHoverColor = () => {
    switch(variant) {
      case 'blue': return 'hover:bg-blue-500/20';
      case 'green': return 'hover:bg-green-500/20';
      case 'amber': return 'hover:bg-amber-500/20';
      default: return 'hover:bg-purple-500/20';
    }
  };
  
  return (
    <Card className={`border shadow-lg bg-gradient-to-br ${getBgColor()} backdrop-blur-md overflow-hidden group`}>
      <CardHeader className={`bg-gradient-to-r ${getHeaderColor()} pb-3 border-b`}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-md flex items-center gap-2">
            {icon}
            <span>{title}</span>
          </CardTitle>
          <div className="flex gap-2">
            {onSelectAll && (
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-7 px-2 text-xs ${getButtonHoverColor()}`}
                onClick={onSelectAll}
              >
                <Check className="h-3 w-3 mr-1" />
                Select All
              </Button>
            )}
            
            {onClearAll && (
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-7 px-2 text-xs ${getButtonHoverColor()}`}
                onClick={onClearAll}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {children}
      </CardContent>
    </Card>
  );
}
