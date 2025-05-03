
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface SerpFeatureProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onAddToContent?: () => void;
  variant?: 'default' | 'purple' | 'blue' | 'green';
}

export function SerpFeature({ 
  title, 
  icon, 
  children, 
  onAddToContent,
  variant = 'default'
}: SerpFeatureProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const getGradient = () => {
    switch(variant) {
      case 'purple':
        return 'hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-purple-700/5';
      case 'blue':
        return 'hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-blue-700/5';
      case 'green':
        return 'hover:bg-gradient-to-br hover:from-green-500/10 hover:to-green-700/5';
      default:
        return 'hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card 
        className={`glass-panel transition-all duration-300 border-white/10 ${getGradient()} ${isHovered ? 'shadow-lg' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className={`flex flex-row items-center justify-between pb-2 ${isHovered ? 'border-b border-white/5' : ''}`}>
          <CardTitle className="text-md font-medium flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          {onAddToContent && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onAddToContent} 
              className={`h-8 px-2 text-xs transition-all duration-300 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            >
              <PlusCircle className="h-3 w-3 mr-1" />
              Add to Content
            </Button>
          )}
        </CardHeader>
        <CardContent className="transition-all duration-300">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}
